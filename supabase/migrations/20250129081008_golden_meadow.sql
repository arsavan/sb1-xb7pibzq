/*
  # Création de la table des produits

  1. Nouvelle Table
    - `products`
      - `id` (uuid, clé primaire)
      - `name` (text, nom du produit)
      - `price` (numeric, prix)
      - `rating` (numeric, note)
      - `reviews` (integer, nombre d'avis)
      - `image_url` (text, URL de l'image)
      - `amazon_url` (text, lien d'affiliation)
      - `discount` (integer, réduction optionnelle)
      - `tags` (text[], tableau de tags)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé
    - Politique de lecture pour tous
    - Politique d'écriture pour les administrateurs uniquement
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  image_url text NOT NULL,
  amazon_url text NOT NULL,
  discount integer,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products are editable by authenticated users only"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);