-- Add Stripe Connect columns to profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN stripe_account_id text,
    ADD COLUMN stripe_account_status text DEFAULT 'pending';

    CREATE INDEX profiles_stripe_account_id_idx ON profiles (stripe_account_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'platform_fee'
  ) THEN
    ALTER TABLE orders
    ADD COLUMN platform_fee integer;
  END IF;
END $$;