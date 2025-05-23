/*
  # Fix relationship between notes and profiles tables

  1. Changes
    - Add foreign key constraint between notes.seller_id and profiles.id
    - Drop existing constraint if it exists
    - Ensure all existing notes have valid seller_ids

  2. Notes
    - This fixes the "Could not find a relationship between 'notes' and 'profiles'" error
    - Maintains data integrity by ensuring all sellers exist in profiles table
*/

-- First, ensure all seller_ids exist in profiles
INSERT INTO profiles (id, email, username)
SELECT DISTINCT n.seller_id, u.email, COALESCE(u.email, n.seller_id::text)
FROM notes n
JOIN auth.users u ON u.id = n.seller_id
WHERE n.seller_id NOT IN (SELECT id FROM profiles);

-- Drop existing foreign key if it exists
ALTER TABLE notes
DROP CONSTRAINT IF EXISTS notes_seller_id_fkey;

-- Add new foreign key constraint
ALTER TABLE notes
ADD CONSTRAINT notes_seller_id_fkey
FOREIGN KEY (seller_id)
REFERENCES profiles(id)
ON DELETE CASCADE;