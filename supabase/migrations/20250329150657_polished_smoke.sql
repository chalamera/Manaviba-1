/*
  # Fix Stripe field update trigger

  1. Changes
    - Modify trigger function to allow updates from Edge Functions
    - Add check for service role updates
    - Keep protection against direct user updates

  2. Security
    - Only allow updates from service role
    - Maintain data integrity
*/

-- Update the trigger function to allow service role updates
CREATE OR REPLACE FUNCTION prevent_stripe_field_updates()
RETURNS trigger AS $$
BEGIN
  -- Allow updates from service role
  IF (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role') THEN
    RETURN NEW;
  END IF;

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