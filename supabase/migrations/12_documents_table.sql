-- Create documents table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  property_id uuid references public.properties(id), -- Optional, for property-specific docs
  type text not null, -- 'passport', 'insurance', 'payslip', 'contract', 'guarantor_letter', 'deed', 'rib', 'other'
  name text not null, -- Display name
  file_url text not null,
  status text check (status in ('pending', 'verified', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.documents enable row level security;

-- Policies for Documents Table
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Storage Bucket for Documents (Private)
-- Note: 'documents' bucket might already exist from 04_storage.sql, but we ensure it here or just policies
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage Policies (Refining existing or adding new if needed)
-- We need to ensure users can upload to their own folder: documents/{user_id}/{filename}

drop policy if exists "Users can upload their own documents" on storage.objects;
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

drop policy if exists "Users can view their own documents" on storage.objects;
create policy "Users can view their own documents"
  on storage.objects for select
  using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

drop policy if exists "Users can update their own documents" on storage.objects;
create policy "Users can update their own documents"
  on storage.objects for update
  using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

drop policy if exists "Users can delete their own documents" on storage.objects;
create policy "Users can delete their own documents"
  on storage.objects for delete
  using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );
