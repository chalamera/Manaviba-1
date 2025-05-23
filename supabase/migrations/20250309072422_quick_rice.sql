/*
  # Add ratings table

  1. New Tables
    - `ratings`
      - `id` (uuid, primary key)
      - `note_id` (uuid, references notes)
      - `user_id` (uuid, references auth.users)
      - `rating` (integer, 1-5)
      - `created_at` (timestamp)
      - Unique constraint on (note_id, user_id) to prevent multiple ratings

  2. Security
    - Enable RLS on `ratings` table
    - Add policies for:
      - Anyone can view ratings
      - Authenticated users can rate purchased notes
*/

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(note_id, user_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
  ON ratings
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can rate purchased notes
CREATE POLICY "Users can rate purchased notes"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.note_id = ratings.note_id
      AND orders.buyer_id = auth.uid()
      AND orders.payment_status = 'completed'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS ratings_note_id_idx ON ratings(note_id);
CREATE INDEX IF NOT EXISTS ratings_user_id_idx ON ratings(user_id);