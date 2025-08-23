-- Alternative RLS Fix: Modify existing policies to allow service role access

-- 1. Modify farmer_listings policy to allow service role
DROP POLICY IF EXISTS "Anyone can view active listings" ON farmer_listings;
CREATE POLICY "Anyone can view active listings" ON farmer_listings
    FOR SELECT USING (
        status = 'active' OR 
        auth.role() = 'service_role'  -- Allow service role to see all
    );

-- 2. Modify distributor_bids policy to allow service role
DROP POLICY IF EXISTS "Distributors can manage their own bids" ON distributor_bids;
CREATE POLICY "Distributors can manage their own bids" ON distributor_bids
    FOR ALL USING (
        auth.uid() = distributor_id OR 
        auth.role() = 'service_role'  -- Allow service role to manage all
    );

-- 3. Modify distributors policy to allow service role
DROP POLICY IF EXISTS "Users can manage their own distributor profile" ON distributors;
CREATE POLICY "Users can manage their own distributor profile" ON distributors
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'  -- Allow service role to manage all
    );

-- 4. Alternative: Temporarily disable RLS for testing
-- ALTER TABLE farmer_listings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE distributor_bids DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE distributors DISABLE ROW LEVEL SECURITY;

-- 5. Re-enable RLS after testing (uncomment when ready)
-- ALTER TABLE farmer_listings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE distributor_bids ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
