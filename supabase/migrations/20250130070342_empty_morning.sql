/*
  # Add favicon support
  
  1. Schema Changes
    - Add favicon_url column to theme_settings table
    - Set default favicon URL
  
  2. Storage Policies
    - Update public bucket policies for favicon storage
    - Allow admins to manage favicon files
*/

-- Add favicon_url column to theme_settings
ALTER TABLE theme_settings 
ADD COLUMN IF NOT EXISTS favicon_url text NOT NULL 
DEFAULT 'https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo.svg';

-- Update existing rows
UPDATE theme_settings 
SET favicon_url = 'https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo.svg' 
WHERE favicon_url IS NULL;

-- Drop existing storage policies for public bucket
DROP POLICY IF EXISTS "Public files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can manage public files" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update public files" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete public files" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Public files are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'public');

CREATE POLICY "Admins can insert public files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public'
    AND (
      -- Allow favicon files
      (storage.foldername(name))[1] = 'public' 
      AND (
        name LIKE '%.ico' OR 
        name LIKE '%.png' OR 
        name LIKE '%.svg'
      )
      -- Or allow robots.txt and sitemap.xml
      OR name IN ('robots.txt', 'sitemap.xml')
    )
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update public files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'public'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete public files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );