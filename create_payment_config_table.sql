-- Payment Configuration Table for Farmers
-- Each farmer can have their own Razorpay account

CREATE TABLE IF NOT EXISTS payment_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES equipment_listings(seller_id) ON DELETE CASCADE,
  razorpay_key_id VARCHAR(255) NOT NULL,
  razorpay_key_secret VARCHAR(255) NOT NULL, -- This should be encrypted in production
  webhook_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_config_seller_id ON payment_configurations(seller_id);

-- Apply updated_at trigger
CREATE TRIGGER update_payment_config_updated_at 
  BEFORE UPDATE ON payment_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint to ensure one config per seller
ALTER TABLE payment_configurations 
ADD CONSTRAINT unique_seller_payment_config UNIQUE (seller_id);
