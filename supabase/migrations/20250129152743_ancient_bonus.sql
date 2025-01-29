/*
  # Add images column to products table

  1. Changes
    - Add `images` column to store additional product images
    - Default value is an empty array
    - Existing products will have an empty array for images
*/

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

-- Update existing products to have empty images array if null
UPDATE products SET images = '{}'::text[] WHERE images IS NULL;