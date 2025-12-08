-- Fix security warning: Function Search Path Mutable
-- Explicitly set search_path for handle_new_user function to prevent search path hijacking

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Explicitly set search_path
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    -- Try to get first_name from metadata, fallback to full_name split, fallback to 'New User'
    COALESCE(
      new.raw_user_meta_data->>'first_name', 
      split_part(new.raw_user_meta_data->>'full_name', ' ', 1),
      'New User'
    ),
    -- Try to get last_name from metadata, fallback to full_name split, fallback to empty
    COALESCE(
      new.raw_user_meta_data->>'last_name',
      split_part(new.raw_user_meta_data->>'full_name', ' ', 2),
      ''
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'tenant')
  );
  RETURN new;
END;
$$;
