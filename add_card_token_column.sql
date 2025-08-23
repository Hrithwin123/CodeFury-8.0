-- Add card_token column to distributor_bids table for Razorpay integration
ALTER TABLE distributor_bids 
ADD COLUMN IF NOT EXISTS card_token TEXT,
ADD COLUMN IF NOT EXISTS replaced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS replaced_by_bid UUID REFERENCES distributor_bids(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_distributor_bids_card_token ON distributor_bids(card_token);
CREATE INDEX IF NOT EXISTS idx_distributor_bids_replaced_by ON distributor_bids(replaced_by_bid);

-- Update existing bids to have a default status if they don't have one
UPDATE distributor_bids 
SET status = 'pending' 
WHERE status IS NULL;

-- Add comment to explain the card_token field
COMMENT ON COLUMN distributor_bids.card_token IS 'Razorpay payment token for card verification - only charged if bid wins';
COMMENT ON COLUMN distributor_bids.replaced_at IS 'Timestamp when this bid was replaced by a better bid';
COMMENT ON COLUMN distributor_bids.replaced_by_bid IS 'Reference to the bid that replaced this one';
