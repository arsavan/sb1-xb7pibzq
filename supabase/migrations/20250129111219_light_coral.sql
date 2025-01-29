/*
  # Fix user roles policies to prevent infinite recursion

  1. Changes
    - Drop existing policies
    - Create new policies with proper access control
    - Add function to check admin status safely
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "User roles are viewable by authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "New users can insert their own user role" ON user_roles;

-- Create a function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies with proper access control
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR (
    -- Allow users to insert their own 'user' role if they don't have one
    auth.uid() = user_id 
    AND role = 'user'
    AND NOT EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Admins can update roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (is_admin());