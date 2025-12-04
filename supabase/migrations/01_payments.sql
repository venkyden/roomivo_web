-- PAYMENTS
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  amount numeric not null,
  currency text default '€',
  status text check (status in ('paid', 'pending', 'overdue', 'failed')) default 'pending',
  payment_date timestamp with time zone,
  due_date timestamp with time zone not null,
  invoice_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.payments enable row level security;

create policy "Tenants can view their own payments"
  on public.payments for select
  using ( auth.uid() = tenant_id );

create policy "Landlords can view payments for their properties"
  on public.payments for select
  using ( auth.uid() = landlord_id );

create policy "Landlords can insert payments (invoices)"
  on public.payments for insert
  with check ( auth.uid() = landlord_id );

create policy "Landlords can update payments"
  on public.payments for update
  using ( auth.uid() = landlord_id );
