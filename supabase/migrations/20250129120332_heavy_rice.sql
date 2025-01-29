/*
  # Fix theme settings table

  1. Changes
    - Ensure only one active theme settings row
    - Add trigger to maintain single active row
    - Add default theme settings
*/

-- First, clean up any existing data
DELETE FROM theme_settings
WHERE id NOT IN (
  SELECT id
  FROM theme_settings
  ORDER BY updated_at DESC
  LIMIT 1
);

-- Add is_active column
ALTER TABLE theme_settings ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;

-- Create function to ensure only one active row
CREATE OR REPLACE FUNCTION maintain_single_active_theme()
RETURNS TRIGGER AS $$
BEGIN
  -- If we're activating this row, deactivate all others
  IF NEW.is_active THEN
    UPDATE theme_settings
    SET is_active = false
    WHERE id != NEW.id;
  END IF;

  -- If we're trying to deactivate the last active row, keep it active
  IF NOT NEW.is_active AND NOT EXISTS (
    SELECT 1 FROM theme_settings
    WHERE is_active = true AND id != NEW.id
  ) THEN
    NEW.is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS ensure_single_active_theme ON theme_settings;
CREATE TRIGGER ensure_single_active_theme
  BEFORE INSERT OR UPDATE OF is_active
  ON theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION maintain_single_active_theme();

-- Ensure we have exactly one active theme
UPDATE theme_settings
SET is_active = true
WHERE id = (
  SELECT id
  FROM theme_settings
  ORDER BY updated_at DESC
  LIMIT 1
);

-- Insert default settings if no rows exist
INSERT INTO theme_settings (
  site_title,
  primary_color,
  primary_hover_color,
  secondary_color,
  accent_color,
  is_active
)
SELECT
  'CraqueTonBudget',
  '#6366f1',
  '#4f46e5',
  '#ec4899',
  '#8b5cf6',
  true
WHERE NOT EXISTS (SELECT 1 FROM theme_settings);