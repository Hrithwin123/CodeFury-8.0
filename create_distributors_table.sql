-- Create Distributors Table
-- This table stores distributor information separate from auth.users

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_distributors_user_id ON distributors(user_id);
CREATE INDEX IF NOT EXISTS idx_distributors_company_name ON distributors(company_name);
CREATE INDEX IF NOT EXISTS idx_distributors_city ON distributors(city);
CREATE INDEX IF NOT EXISTS idx_distributors_is_active ON distributors(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Distributors can view their own profile
CREATE POLICY "Distributors can view own profile" ON distributors
  FOR SELECT USING (auth.uid() = user_id);

-- Distributors can update their own profile
CREATE POLICY "Distributors can update own profile" ON distributors
  FOR UPDATE USING (auth.uid() = user_id);

-- Distributors can insert their own profile
CREATE POLICY "Distributors can insert own profile" ON distributors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Farmers can view distributor profiles (for transparency)
CREATE POLICY "Farmers can view distributor profiles" ON distributors
  FOR SELECT USING (is_active = true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_distributors_updated_at 
  BEFORE UPDATE ON distributors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample distributor data (optional - for testing)
-- INSERT INTO distributors (user_id, company_name, contact_person, email, city, business_type)
-- VALUES 
--   ('sample-user-uuid', 'ABC Distributors', 'John Doe', 'john@abc.com', 'Mumbai', 'Wholesale'),
--   ('sample-user-uuid-2', 'XYZ Trading Co', 'Jane Smith', 'jane@xyz.com', 'Delhi', 'Retail');
