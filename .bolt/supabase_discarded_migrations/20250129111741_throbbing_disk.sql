/*
  # Fix user roles policies and functions

  1. Changes
    - Drop policies in correct order
    - Recreate functions with improved security
    - Add new policies with proper dependencies
  
  2. Security
    - Maintain proper role checking
    - Ensure secure role management
    - Prevent unauthorized access
*/

-- First, drop all policies that depend on is_admin()
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Allow role management" ON user_roles;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS get_user_role();

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies with improved security
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

CREATE POLICY "Allow role management"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN is_admin() THEN true
      WHEN NOT EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid()
      ) AND NEW.role = 'user' AND NEW.user_id = auth.uid() THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE 
      WHEN is_admin() THEN true
      WHEN NOT EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid()
      ) AND NEW.role = 'user' AND NEW.user_id = auth.uid() THEN true
      ELSE false
    END
  );