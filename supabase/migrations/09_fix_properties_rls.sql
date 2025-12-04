-- Enable RLS on properties if not already enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public) to view properties
-- Drop existing policy if it exists to avoid conflicts (or use DO block, but simple drop is easier here)
DROP POLICY IF EXISTS "Public properties are viewable by everyone" ON properties;
CREATE POLICY "Public properties are viewable by everyone"
ON properties FOR SELECT
USING ( true );

-- Allow landlords to insert/update their own properties
DROP POLICY IF EXISTS "Landlords can insert their own properties" ON properties;
CREATE POLICY "Landlords can insert their own properties"
ON properties FOR INSERT
WITH CHECK ( auth.uid() = landlord_id );

DROP POLICY IF EXISTS "Landlords can update their own properties" ON properties;
CREATE POLICY "Landlords can update their own properties"
ON properties FOR UPDATE
USING ( auth.uid() = landlord_id );

DROP POLICY IF EXISTS "Landlords can delete their own properties" ON properties;
CREATE POLICY "Landlords can delete their own properties"
ON properties FOR DELETE
USING ( auth.uid() = landlord_id );
