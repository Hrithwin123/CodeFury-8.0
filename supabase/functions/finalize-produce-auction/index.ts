import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { produce_id } = await req.json()

    // Validate required fields
    if (!produce_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required field: produce_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get produce details
    const { data: produce, error: produceError } = await supabase
      .from('farmer_listings')
      .select('*')
      .eq('id', produce_id)
      .eq('status', 'active')
      .single()

    if (produceError || !produce) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Produce not found or not active' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if auction has ended
    if (produce.auction_end_time) {
      const now = new Date()
      const auctionEnd = new Date(produce.auction_end_time)
      
      if (now < auctionEnd) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Auction has not ended yet' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Get all pending bids for this produce
    const { data: pendingBids, error: bidsError } = await supabase
      .from('distributor_bids')
      .select('*')
      .eq('produce_id', produce_id)
      .eq('status', 'pending')
      .order('bid_amount', { ascending: false })

    if (bidsError) {
      console.error('Error fetching pending bids:', bidsError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch bids' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!pendingBids || pendingBids.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No pending bids found for this produce' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find the winning bid (highest bid score = price × quantity)
    const winningBid = pendingBids.reduce((highest, current) => {
      const highestScore = parseFloat(highest.bid_amount) * parseFloat(highest.bid_quantity)
      const currentScore = parseFloat(current.bid_amount) * parseFloat(current.bid_quantity)
      return currentScore > highestScore ? current : highest
    })

    // Get farmer's payment configuration
    const { data: paymentConfig, error: configError } = await supabase
      .from('payment_configurations')
      .select('razorpay_key_id, razorpay_key_secret')
      .eq('seller_id', produce.user_id)
      .eq('is_active', true)
      .single()

    if (configError || !paymentConfig) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Farmer payment configuration not found' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Here you would integrate with Razorpay to charge the winning bidder
    // For now, we'll just mark the bid as accepted and update the produce status
    
    // Accept the winning bid
    const { error: acceptError } = await supabase
      .from('distributor_bids')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', winningBid.id)

    if (acceptError) {
      console.error('Error accepting winning bid:', acceptError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to accept winning bid' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Reject all other pending bids
    const otherBidIds = pendingBids
      .filter(bid => bid.id !== winningBid.id)
      .map(bid => bid.id)

    if (otherBidIds.length > 0) {
      const { error: rejectError } = await supabase
        .from('distributor_bids')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .in('id', otherBidIds)

      if (rejectError) {
        console.warn('Could not reject other bids:', rejectError)
      }
    }

    // Update produce listing status
    const { error: updateError } = await supabase
      .from('farmer_listings')
      .update({ 
        status: 'auction_ended',
        winning_bid_id: winningBid.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', produce_id)

    if (updateError) {
      console.error('Error updating produce status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Auction finalized successfully',
        winning_bid: {
          id: winningBid.id,
          amount: winningBid.bid_amount,
          quantity: winningBid.bid_quantity,
          distributor_id: winningBid.distributor_id
        },
        total_bids: pendingBids.length,
        rejected_bids: otherBidIds.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error finalizing auction:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
