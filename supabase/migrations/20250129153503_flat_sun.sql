-- First, ensure the column doesn't exist to avoid conflicts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'images'
    ) THEN
        ALTER TABLE products 
        ADD COLUMN images text[] DEFAULT '{}'::text[];
    END IF;
END $$;

-- Update any null values to empty array
UPDATE products 
SET images = '{}'::text[] 
WHERE images IS NULL;

-- Add a check constraint to ensure the column is always an array
ALTER TABLE products 
ADD CONSTRAINT images_is_array 
CHECK (images IS NULL OR array_ndims(images) = 1);

-- Grant necessary permissions
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- Notify PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';