-- INCIDENTS
create table if not exists public.incidents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  priority text check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
  status text check (status in ('reported', 'in_progress', 'resolved', 'closed')) default 'reported',
  photos text[] default '{}',
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.incidents enable row level security;

create policy "Tenants can view their own incidents"
  on public.incidents for select
  using ( auth.uid() = tenant_id );

create policy "Tenants can create incidents"
  on public.incidents for insert
  with check ( auth.uid() = tenant_id );

create policy "Landlords can view incidents for their properties"
  on public.incidents for select
  using ( 
    exists (
      select 1 from public.properties
      where properties.id = incidents.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Landlords can update incidents for their properties"
  on public.incidents for update
  using ( 
    exists (
      select 1 from public.properties
      where properties.id = incidents.property_id
      and properties.landlord_id = auth.uid()
    )
  );
