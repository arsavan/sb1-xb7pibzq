/*
  # Ajout des paramètres Amazon Affiliate

  1. Nouvelle Table
    - `amazon_settings`
      - `id` (uuid, primary key)
      - `access_key_id` (text)
      - `secret_access_key` (text)
      - `partner_tag` (text)
      - `host` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS
    - Seuls les admins peuvent voir et modifier les paramètres
*/

-- Create amazon_settings table
CREATE TABLE IF NOT EXISTS amazon_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key_id text NOT NULL,
  secret_access_key text NOT NULL,
  partner_tag text NOT NULL,
  host text NOT NULL DEFAULT 'webservices.amazon.fr',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE amazon_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Only admins can view amazon settings"
  ON amazon_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only admins can modify settings
CREATE POLICY "Only admins can modify amazon settings"
  ON amazon_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_amazon_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_amazon_settings_updated_at
  BEFORE UPDATE ON amazon_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_amazon_settings_updated_at();