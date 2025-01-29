/*
  # Create storage bucket for images

  1. New Storage Bucket
    - Creates a new public bucket named 'images' for storing product images
    - Enables public access for reading images
    - Sets up RLS policies for managing images

  2. Security
    - Enables RLS on the bucket
    - Adds policies for authenticated users to upload/delete images
    - Allows public read access to all images
*/

-- Enable storage by creating the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'products'
  );

CREATE POLICY "Authenticated users can update their images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');