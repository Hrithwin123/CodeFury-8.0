-- Distributor Payment Configuration Table
-- Each distributor can configure their preferred payment methods

CREATE TABLE IF NOT EXISTS distributor_payment_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('card', 'upi', 'netbanking', 'wallet')),
  default_payment_method BOOLEAN DEFAULT false,
  card_last4 VARCHAR(4), -- Last 4 digits of card for reference
  card_brand VARCHAR(20), -- Visa, Mastercard, etc.
  upi_id VARCHAR(100), -- UPI ID if UPI is preferred
  bank_name VARCHAR(100), -- Bank name for netbanking
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_distributor_payment_distributor_id ON distributor_payment_configs(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_payment_method ON distributor_payment_configs(payment_method);

-- Apply updated_at trigger
CREATE TRIGGER update_distributor_payment_updated_at 
  BEFORE UPDATE ON distributor_payment_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint to ensure one default method per distributor
ALTER TABLE distributor_payment_configs 
ADD CONSTRAINT unique_distributor_default_payment UNIQUE (distributor_id, default_payment_method) 
WHERE default_payment_method = true;
