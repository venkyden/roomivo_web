-- Add rental_type column to properties table
alter table public.properties 
add column if not exists rental_type text check (rental_type in ('furnished', 'unfurnished', 'colocation')) default 'furnished';

-- Update RLS if needed (existing policies should cover new column)
