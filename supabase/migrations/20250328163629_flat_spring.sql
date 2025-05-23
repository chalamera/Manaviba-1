/*
  # Add Stripe Connect fields

  1. Changes
    - Add Stripe account fields to profiles table
    - Add platform fee field to orders table
    - Create indexes for better query performance

  2. Notes
    - stripe_account_status tracks onboarding status
    - platform_fee stores the fee charged by the platform (15%)
*/

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
    WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE orders
    ADD COLUMN stripe_session_id text,
    ADD COLUMN platform_fee integer;
  END IF;
END $$;