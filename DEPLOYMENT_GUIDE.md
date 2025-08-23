# Bidding System Deployment Guide

This guide will help you deploy the complete bidding system with Supabase Edge Functions and Razorpay integration.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with Edge Functions enabled
2. **Razorpay Account**: Sign up for a Razorpay account (test mode is fine for development)
3. **Node.js**: Version 16 or higher
4. **Supabase CLI**: Install the Supabase CLI

## Step 1: Database Setup

1. **Run the database migration**:
   ```sql
   -- Execute this in your Supabase SQL editor
   \i create_bidding_system_tables.sql
   ```

2. **Verify tables are created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('bids', 'payments', 'auction_sessions');
   ```

## Step 2: Supabase Edge Functions Setup

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g @supabase/cli
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy process-bid
   supabase functions deploy finalize-auction
   supabase functions deploy razorpay-webhook
   ```

## Step 3: Environment Variables Setup

1. **Frontend Environment Variables**:
   Create a `.env` file in your project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   ```

2. **Supabase Edge Functions Environment Variables**:
   Set these in your Supabase dashboard under Settings > Edge Functions:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Step 4: Razorpay Configuration

1. **Get Test API Keys**:
   - Log into your Razorpay dashboard
   - Go to Settings > API Keys
   - Generate a new key pair for test mode
   - Copy the Key ID and Key Secret

2. **Set Up Webhook**:
   - In Razorpay dashboard, go to Settings > Webhooks
   - Add a new webhook with URL: `https://your-project.supabase.co/functions/v1/razorpay-webhook`
   - Select events: `payment.captured`, `payment.failed`, `refund.processed`
   - Copy the webhook secret

## Step 5: Frontend Integration

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Add Razorpay Script**:
   Add this to your `index.html`:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

3. **Import Components**:
   ```jsx
   import BiddingSystem from './components/BiddingSystem';
   import AuctionManagement from './components/AuctionManagement';
   ```

## Step 6: Testing the System

1. **Test Bid Placement**:
   - Create an auction as an equipment seller
   - Place a bid as a distributor
   - Verify payment flow (use test card numbers)

2. **Test Auction Finalization**:
   - End an auction
   - Verify payment processing
   - Check bid status updates

3. **Test Webhooks**:
   - Monitor webhook delivery in Razorpay dashboard
   - Check Supabase logs for webhook processing

## Test Card Numbers (Razorpay Test Mode)

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Troubleshooting

### Common Issues

1. **Edge Function Deployment Fails**:
   - Check Supabase CLI version
   - Verify project linking
   - Check function syntax

2. **Payment Not Processing**:
   - Verify Razorpay keys
   - Check webhook configuration
   - Monitor Supabase logs

3. **Real-time Updates Not Working**:
   - Verify database triggers
   - Check subscription setup
   - Ensure proper cleanup

### Debug Steps

1. **Check Supabase Logs**:
   ```bash
   supabase functions logs process-bid
   ```

2. **Verify Database Connections**:
   - Test Edge Functions locally
   - Check RLS policies
   - Verify table permissions

3. **Monitor Network Requests**:
   - Use browser dev tools
   - Check Razorpay dashboard
   - Monitor Supabase real-time

## Production Considerations

1. **Security**:
   - Use production Razorpay keys
   - Implement proper RLS policies
   - Add rate limiting
   - Validate all inputs

2. **Performance**:
   - Add database indexes
   - Implement caching
   - Monitor function execution time
   - Set up alerts

3. **Monitoring**:
   - Set up error tracking
   - Monitor payment success rates
   - Track auction performance
   - Set up health checks

## Support

If you encounter issues:

1. Check the Supabase documentation
2. Review Razorpay integration guides
3. Check the project's GitHub issues
4. Contact support with specific error messages

## Next Steps

After successful deployment:

1. **Customize UI**: Modify components to match your design
2. **Add Features**: Implement additional auction types
3. **Analytics**: Add bidding analytics and reporting
4. **Mobile**: Optimize for mobile devices
5. **Notifications**: Add email/SMS notifications
