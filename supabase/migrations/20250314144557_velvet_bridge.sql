/*
  # Add professor field to notes table

  1. Changes
    - Add `professor` column to `notes` table to store professor/instructor information
    - Make the column nullable to maintain compatibility with existing records
    - Add index on professor column for faster searches

  2. Notes
    - Existing records will have NULL in the professor column
    - No data migration needed
*/

-- Add professor column to notes table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'professor'
  ) THEN
    ALTER TABLE notes ADD COLUMN professor text;
    CREATE INDEX notes_professor_idx ON notes (professor);
  END IF;
END $$;