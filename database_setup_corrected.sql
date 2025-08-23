-- Create distributor_bids table for the auction system
-- This table connects distributors' bids to farmer's produce listings
CREATE TABLE IF NOT EXISTS distributor_bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    distributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    produce_id UUID REFERENCES farmer_listings(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_quantity DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_distributor_bids_distributor_id ON distributor_bids(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_bids_produce_id ON distributor_bids(produce_id);
CREATE INDEX IF NOT EXISTS idx_distributor_bids_status ON distributor_bids(status);

-- Add bidding-related columns to farmer_listings if they don't exist
-- These columns will be used to track auction information
ALTER TABLE farmer_listings 
ADD COLUMN IF NOT EXISTS starting_bid DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS current_bids INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auction_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_auction BOOLEAN DEFAULT false;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_distributor_bids_updated_at 
    BEFORE UPDATE ON distributor_bids 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE distributor_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for distributor_bids
-- Distributors can view their own bids
CREATE POLICY "Distributors can view their own bids" ON distributor_bids
    FOR SELECT USING (auth.uid() = distributor_id);

-- Distributors can create new bids
CREATE POLICY "Distributors can create bids" ON distributor_bids
    FOR INSERT WITH CHECK (auth.uid() = distributor_id);

-- Distributors can update their own bids (if needed)
CREATE POLICY "Distributors can update their own bids" ON distributor_bids
    FOR UPDATE USING (auth.uid() = distributor_id);

-- Farmers can view bids on their produce (for accepting/rejecting)
CREATE POLICY "Farmers can view bids on their produce" ON distributor_bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farmer_listings 
            WHERE id = produce_id AND user_id = auth.uid()
        )
    );

-- Farmers can update bid status (accept/reject)
CREATE POLICY "Farmers can update bid status" ON distributor_bids
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farmer_listings 
            WHERE id = produce_id AND user_id = auth.uid()
        )
    );

-- Note: Make sure the farmer_listings table exists and has the following structure:
-- CREATE TABLE IF NOT EXISTS farmer_listings (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--     name TEXT NOT NULL,
--     price TEXT NOT NULL,
--     description TEXT,
--     category TEXT,
--     quantity TEXT,
--     harvest_date TEXT,
--     location TEXT,
--     image_url TEXT,
--     certifications TEXT[],
--     tags TEXT[],
--     status TEXT DEFAULT 'active',
--     rating DECIMAL(3,2) DEFAULT 0,
--     reviews_count INTEGER DEFAULT 0,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Insert sample data for testing (optional - uncomment and modify as needed)
-- INSERT INTO distributor_bids (distributor_id, produce_id, bid_amount, bid_quantity, status)
-- VALUES 
--     ('sample-distributor-uuid', 'sample-produce-uuid', 40.00, 25.0, 'pending'),
--     ('sample-distributor-uuid', 'sample-produce-uuid', 42.50, 30.0, 'pending');
