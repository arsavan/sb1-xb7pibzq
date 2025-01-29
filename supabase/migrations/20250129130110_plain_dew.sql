/*
  # Add site URL to theme settings

  1. Changes
    - Add site_url column to theme_settings table
    - Set default value for existing rows
    - Add storage bucket for public files
    - Add storage policies for robots.txt and sitemap.xml
*/

-- Add site_url column to theme_settings
ALTER TABLE theme_settings 
ADD COLUMN IF NOT EXISTS site_url text NOT NULL DEFAULT 'https://craquetabudget.com';

-- Update existing rows
UPDATE theme_settings 
SET site_url = 'https://craquetabudget.com' 
WHERE site_url IS NULL;

-- Create public bucket for robots.txt and sitemap.xml if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the public bucket
CREATE POLICY "Public files are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'public');

CREATE POLICY "Only admins can manage public files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public'
    AND (name = 'robots.txt' OR name = 'sitemap.xml')
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update public files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public'
    AND (name = 'robots.txt' OR name = 'sitemap.xml')
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'public'
    AND (name = 'robots.txt' OR name = 'sitemap.xml')
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete public files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public'
    AND (name = 'robots.txt' OR name = 'sitemap.xml')
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );