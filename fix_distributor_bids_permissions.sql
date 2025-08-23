-- Fix permissions for distributor_bids table
-- This script safely removes existing policies and creates new ones

-- First, enable RLS on the distributor_bids table if not already enabled
ALTER TABLE distributor_bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Distributors can insert their own bids" ON distributor_bids;
DROP POLICY IF EXISTS "Distributors can view their own bids" ON distributor_bids;
DROP POLICY IF EXISTS "Distributors can update their own bids" ON distributor_bids;
DROP POLICY IF EXISTS "Distributors can delete their own bids" ON distributor_bids;
DROP POLICY IF EXISTS "Farmers can view bids on their produce" ON distributor_bids;
DROP POLICY IF EXISTS "Farmers can update bid status on their produce" ON distributor_bids;

-- Policy 1: Distributors can insert their own bids
CREATE POLICY "Distributors can insert their own bids" ON distributor_bids
    FOR INSERT WITH CHECK (
        distributor_id = auth.uid()
    );

-- Policy 2: Distributors can view their own bids
CREATE POLICY "Distributors can view their own bids" ON distributor_bids
    FOR SELECT USING (
        distributor_id = auth.uid()
    );

-- Policy 3: Distributors can update their own bids
CREATE POLICY "Distributors can update their own bids" ON distributor_bids
    FOR UPDATE USING (
        distributor_id = auth.uid()
    );

-- Policy 4: Distributors can delete their own bids
CREATE POLICY "Distributors can delete their own bids" ON distributor_bids
    FOR DELETE USING (
        distributor_id = auth.uid()
    );

-- Policy 5: Farmers can view bids on their produce
CREATE POLICY "Farmers can view bids on their produce" ON distributor_bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farmer_listings
            WHERE id = produce_id AND user_id = auth.uid()
        )
    );

-- Policy 6: Farmers can update bid status on their produce
CREATE POLICY "Farmers can update bid status on their produce" ON distributor_bids
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farmer_listings
            WHERE id = produce_id AND user_id = auth.uid()
        )
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'distributor_bids';

-- Show a summary of what was created
SELECT 
    'Policy created successfully' as status,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'INSERT' THEN 'Distributors can insert bids'
        WHEN cmd = 'SELECT' AND policyname LIKE '%Distributors%' THEN 'Distributors can view their bids'
        WHEN cmd = 'SELECT' AND policyname LIKE '%Farmers%' THEN 'Farmers can view bids on their produce'
        WHEN cmd = 'UPDATE' AND policyname LIKE '%Distributors%' THEN 'Distributors can update their bids'
        WHEN cmd = 'UPDATE' AND policyname LIKE '%Farmers%' THEN 'Farmers can update bid status'
        WHEN cmd = 'DELETE' THEN 'Distributors can delete their bids'
        ELSE 'Other operation'
    END as description
FROM pg_policies 
WHERE tablename = 'distributor_bids'
ORDER BY cmd, policyname;
