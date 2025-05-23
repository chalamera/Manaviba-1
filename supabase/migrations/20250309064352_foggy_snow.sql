/*
  # Initial Schema for Academic Exchange

  1. New Tables
    - users (handled by Supabase Auth)
    - notes
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - university (text)
      - subject (text)
      - price (integer)
      - file_url (text)
      - preview_url (text)
      - seller_id (uuid, references auth.users)
      - created_at (timestamp)
    - orders
      - id (uuid, primary key)
      - note_id (uuid, references notes)
      - buyer_id (uuid, references auth.users)
      - payment_status (text)
      - stripe_session_id (text)
      - created_at (timestamp)
    - reviews
      - id (uuid, primary key)
      - note_id (uuid, references notes)
      - reviewer_id (uuid, references auth.users)
      - rating (integer)
      - comment (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  university text NOT NULL,
  subject text NOT NULL,
  price integer NOT NULL,
  file_url text,
  preview_url text,
  seller_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT price_positive CHECK (price >= 0)
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes NOT NULL,
  buyer_id uuid REFERENCES auth.users NOT NULL,
  payment_status text NOT NULL,
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes NOT NULL,
  reviewer_id uuid REFERENCES auth.users NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5)
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Notes Policies
CREATE POLICY "Anyone can view notes"
  ON notes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Orders Policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.note_id = reviews.note_id
      AND orders.buyer_id = auth.uid()
      AND orders.payment_status = 'completed'
    )
  );

-- Create indexes for better performance
CREATE INDEX notes_seller_id_idx ON notes(seller_id);
CREATE INDEX notes_university_subject_idx ON notes(university, subject);
CREATE INDEX orders_buyer_id_idx ON orders(buyer_id);
CREATE INDEX orders_note_id_idx ON orders(note_id);
CREATE INDEX reviews_note_id_idx ON reviews(note_id);
CREATE INDEX reviews_reviewer_id_idx ON reviews(reviewer_id);