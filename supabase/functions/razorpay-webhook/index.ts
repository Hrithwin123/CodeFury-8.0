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
    // Verify webhook signature
    const signature = req.headers.get('x-razorpay-signature')
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      throw new Error('Missing webhook signature or secret')
    }

    // Note: In production, you should verify the HMAC signature here
    // For now, we'll proceed with basic validation

    const payload = await req.json()
    const event = payload.event
    const eventPayload = payload.payload

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabaseClient, eventPayload)
        break
      case 'payment.failed':
        await handlePaymentFailed(supabaseClient, eventPayload)
        break
      case 'refund.processed':
        await handleRefundProcessed(supabaseClient, eventPayload)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
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

async function handlePaymentCaptured(supabaseClient, payload) {
  const payment = payload.payment.entity
  
  // Find the payment record by order ID
  const { data: paymentRecord, error } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('razorpay_order_id', payment.order_id)
    .single()

  if (error || !paymentRecord) {
    console.error('Payment record not found:', payment.order_id)
    return
  }

  // Update payment status
  await supabaseClient
    .from('payments')
    .update({
      razorpay_payment_id: payment.id,
      status: 'success',
      payment_method: payment.method
    })
    .eq('id', paymentRecord.id)
}

async function handlePaymentFailed(supabaseClient, payload) {
  const payment = payload.payment.entity
  
  const { data: paymentRecord, error } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('razorpay_order_id', payment.order_id)
    .single()

  if (error || !paymentRecord) return

  await supabaseClient
    .from('payments')
    .update({ status: 'failed' })
    .eq('id', paymentRecord.id)
}

async function handleRefundProcessed(supabaseClient, payload) {
  const refund = payload.refund.entity
  
  const { data: paymentRecord, error } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('razorpay_payment_id', refund.payment_id)
    .single()

  if (error || !paymentRecord) return

  await supabaseClient
    .from('payments')
    .update({ status: 'refunded' })
    .eq('id', paymentRecord.id)
}
