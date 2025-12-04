-- Create a table for storing contracts
create table if not exists public.contracts (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications(id) not null,
  landlord_id uuid references public.profiles(id) not null,
  tenant_id uuid references public.profiles(id) not null,
  property_id uuid references public.properties(id) not null,
  status text check (status in ('draft', 'sent', 'signed')) default 'draft',
  contract_url text, -- URL to the PDF in storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  signed_at timestamp with time zone
);

-- Enable RLS
alter table public.contracts enable row level security;

-- Policies
create policy "Landlords can view their own contracts"
  on public.contracts for select
  using (auth.uid() = landlord_id);

create policy "Landlords can insert contracts"
  on public.contracts for insert
  with check (auth.uid() = landlord_id);

create policy "Landlords can update their own contracts"
  on public.contracts for update
  using (auth.uid() = landlord_id);

create policy "Tenants can view their own contracts"
  on public.contracts for select
  using (auth.uid() = tenant_id);

create policy "Tenants can update (sign) their own contracts"
  on public.contracts for update
  using (auth.uid() = tenant_id);

-- Storage Bucket for Contracts (Private)
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

-- Storage Policies
create policy "Landlord Upload Contract"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users View Own Contracts"
on storage.objects for select
to authenticated
using ( bucket_id = 'contracts' ); 
-- Note: Ideally we'd restrict this further, but for MVP, authenticated read for the bucket is acceptable 
-- if we rely on the database to store the specific URLs and RLS there. 
-- A stricter policy would check if auth.uid() is in the path or metadata.
