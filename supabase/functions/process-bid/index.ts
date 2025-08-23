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
    const { equipment_id, bid_amount, card_token } = await req.json()
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) throw new Error('Invalid user')

    // Verify user is a distributor
    const { data: distributor, error: distributorError } = await supabaseClient
      .from('distributors')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (distributorError || !distributor) {
      throw new Error('User is not a distributor')
    }

    // Check if auction is active
    const { data: auction, error: auctionError } = await supabaseClient
      .from('auction_sessions')
      .select('*')
      .eq('equipment_id', equipment_id)
      .eq('status', 'active')
      .single()

    if (auctionError || !auction) {
      throw new Error('No active auction found for this equipment')
    }

    // Check if auction has ended
    if (new Date() > new Date(auction.end_time)) {
      throw new Error('Auction has already ended')
    }

    // Check if bid amount is valid
    if (bid_amount <= 0) {
      throw new Error('Bid amount must be greater than 0')
    }

    // Deactivate any existing bids from this distributor for this equipment
    await supabaseClient
      .from('bids')
      .update({ is_active: false })
      .eq('equipment_id', equipment_id)
      .eq('distributor_id', distributor.id)

    // Insert new bid
    const { data: newBid, error: insertError } = await supabaseClient
      .from('bids')
      .insert({
        equipment_id,
        distributor_id: distributor.id,
        bid_amount,
        card_token,
        bid_status: 'pending',
        is_active: true
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Create payment record
    await supabaseClient
      .from('payments')
      .insert({
        bid_id: newBid.id,
        amount: bid_amount,
        status: 'pending'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bid placed successfully',
        bid_id: newBid.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

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
