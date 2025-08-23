-- Add auction-related fields to farmer_listings table
ALTER TABLE farmer_listings 
ADD COLUMN IF NOT EXISTS auction_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS winning_bid_id UUID REFERENCES distributor_bids(id),
ADD COLUMN IF NOT EXISTS auction_status VARCHAR(20) DEFAULT 'no_auction';

-- Add auction-related fields to distributor_bids table
ALTER TABLE distributor_bids 
ADD COLUMN IF NOT EXISTS replaced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS replaced_by_bid UUID REFERENCES distributor_bids(id);

-- Create index for auction end time queries
CREATE INDEX IF NOT EXISTS idx_farmer_listings_auction_end_time 
ON farmer_listings(auction_end_time) 
WHERE auction_end_time IS NOT NULL;

-- Create index for bid replacement queries
CREATE INDEX IF NOT EXISTS idx_distributor_bids_replaced_at 
ON distributor_bids(replaced_at) 
WHERE replaced_at IS NOT NULL;

-- Update existing listings to have no auction by default
UPDATE farmer_listings 
SET auction_status = 'no_auction' 
WHERE auction_status IS NULL;

-- Function to automatically update auction status
CREATE OR REPLACE FUNCTION update_auction_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auction status based on auction end time
  IF NEW.auction_end_time IS NOT NULL THEN
    IF NEW.auction_end_time <= NOW() THEN
      NEW.auction_status = 'ended';
    ELSE
      NEW.auction_status = 'active';
    END IF;
  ELSE
    NEW.auction_status = 'no_auction';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update auction status
DROP TRIGGER IF EXISTS update_auction_status_trigger ON farmer_listings;
CREATE TRIGGER update_auction_status_trigger 
  BEFORE INSERT OR UPDATE ON farmer_listings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_auction_status();
