/*
  # Add preview_images support

  1. Changes
    - Add `preview_images` column to notes table as a text array
    - Keep existing `preview_url` for backward compatibility
    - Add index for array operations

  2. Notes
    - Array will store multiple image URLs
    - Existing preview_url will be maintained for compatibility
*/

-- Add preview_images array column
ALTER TABLE notes
ADD COLUMN preview_images text[] DEFAULT '{}';

-- Create GIN index for array operations
CREATE INDEX notes_preview_images_idx ON notes USING GIN (preview_images);