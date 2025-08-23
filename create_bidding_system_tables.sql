-- Bidding System Database Tables
-- Run this after your existing database setup

-- Bids table to store all bids
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES equipment_listings(id) ON DELETE CASCADE,
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10,2) NOT NULL CHECK (bid_amount > 0),
  card_token VARCHAR(255), -- Store encrypted card reference from Razorpay
  bid_status VARCHAR(20) DEFAULT 'pending' CHECK (bid_status IN ('pending', 'won', 'lost', 'expired')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table to track payment status
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

-- Auction sessions table to manage auction lifecycle
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bids_equipment_id ON bids(equipment_id);
CREATE INDEX IF NOT EXISTS idx_bids_distributor_id ON bids(distributor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(bid_status);
CREATE INDEX IF NOT EXISTS idx_payments_bid_id ON payments(bid_id);
CREATE INDEX IF NOT EXISTS idx_auction_sessions_equipment_id ON auction_sessions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_auction_sessions_status ON auction_sessions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auction_sessions_updated_at BEFORE UPDATE ON auction_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample auction session for existing equipment (optional)
-- INSERT INTO auction_sessions (equipment_id, start_time, end_time, reserve_price)
-- SELECT id, NOW(), NOW() + INTERVAL '7 days', 1000.00
-- FROM equipment_listings
-- WHERE id NOT IN (SELECT equipment_id FROM auction_sessions);
