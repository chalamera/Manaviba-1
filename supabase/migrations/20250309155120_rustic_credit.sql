/*
  # Fix comments and profiles relationship

  1. Changes
    - Ensure profiles table exists
    - Update comments table to reference profiles correctly
    - Add RLS policies for comments

  2. Security
    - Enable RLS on comments table
    - Add policies for comment access and management
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view profiles'
  ) THEN
    CREATE POLICY "Anyone can view profiles"
      ON profiles
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Update comments table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'comments'
  ) THEN
    CREATE TABLE comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
      user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      content text NOT NULL,
      parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    );
  ELSE
    -- Drop existing foreign key if it exists
    ALTER TABLE comments
      DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

    -- Add new foreign key
    ALTER TABLE comments
      ADD CONSTRAINT comments_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view comments'
  ) THEN
    CREATE POLICY "Anyone can view comments"
      ON comments
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create comments'
  ) THEN
    CREATE POLICY "Authenticated users can create comments"
      ON comments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own comments'
  ) THEN
    CREATE POLICY "Users can delete own comments"
      ON comments
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;