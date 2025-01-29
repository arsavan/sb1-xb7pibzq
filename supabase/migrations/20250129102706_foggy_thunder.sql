/*
  # Update products table policies

  1. Changes
    - Add explicit public access policy for products table
    - Ensure anonymous users can read products
*/

-- Drop existing policies if they conflict
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

-- Create new policy for public read access
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);