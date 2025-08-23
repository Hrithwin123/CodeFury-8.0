-- Verify table structure and data
-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('farmer_listings', 'distributor_bids', 'distributors');

-- 2. Check farmer_listings structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'farmer_listings'
ORDER BY ordinal_position;

-- 3. Check if there's data in farmer_listings
SELECT COUNT(*) as total_listings FROM farmer_listings;
SELECT id, name, status, is_auction, auction_status FROM farmer_listings LIMIT 5;

-- 4. Check distributor_bids structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'distributor_bids'
ORDER BY ordinal_position;

-- 5. Check distributors structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'distributors'
ORDER BY ordinal_position;
