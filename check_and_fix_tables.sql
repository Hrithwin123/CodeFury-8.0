-- Check and Fix Table Structure Issues
-- Run this in your Supabase SQL Editor to resolve the produce listing tracking problem

-- 1. First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('farmer_listings', 'distributor_bids', 'equipment_listings', 'bids');

-- 2. Create farmer_listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS farmer_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT,
    category TEXT,
    quantity TEXT,
    harvest_date TEXT,
    location TEXT,
    image_url TEXT,
    certifications TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active',
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    current_bids INTEGER DEFAULT 0,
    starting_bid DECIMAL(10,2),
    auction_end_time TIMESTAMP WITH TIME ZONE,
    is_auction BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create distributor_bids table if it doesn't exist
CREATE TABLE IF NOT EXISTS distributor_bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    distributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    produce_id UUID REFERENCES farmer_listings(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_quantity DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'replaced')),
    card_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create distributors table if it doesn't exist
CREATE TABLE IF NOT EXISTS distributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    business_type VARCHAR(100),
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create payment_configurations table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_key_id VARCHAR(255) NOT NULL,
    razorpay_key_secret VARCHAR(255) NOT NULL,
    webhook_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmer_listings_user_id ON farmer_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_listings_status ON farmer_listings(status);
CREATE INDEX IF NOT EXISTS idx_farmer_listings_category ON farmer_listings(category);

CREATE INDEX IF NOT EXISTS idx_distributor_bids_distributor_id ON distributor_bids(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_bids_produce_id ON distributor_bids(produce_id);
CREATE INDEX IF NOT EXISTS idx_distributor_bids_status ON distributor_bids(status);

CREATE INDEX IF NOT EXISTS idx_distributors_user_id ON distributors(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_config_seller_id ON payment_configurations(seller_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE farmer_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for farmer_listings
DROP POLICY IF EXISTS "Farmers can manage their own listings" ON farmer_listings;
CREATE POLICY "Farmers can manage their own listings" ON farmer_listings
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active listings" ON farmer_listings;
CREATE POLICY "Anyone can view active listings" ON farmer_listings
    FOR SELECT USING (status = 'active');

-- 9. Create RLS policies for distributor_bids
DROP POLICY IF EXISTS "Distributors can manage their own bids" ON distributor_bids;
CREATE POLICY "Distributors can manage their own bids" ON distributor_bids
    FOR ALL USING (auth.uid() = distributor_id);

DROP POLICY IF EXISTS "Farmers can view bids on their produce" ON distributor_bids;
CREATE POLICY "Farmers can view bids on their produce" ON distributor_bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farmer_listings 
            WHERE id = produce_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Farmers can update bid status" ON distributor_bids;
CREATE POLICY "Farmers can update bid status" ON distributor_bids
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farmer_listings 
            WHERE id = produce_id AND user_id = auth.uid()
        )
    );

-- 10. Create RLS policies for distributors
DROP POLICY IF EXISTS "Users can manage their own distributor profile" ON distributors;
CREATE POLICY "Users can manage their own distributor profile" ON distributors
    FOR ALL USING (auth.uid() = user_id);

-- 11. Create RLS policies for payment_configurations
DROP POLICY IF EXISTS "Sellers can manage their own payment config" ON payment_configurations;
CREATE POLICY "Sellers can manage their own payment config" ON payment_configurations
    FOR ALL USING (auth.uid() = seller_id);

-- 12. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Apply triggers to all tables
DROP TRIGGER IF EXISTS update_farmer_listings_updated_at ON farmer_listings;
CREATE TRIGGER update_farmer_listings_updated_at 
    BEFORE UPDATE ON farmer_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_distributor_bids_updated_at ON distributor_bids;
CREATE TRIGGER update_distributor_bids_updated_at 
    BEFORE UPDATE ON distributor_bids 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_distributors_updated_at ON distributors;
CREATE TRIGGER update_distributors_updated_at 
    BEFORE UPDATE ON distributors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_config_updated_at ON payment_configurations;
CREATE TRIGGER update_payment_config_updated_at 
    BEFORE UPDATE ON payment_configurations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 14. Grant permissions to authenticated users
GRANT ALL ON farmer_listings TO authenticated;
GRANT ALL ON distributor_bids TO authenticated;
GRANT ALL ON distributors TO authenticated;
GRANT ALL ON payment_configurations TO authenticated;

-- 15. Verify the tables were created correctly
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('farmer_listings', 'distributor_bids')
ORDER BY table_name, ordinal_position;

-- 16. Check if there are any existing listings
SELECT COUNT(*) as total_listings FROM farmer_listings;
SELECT COUNT(*) as total_bids FROM distributor_bids;
