-- Check current RLS status of all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('farmer_listings', 'distributor_bids', 'distributors', 'payment_configurations')
ORDER BY tablename;

-- Check if there are any active policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('farmer_listings', 'distributor_bids', 'distributors', 'payment_configurations')
ORDER BY tablename, policyname;

-- Check table permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('farmer_listings', 'distributor_bids', 'distributors', 'payment_configurations')
ORDER BY table_name, grantee;
