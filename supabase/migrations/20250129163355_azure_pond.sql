/*
  # Add product analytics table

  1. New Tables
    - `product_analytics`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `view_count` (integer)
      - `buy_click_count` (integer)
      - `homepage_buy_click_count` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `product_analytics` table
    - Add policies for authenticated users to insert analytics
    - Add policies for admins to view analytics
*/

-- Create product_analytics table
CREATE TABLE IF NOT EXISTS product_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products NOT NULL,
  view_count integer DEFAULT 0,
  buy_click_count integer DEFAULT 0,
  homepage_buy_click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public to insert analytics
CREATE POLICY "Anyone can insert analytics"
  ON product_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Only admins can view analytics"
  ON product_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_created_at ON product_analytics(created_at);