-- Create a trigger to automatically create a profile entry when a new user signs up via Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    -- Try to get first_name from metadata, fallback to full_name split, fallback to 'New User'
    coalesce(
      new.raw_user_meta_data->>'first_name', 
      split_part(new.raw_user_meta_data->>'full_name', ' ', 1),
      'New User'
    ),
    -- Try to get last_name from metadata, fallback to full_name split, fallback to empty
    coalesce(
      new.raw_user_meta_data->>'last_name',
      split_part(new.raw_user_meta_data->>'full_name', ' ', 2),
      ''
    ),
    coalesce(new.raw_user_meta_data->>'role', 'tenant')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
