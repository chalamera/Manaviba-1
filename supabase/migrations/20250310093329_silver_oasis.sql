/*
  # Add department column to notes table

  1. Changes
    - Add `department` column to `notes` table to store faculty/department information
    - Make the column nullable to maintain compatibility with existing records
    - Add index on department column for faster searches

  2. Notes
    - Existing records will have NULL in the department column
    - No data migration needed
*/

-- Add department column to notes table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'department'
  ) THEN
    ALTER TABLE notes ADD COLUMN department text;
    CREATE INDEX notes_department_idx ON notes (department);
  END IF;
END $$;