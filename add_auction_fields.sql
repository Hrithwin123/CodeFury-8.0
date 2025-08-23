-- Add missing auction-related fields to farmer_listings table
ALTER TABLE farmer_listings 
ADD COLUMN IF NOT EXISTS auction_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS winning_bid_id UUID REFERENCES distributor_bids(id),
ADD COLUMN IF NOT EXISTS is_auction BOOLEAN DEFAULT false;

-- Add index for auction end time queries
CREATE INDEX IF NOT EXISTS idx_farmer_listings_auction_end_time ON farmer_listings(auction_end_time);

-- Add index for winning bid lookups
CREATE INDEX IF NOT EXISTS idx_farmer_listings_winning_bid ON farmer_listings(winning_bid_id);

-- Add comments to explain the new fields
COMMENT ON COLUMN farmer_listings.auction_end_time IS 'When the auction ends - null means no auction';
COMMENT ON COLUMN farmer_listings.winning_bid_id IS 'Reference to the winning bid when auction ends';
COMMENT ON COLUMN farmer_listings.is_auction IS 'Whether this listing is an auction or direct sale';

-- Update existing listings to have default values
UPDATE farmer_listings 
SET is_auction = false 
WHERE is_auction IS NULL;
