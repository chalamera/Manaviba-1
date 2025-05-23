-- Add Stripe Connect columns to profiles if they don't exist
DO $$ 
BEGIN
  -- Add Stripe account columns to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN stripe_account_id text,
    ADD COLUMN stripe_account_status text DEFAULT 'pending';

    -- Create index for Stripe account ID lookups
    CREATE INDEX IF NOT EXISTS profiles_stripe_account_id_idx ON profiles (stripe_account_id);
  END IF;

  -- Add stripe_session_id to orders
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_session_id text;
  END IF;
END $$;

-- Update RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Create new policies
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id OR
    auth.uid() IN (
      SELECT seller_id FROM notes WHERE id = note_id
    )
  );

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    payment_status = 'pending'
  );

-- Create function to validate stripe field updates
CREATE OR REPLACE FUNCTION prevent_stripe_field_updates()
RETURNS trigger AS $$
BEGIN
  -- Check if Stripe fields are being updated
  IF (TG_OP = 'UPDATE') THEN
    IF (NEW.stripe_account_id IS DISTINCT FROM OLD.stripe_account_id) OR
       (NEW.stripe_account_status IS DISTINCT FROM OLD.stripe_account_status) THEN
      RAISE EXCEPTION 'Cannot directly update Stripe-related fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS prevent_stripe_updates ON profiles;
CREATE TRIGGER prevent_stripe_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_stripe_field_updates();