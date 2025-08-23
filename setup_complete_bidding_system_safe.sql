-- Complete Bidding System Setup (Safe Version)
-- Run this in your Supabase SQL Editor to set up everything
-- This version handles existing objects gracefully

-- 1. Create Distributors Table
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

-- 2. Create Equipment Listings Table (if not exists)
CREATE TABLE IF NOT EXISTS equipment_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    condition VARCHAR(50) NOT NULL,
    warranty VARCHAR(100),
    location VARCHAR(255),
    image_url TEXT,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    is_certified BOOLEAN DEFAULT false,
    certification_count INTEGER DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Bids Table
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES equipment_listings(id) ON DELETE CASCADE,
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10,2) NOT NULL CHECK (bid_amount > 0),
  card_token VARCHAR(255),
  bid_status VARCHAR(20) DEFAULT 'pending' CHECK (bid_status IN ('pending', 'won', 'lost', 'expired')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Auction Sessions Table
CREATE TABLE IF NOT EXISTS auction_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES equipment_listings(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  winner_bid_id UUID REFERENCES bids(id),
  reserve_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Payment Configurations Table
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

-- 7. Create Indexes for Performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_distributors_user_id ON distributors(user_id);
CREATE INDEX IF NOT EXISTS idx_distributors_company_name ON distributors(company_name);
CREATE INDEX IF NOT EXISTS idx_distributors_city ON distributors(city);
CREATE INDEX IF NOT EXISTS idx_distributors_is_active ON distributors(is_active);

CREATE INDEX IF NOT EXISTS idx_equipment_seller_id ON equipment_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment_listings(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment_listings(category);

CREATE INDEX IF NOT EXISTS idx_bids_equipment_id ON bids(equipment_id);
CREATE INDEX IF NOT EXISTS idx_bids_distributor_id ON bids(distributor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(bid_status);

CREATE INDEX IF NOT EXISTS idx_payments_bid_id ON payments(bid_id);
CREATE INDEX IF NOT EXISTS idx_auction_sessions_equipment_id ON auction_sessions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_auction_sessions_status ON auction_sessions(status);

CREATE INDEX IF NOT EXISTS idx_payment_config_seller_id ON payment_configurations(seller_id);

-- 8. Create updated_at trigger function (safe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Apply triggers to all tables (safe - drop if exists first)
DROP TRIGGER IF EXISTS update_distributors_updated_at ON distributors;
CREATE TRIGGER update_distributors_updated_at BEFORE UPDATE ON distributors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_listings_updated_at ON equipment_listings;
CREATE TRIGGER update_equipment_listings_updated_at BEFORE UPDATE ON equipment_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_auction_sessions_updated_at ON auction_sessions;
CREATE TRIGGER update_auction_sessions_updated_at BEFORE UPDATE ON auction_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_config_updated_at ON payment_configurations;
CREATE TRIGGER update_payment_config_updated_at BEFORE UPDATE ON payment_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;

-- 11. Drop existing policies if they exist (safe)
DROP POLICY IF EXISTS "Distributors can view own profile" ON distributors;
DROP POLICY IF EXISTS "Distributors can update own profile" ON distributors;
DROP POLICY IF EXISTS "Distributors can insert own profile" ON distributors;
DROP POLICY IF EXISTS "Farmers can view distributor profiles" ON distributors;

DROP POLICY IF EXISTS "Sellers can manage their own equipment" ON equipment_listings;
DROP POLICY IF EXISTS "Farmers can view active equipment" ON equipment_listings;

DROP POLICY IF EXISTS "Distributors can view their own bids" ON bids;
DROP POLICY IF EXISTS "Distributors can create bids" ON bids;
DROP POLICY IF EXISTS "Farmers can view bids on their equipment" ON bids;
DROP POLICY IF EXISTS "Farmers can update bid status" ON bids;

DROP POLICY IF EXISTS "Users can view payments for their bids" ON payments;

DROP POLICY IF EXISTS "Users can view auction sessions" ON auction_sessions;
DROP POLICY IF EXISTS "Sellers can manage auction sessions for their equipment" ON auction_sessions;

DROP POLICY IF EXISTS "Sellers can manage their own payment config" ON payment_configurations;

-- 12. Create RLS Policies for Distributors
CREATE POLICY "Distributors can view own profile" ON distributors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Distributors can update own profile" ON distributors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Distributors can insert own profile" ON distributors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can view distributor profiles" ON distributors
  FOR SELECT USING (is_active = true);

-- 13. Create RLS Policies for Equipment Listings
CREATE POLICY "Sellers can manage their own equipment" ON equipment_listings
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Farmers can view active equipment" ON equipment_listings
    FOR SELECT USING (status = 'active');

-- 14. Create RLS Policies for Bids
CREATE POLICY "Distributors can view their own bids" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM distributors 
      WHERE distributors.id = bids.distributor_id 
      AND distributors.user_id = auth.uid()
    )
  );

CREATE POLICY "Distributors can create bids" ON bids
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM distributors 
      WHERE distributors.id = bids.distributor_id 
      AND distributors.user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can view bids on their equipment" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM equipment_listings 
      WHERE equipment_listings.id = bids.equipment_id 
      AND equipment_listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can update bid status" ON bids
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM equipment_listings 
      WHERE equipment_listings.id = bids.equipment_id 
      AND equipment_listings.seller_id = auth.uid()
    )
  );

-- 15. Create RLS Policies for Payments
CREATE POLICY "Users can view payments for their bids" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bids 
      JOIN distributors ON distributors.id = bids.distributor_id
      WHERE payments.bid_id = bids.id 
      AND distributors.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM bids 
      JOIN equipment_listings ON equipment_listings.id = bids.equipment_id
      WHERE payments.bid_id = bids.id 
      AND equipment_listings.seller_id = auth.uid()
    )
  );

-- 16. Create RLS Policies for Auction Sessions
CREATE POLICY "Users can view auction sessions" ON auction_sessions
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage auction sessions for their equipment" ON auction_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM equipment_listings 
      WHERE equipment_listings.id = auction_sessions.equipment_id 
      AND equipment_listings.seller_id = auth.uid()
    )
  );

-- 17. Create RLS Policies for Payment Configurations
CREATE POLICY "Sellers can manage their own payment config" ON payment_configurations
  FOR ALL USING (auth.uid() = seller_id);

-- 18. Grant permissions to authenticated users
GRANT ALL ON distributors TO authenticated;
GRANT ALL ON equipment_listings TO authenticated;
GRANT ALL ON bids TO authenticated;
GRANT ALL ON payments TO authenticated;
GRANT ALL ON auction_sessions TO authenticated;
GRANT ALL ON payment_configurations TO authenticated;

-- 19. Verify setup
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('distributors', 'equipment_listings', 'bids', 'payments', 'auction_sessions', 'payment_configurations')
ORDER BY tablename;

-- 20. Show all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('distributors', 'equipment_listings', 'bids', 'payments', 'auction_sessions', 'payment_configurations')
ORDER BY tablename, policyname;
