-- Add missing fields to profiles for applications and matching
alter table public.profiles 
add column if not exists profession text,
add column if not exists income numeric,
add column if not exists budget_min numeric,
add column if not exists budget_max numeric,
add column if not exists preferred_location text;

-- Update RLS to allow users to update these new fields
-- (Existing policy "Users can update own profile" covers all columns, so no change needed)
