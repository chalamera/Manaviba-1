/*
  # Create storage buckets for notes and previews

  1. New Storage Buckets
    - `notes`: For storing note PDF files
    - `previews`: For storing note preview images

  2. Security
    - Enable public access for preview images
    - Restrict note access to authenticated users
    - Allow authenticated users to upload files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('notes', 'notes', false),
  ('previews', 'previews', true);

-- Set up security policies for notes bucket
CREATE POLICY "Anyone can view their purchased notes"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'notes'
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.note_id = CAST(storage.objects.metadata->>'note_id' AS uuid)
      AND orders.buyer_id = auth.uid()
      AND orders.payment_status = 'completed'
    )
  );

CREATE POLICY "Users can upload notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'notes');

CREATE POLICY "Users can update their notes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'notes' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'notes' AND owner = auth.uid());

CREATE POLICY "Users can delete their notes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'notes' AND owner = auth.uid());

-- Set up security policies for previews bucket
CREATE POLICY "Anyone can view previews"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'previews');

CREATE POLICY "Users can upload previews"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'previews');

CREATE POLICY "Users can update their previews"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'previews' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'previews' AND owner = auth.uid());

CREATE POLICY "Users can delete their previews"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'previews' AND owner = auth.uid());