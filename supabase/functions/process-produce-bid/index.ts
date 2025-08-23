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
    const { produce_id, bid_amount, bid_quantity, card_token, distributor_id } = await req.json()
    
    console.log('Edge Function received:', { produce_id, bid_amount, bid_quantity, card_token, distributor_id })
    console.log('Data types:', { 
      bid_amount_type: typeof bid_amount, 
      bid_quantity_type: typeof bid_quantity,
      bid_amount_value: bid_amount,
      bid_quantity_value: bid_quantity
    })
    
    // Simple test response to see if function is working
    console.log('About to validate required fields...')

    // Validate required fields
    console.log('Validating required fields...')
    if (!produce_id || !bid_amount || !bid_quantity || !card_token || !distributor_id) {
      console.log('Validation failed - missing fields')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: produce_id, bid_amount, bid_quantity, card_token, distributor_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    console.log('Required fields validation passed')

    // Get produce details to check if it's still available
    console.log('About to query farmer_listings table...')
    
    // First, let's see what columns exist in the table
    const { data: produce, error: produceError } = await supabase
      .from('farmer_listings')
      .select('*')
      .eq('id', produce_id)
      .single()
    
    console.log('Produce query result:', { produce, produceError })
    
    // Check if produce exists (don't filter by status for now)
    if (produceError || !produce) {
      console.log('Produce not found')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Produce not found' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Produce found:', produce)

    if (produceError || !produce) {
      console.log('Produce query error:', produceError)
      console.log('Produce data:', produce)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Produce not found or not available for bidding' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Produce found:', produce)

    // Skip distributor profile check - just use the user ID directly
    const distributor = { id: distributor_id }; // Use user ID as distributor ID

    // Check if quantity is available
    const availableQuantity = parseFloat(produce.quantity.replace(/[^\d.]/g, ''))
    if (bid_quantity > availableQuantity) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Cannot bid for ${bid_quantity}kg when only ${availableQuantity}kg is available` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get current highest bid to validate minimum bid
    const { data: currentBids, error: bidsError } = await supabase
      .from('distributor_bids')
      .select('bid_amount, bid_quantity')
      .eq('produce_id', produce_id)
      .eq('status', 'pending')
      .order('bid_amount', { ascending: false })
      .limit(1)

    if (bidsError) {
      console.error('Error fetching current bids:', bidsError)
    }

    console.log('Raw produce price:', produce.price)
    const farmerPrice = parseFloat(produce.price.replace(/[^\d.]/g, ''))
    console.log('Parsed farmer price:', farmerPrice)
    
    const currentHighestBid = currentBids && currentBids.length > 0 
      ? parseFloat(currentBids[0].bid_amount) 
      : 0
    console.log('Current highest bid:', currentHighestBid)
    
    const minBid = Math.max(farmerPrice, currentHighestBid)
    console.log('Minimum bid required:', minBid)
    console.log('Bid amount received:', bid_amount)
    console.log('Bid validation:', bid_amount >= minBid ? 'PASS' : 'FAIL')
    
    // Ensure bid_amount is a number for comparison
    const numericBidAmount = parseFloat(bid_amount)
    console.log('Numeric bid amount:', numericBidAmount)
    
    if (numericBidAmount < minBid) {
      console.log('Bid validation failed - bid too low')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Bid must be at least ₹${minBid}/kg` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Bid validation passed - proceeding to create bid')

    // Create the bid record
    const { data: newBid, error: bidError } = await supabase
      .from('distributor_bids')
      .insert({
        distributor_id: distributor_id, // Use the user ID directly
        produce_id,
        bid_amount: parseFloat(bid_amount),
        bid_quantity: parseFloat(bid_quantity),
        status: 'pending',
        card_token,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (bidError) {
      console.error('Error creating bid:', bidError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create bid' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if this bid replaces any existing bids
    const { data: existingBids, error: existingBidsError } = await supabase
      .from('distributor_bids')
      .select('*')
      .eq('produce_id', produce_id)
      .eq('status', 'pending')

    if (!existingBidsError && existingBids && existingBids.length > 0) {
      // Calculate bid score (price * quantity for better comparison)
      const newBidScore = parseFloat(bid_amount) * parseFloat(bid_quantity)
      
      // Find bids that should be replaced (lower score)
      const bidsToReplace = existingBids.filter(bid => {
        const bidScore = parseFloat(bid.bid_amount) * parseFloat(bid.bid_quantity)
        return bidScore < newBidScore && bid.id !== newBid.id
      })

      // Update lower bids to replaced status
      if (bidsToReplace.length > 0) {
        const bidIds = bidsToReplace.map(bid => bid.id)
        
        const { error: updateError } = await supabase
          .from('distributor_bids')
          .update({ 
            status: 'replaced',
            replaced_at: new Date().toISOString(),
            replaced_by_bid: newBid.id
          })
          .in('id', bidIds)

        if (updateError) {
          console.warn('Could not update lower bids:', updateError)
        } else {
          console.log(`${bidsToReplace.length} distributors have been outbid`)
        }
      }
    }

    // Update produce listing bid count
    await supabase
      .from('farmer_listings')
      .update({ 
        current_bids: (produce.current_bids || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', produce_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bid placed successfully',
        bid_id: newBid.id,
        replaced_bids: existingBids ? existingBids.filter(bid => bid.status === 'replaced').length : 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing bid:', error)
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
