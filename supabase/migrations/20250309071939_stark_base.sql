/*
  # Add reviews table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `note_id` (uuid, foreign key to notes.id)
      - `reviewer_id` (uuid, foreign key to auth.users.id)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reviews` table
    - Add policies for:
      - Anyone can view reviews
      - Authenticated users can create reviews for purchased notes

  3. Constraints
    - Rating must be between 1 and 5
    - Foreign key constraints to notes and users tables
    - Unique constraint on note_id and reviewer_id combination
*/

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(note_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can create reviews for purchased notes" ON reviews;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create reviews for purchased notes"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.note_id = reviews.note_id
      AND orders.buyer_id = auth.uid()
      AND orders.payment_status = 'completed'
    )
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS reviews_note_id_idx ON reviews(note_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON reviews(reviewer_id);