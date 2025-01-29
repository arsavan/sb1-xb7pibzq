/*
  # Theme Settings Table

  1. New Tables
    - `theme_settings`
      - `id` (uuid, primary key)
      - `site_title` (text, not null)
      - `primary_color` (text, not null)
      - `primary_hover_color` (text, not null)
      - `secondary_color` (text, not null)
      - `accent_color` (text, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `theme_settings` table
    - Add policy for public read access
    - Add policy for admin-only write access
*/

-- Create theme_settings table
CREATE TABLE IF NOT EXISTS theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title text NOT NULL DEFAULT 'CraqueTonBudget',
  primary_color text NOT NULL DEFAULT '#6366f1',
  primary_hover_color text NOT NULL DEFAULT '#4f46e5',
  secondary_color text NOT NULL DEFAULT '#ec4899',
  accent_color text NOT NULL DEFAULT '#8b5cf6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Theme settings are viewable by everyone"
  ON theme_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Theme settings are editable by admins only"
  ON theme_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_theme_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_settings_updated_at();

-- Insert default settings if none exist
INSERT INTO theme_settings (site_title, primary_color, primary_hover_color, secondary_color, accent_color)
SELECT 'CraqueTonBudget', '#6366f1', '#4f46e5', '#ec4899', '#8b5cf6'
WHERE NOT EXISTS (SELECT 1 FROM theme_settings);