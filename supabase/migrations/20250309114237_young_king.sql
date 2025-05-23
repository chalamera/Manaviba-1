/*
  # Revert username system

  1. Changes
    - Drop username column from users table
    - Update trigger function to original version
    - Keep RLS policies for basic functionality
*/

-- Drop username column if it exists
DO $$ BEGIN
  ALTER TABLE public.users DROP COLUMN IF EXISTS username;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Update trigger function to original version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;