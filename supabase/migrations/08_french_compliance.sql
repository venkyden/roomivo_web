-- Add French rental compliance fields
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS energy_rating TEXT CHECK (energy_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
ADD COLUMN IF NOT EXISTS is_apl_eligible BOOLEAN DEFAULT false;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_guarantor BOOLEAN DEFAULT false;
