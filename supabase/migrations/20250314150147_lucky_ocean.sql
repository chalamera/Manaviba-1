/*
  # Add categories to notes table

  1. Changes
    - Add `category` column to `notes` table
    - Create index on category column for faster searches
    - Add enum type for predefined categories

  2. Notes
    - Categories are predefined to ensure consistency
    - Index added for better query performance
*/

-- Create category enum type
CREATE TYPE note_category AS ENUM (
  'lecture_note',    -- 講義ノート
  'past_exam',       -- 過去問
  'summary',         -- 資料まとめ
  'recording',       -- 講義録音
  'other'           -- その他
);

-- Add category column to notes table
ALTER TABLE notes ADD COLUMN category note_category NOT NULL DEFAULT 'other';

-- Create index for category column
CREATE INDEX notes_category_idx ON notes (category);