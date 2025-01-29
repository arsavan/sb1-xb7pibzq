ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

-- Update existing products to have empty images array if null
UPDATE products SET images = '{}'::text[] WHERE images IS NULL;