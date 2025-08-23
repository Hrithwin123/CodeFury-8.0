-- Create table to store distributor preferences (liked items)
CREATE TABLE IF NOT EXISTS distributor_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    distributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    produce_id UUID NOT NULL REFERENCES farmer_listings(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(distributor_id, produce_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_distributor_preferences_distributor_id ON distributor_preferences(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_preferences_produce_id ON distributor_preferences(produce_id);

-- Enable RLS
ALTER TABLE distributor_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Distributors can view their own preferences" ON distributor_preferences;
DROP POLICY IF EXISTS "Distributors can insert their own preferences" ON distributor_preferences;
DROP POLICY IF EXISTS "Distributors can delete their own preferences" ON distributor_preferences;

-- Policy: Distributors can only see their own preferences
CREATE POLICY "Distributors can view their own preferences" ON distributor_preferences
    FOR SELECT USING (auth.uid() = distributor_id);

-- Policy: Distributors can insert their own preferences
CREATE POLICY "Distributors can insert their own preferences" ON distributor_preferences
    FOR INSERT WITH CHECK (auth.uid() = distributor_id);

-- Policy: Distributors can delete their own preferences
CREATE POLICY "Distributors can delete their own preferences" ON distributor_preferences
    FOR DELETE USING (auth.uid() = distributor_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON distributor_preferences TO authenticated;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distributor_preferences' AND column_name = 'updated_at') THEN
        ALTER TABLE distributor_preferences ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_distributor_preferences_updated_at ON distributor_preferences;
CREATE TRIGGER update_distributor_preferences_updated_at
    BEFORE UPDATE ON distributor_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
