-- Clean up duplicate policies
-- Run this in Supabase SQL Editor to remove duplicates

-- Remove duplicate auction session policies
DROP POLICY IF EXISTS "Equipment sellers can manage their auctions" ON auction_sessions;

-- Remove duplicate bid policies
DROP POLICY IF EXISTS "Distributors can insert their own bids" ON bids;
DROP POLICY IF EXISTS "Distributors can update their own bids" ON bids;
DROP POLICY IF EXISTS "Distributors can view all bids" ON bids;

-- Remove duplicate payment configuration policies
DROP POLICY IF EXISTS "Users can delete their own payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Users can insert their own payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Users can update their own payment configs" ON payment_configurations;
DROP POLICY IF EXISTS "Users can view their own payment configs" ON payment_configurations;

-- Remove duplicate payment policies
DROP POLICY IF EXISTS "System can insert payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;
DROP POLICY IF EXISTS "Users can view payments related to their bids" ON payments;

-- Verify cleanup
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('distributors', 'equipment_listings', 'bids', 'payments', 'auction_sessions', 'payment_configurations')
ORDER BY tablename, policyname;
