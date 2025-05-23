/*
  # Add Stripe Connect support

  1. Changes
    - Add stripe_account_id column to profiles table
    - Add stripe_account_status column to profiles table
    - Add platform_fee column to orders table

  2. Notes
    - stripe_account_id stores the Stripe Connect account ID
    - stripe_account_status tracks the onboarding status
    - platform_fee stores the fee charged by the platform (10%)
*/

-- Add Stripe Connect columns to profiles
ALTER TABLE profiles
ADD COLUMN stripe_account_id text,
ADD COLUMN stripe_account_status text DEFAULT 'pending';

-- Add platform fee column to orders
ALTER TABLE orders
ADD COLUMN platform_fee integer;

-- Create index for Stripe account ID
CREATE INDEX profiles_stripe_account_id_idx ON profiles (stripe_account_id);