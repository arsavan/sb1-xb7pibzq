-- Add header_icon column to theme_settings
ALTER TABLE theme_settings 
ADD COLUMN IF NOT EXISTS header_icon text DEFAULT 'ShoppingCart';

-- Update existing rows
UPDATE theme_settings 
SET header_icon = 'ShoppingCart' 
WHERE header_icon IS NULL;