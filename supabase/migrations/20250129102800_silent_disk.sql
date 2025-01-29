/*
  # Update products access policy

  1. Changes
    - Ensure public read access for products
    - Add explicit policy for anonymous access
*/

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

-- Create new policy for public read access
CREATE POLICY "Public products access"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Ensure RLS is enabled but allows public access
ALTER TABLE products FORCE ROW LEVEL SECURITY;