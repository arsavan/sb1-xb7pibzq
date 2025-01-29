/*
  # Fix RLS policies for products table

  1. Changes
    - Add policy to allow authenticated users to insert products
    - Add policy to allow authenticated users to delete products
    - Add policy to allow authenticated users to update products

  2. Security
    - Maintain public read access
    - Restrict write operations to authenticated users only
*/

-- Allow authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete their products
CREATE POLICY "Allow authenticated users to delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users to update products
CREATE POLICY "Allow authenticated users to update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);