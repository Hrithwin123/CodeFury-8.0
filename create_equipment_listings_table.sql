-- Create equipment_listings table for agricultural equipment sellers
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_equipment_seller_id ON equipment_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment_listings(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment_listings(category);
CREATE INDEX IF NOT EXISTS idx_equipment_certified ON equipment_listings(is_certified);

-- Enable Row Level Security
ALTER TABLE equipment_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment listings
-- Sellers can view, insert, update, and delete their own listings
CREATE POLICY "Sellers can manage their own equipment" ON equipment_listings
    FOR ALL USING (auth.uid() = seller_id);

-- Farmers can view active equipment listings
CREATE POLICY "Farmers can view active equipment" ON equipment_listings
    FOR SELECT USING (status = 'active');

-- Grant permissions to authenticated users
GRANT ALL ON equipment_listings TO authenticated;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_equipment_listings_updated_at 
    BEFORE UPDATE ON equipment_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
