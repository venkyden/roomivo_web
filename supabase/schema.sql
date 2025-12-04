-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  first_name text,
  last_name text,
  role text check (role in ('tenant', 'landlord', 'admin')) default 'tenant',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROPERTIES
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  currency text default '€',
  location text not null,
  rooms integer default 1,
  amenities text[] default '{}',
  images text[] default '{}',
  status text check (status in ('active', 'draft', 'rented')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- APPLICATIONS
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'rejected', 'draft')) default 'pending',
  message text,
  documents text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONVERSATIONS
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONVERSATION PARTICIPANTS
create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

-- MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Properties
alter table public.properties enable row level security;

create policy "Properties are viewable by everyone"
  on public.properties for select
  using ( true );

create policy "Landlords can insert their own properties"
  on public.properties for insert
  with check ( auth.uid() = landlord_id );

create policy "Landlords can update their own properties"
  on public.properties for update
  using ( auth.uid() = landlord_id );

create policy "Landlords can delete their own properties"
  on public.properties for delete
  using ( auth.uid() = landlord_id );

-- Applications
alter table public.applications enable row level security;

create policy "Tenants can view their own applications"
  on public.applications for select
  using ( auth.uid() = tenant_id );

create policy "Landlords can view applications for their properties"
  on public.applications for select
  using ( 
    exists (
      select 1 from public.properties
      where properties.id = applications.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Tenants can insert applications"
  on public.applications for insert
  with check ( auth.uid() = tenant_id );

create policy "Landlords can update application status"
  on public.applications for update
  using ( 
    exists (
      select 1 from public.properties
      where properties.id = applications.property_id
      and properties.landlord_id = auth.uid()
    )
  );

-- Conversations & Messages (Simplified for MVP)
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Participants can view conversations they are in
create policy "Users can view their conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = conversations.id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "Users can view participants in their conversations"
  on public.conversation_participants for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

-- TRIGGERS
-- Handle new user signup -> create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce(new.raw_user_meta_data->>'role', 'tenant')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
