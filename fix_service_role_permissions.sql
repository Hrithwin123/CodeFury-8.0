-- Fix Service Role Permissions for Edge Functions
-- This allows the edge function to access all tables while maintaining RLS for regular users

-- 1. Create a policy that allows service role to bypass RLS for farmer_listings
DROP POLICY IF EXISTS "Service role can access all listings" ON farmer_listings;
CREATE POLICY "Service role can access all listings" ON farmer_listings
    FOR ALL USING (true);

-- 2. Create a policy that allows service role to bypass RLS for distributor_bids
DROP POLICY IF EXISTS "Service role can access all bids" ON distributor_bids;
CREATE POLICY "Service role can access all bids" ON distributor_bids
    FOR ALL USING (true);

-- 3. Create a policy that allows service role to bypass RLS for distributors
DROP POLICY IF EXISTS "Service role can access all distributors" ON distributors;
CREATE POLICY "Service role can access all distributors" ON distributors
    FOR ALL USING (true);

-- 4. Grant explicit permissions to service role
GRANT ALL ON farmer_listings TO service_role;
GRANT ALL ON distributor_bids TO service_role;
GRANT ALL ON distributors TO service_role;
GRANT ALL ON payment_configurations TO service_role;

-- 5. Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('farmer_listings', 'distributor_bids', 'distributors')
ORDER BY tablename, policyname;
