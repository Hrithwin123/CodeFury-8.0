-- Create the farmer_listings table to store produce listings
CREATE TABLE IF NOT EXISTS farmer_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    harvest_date VARCHAR(100),
    location VARCHAR(255),
    certifications TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    freshness INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmer_listings_user_id ON farmer_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_listings_category ON farmer_listings(category);
CREATE INDEX IF NOT EXISTS idx_farmer_listings_status ON farmer_listings(status);
CREATE INDEX IF NOT EXISTS idx_farmer_listings_created_at ON farmer_listings(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE farmer_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own listings
CREATE POLICY "Users can view their own listings" ON farmer_listings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own listings
CREATE POLICY "Users can insert their own listings" ON farmer_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings" ON farmer_listings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings" ON farmer_listings
    FOR DELETE USING (auth.uid() = user_id);

-- Consumers can view active listings (for the swipe interface)
CREATE POLICY "Consumers can view active listings" ON farmer_listings
    FOR SELECT USING (status = 'active');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_farmer_listings_updated_at 
    BEFORE UPDATE ON farmer_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON farmer_listings TO authenticated;
GRANT SELECT ON farmer_listings TO anon;

-- Create a view for consumers to see active listings
CREATE OR REPLACE VIEW active_produce_listings AS
SELECT 
    fl.*,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', 'Local Farm') as farm_name
FROM farmer_listings fl
JOIN auth.users u ON fl.user_id = u.id
WHERE fl.status = 'active'
ORDER BY fl.created_at DESC;

-- Grant select permission on the view
GRANT SELECT ON active_produce_listings TO anon;
GRANT SELECT ON active_produce_listings TO authenticated;
