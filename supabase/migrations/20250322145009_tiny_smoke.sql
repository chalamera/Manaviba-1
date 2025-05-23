/*
  # Add username to profiles table

  1. Changes
    - Add username column to profiles table (initially nullable)
    - Update existing records with email as username
    - Make username required and unique
    - Create index for username lookups
    - Update trigger for new user registration

  2. Notes
    - Handle existing records before adding constraints
    - Use email as fallback username
    - Ensure uniqueness after data migration
*/

-- Add username column (initially nullable)
ALTER TABLE profiles
ADD COLUMN username text;

-- Update existing records to use email as username
UPDATE profiles
SET username = email
WHERE username IS NULL;

-- Make username required and unique
ALTER TABLE profiles
ALTER COLUMN username SET NOT NULL,
ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Create index for username lookups
CREATE INDEX profiles_username_idx ON profiles (username);

-- Update trigger function to handle username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'username')::text,
      new.email
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;