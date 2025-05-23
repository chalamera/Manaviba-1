-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view orders for their notes" ON orders;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id OR
    auth.uid() IN (
      SELECT seller_id FROM notes WHERE id = note_id
    )
  );

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM notes WHERE id = note_id
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_note_id_idx ON orders(note_id);