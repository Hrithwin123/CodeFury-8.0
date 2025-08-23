import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { equipment_id } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) throw new Error('Invalid user')

    // Verify user is the seller of this equipment
    const { data: equipment, error: equipmentError } = await supabaseClient
      .from('equipment_listings')
      .select('*')
      .eq('id', equipment_id)
      .eq('seller_id', user.id)
      .single()

    if (equipmentError || !equipment) {
      throw new Error('Equipment not found or you are not the seller')
    }

    // Check if auction exists and has ended
    const { data: auction, error: auctionError } = await supabaseClient
      .from('auction_sessions')
      .select('*')
      .eq('equipment_id', equipment_id)
      .eq('status', 'active')
      .single()

    if (auctionError || !auction) {
      throw new Error('No active auction found for this equipment')
    }

    if (new Date() <= new Date(auction.end_time)) {
      throw new Error('Auction has not ended yet')
    }

    // Get the highest bid
    const { data: winningBid, error: bidError } = await supabaseClient
      .from('bids')
      .select('*')
      .eq('equipment_id', equipment_id)
      .eq('is_active', true)
      .order('bid_amount', { ascending: false })
      .limit(1)
      .single()

    if (bidError || !winningBid) {
      // No bids, end auction without winner
      await supabaseClient
        .from('auction_sessions')
        .update({ 
          status: 'ended',
          winner_bid_id: null
        })
        .eq('id', auction.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Auction ended with no bids' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Check if reserve price is met
    if (auction.reserve_price && winningBid.bid_amount < auction.reserve_price) {
      // Reserve price not met, end auction without winner
      await supabaseClient
        .from('auction_sessions')
        .update({ 
          status: 'ended',
          winner_bid_id: null
        })
        .eq('id', auction.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Auction ended - reserve price not met' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Process payment for winner
    try {
      // Get the seller's Razorpay configuration
      const { data: paymentConfig, error: configError } = await supabaseClient
        .from('payment_configurations')
        .select('razorpay_key_id, razorpay_key_secret')
        .eq('seller_id', user.id)
        .eq('is_active', true)
        .single()

      if (configError || !paymentConfig) {
        throw new Error('Seller has not configured Razorpay payment settings')
      }

      const razorpayKeyId = paymentConfig.razorpay_key_id
      const razorpayKeySecret = paymentConfig.razorpay_key_secret

      // Create Razorpay order
      const orderData = {
        amount: Math.round(winningBid.bid_amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `bid_${winningBid.id}`,
        notes: {
          bid_id: winningBid.id,
          equipment_id: equipment_id
        }
      }

      const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`
        },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create Razorpay order')
      }

      const orderResult = await orderResponse.json()

      // Update payment record with order ID
      await supabaseClient
        .from('payments')
        .update({
          razorpay_order_id: orderResult.id,
          status: 'pending'
        })
        .eq('bid_id', winningBid.id)

      // Update bid statuses
      await supabaseClient
        .from('bids')
        .update({ bid_status: 'won' })
        .eq('id', winningBid.id)

      await supabaseClient
        .from('bids')
        .update({ bid_status: 'lost' })
        .eq('equipment_id', equipment_id)
        .neq('id', winningBid.id)

      // End auction session
      await supabaseClient
        .from('auction_sessions')
        .update({
          status: 'ended',
          winner_bid_id: winningBid.id
        })
        .eq('id', auction.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Auction finalized successfully',
          winner_bid_id: winningBid.id,
          order_id: orderResult.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } catch (paymentError) {
      // If payment processing fails, still end the auction but mark as failed
      await supabaseClient
        .from('auction_sessions')
        .update({ 
          status: 'ended',
          winner_bid_id: null
        })
        .eq('id', auction.id)

      throw new Error(`Payment processing failed: ${paymentError.message}`)
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
