/*
  # Add user role function

  1. Changes
    - Add function to get user role
    - Ensure proper security context
  
  2. Security
    - Use security definer for proper access control
    - Return role as text
*/

-- Create a function to get user role that returns the role directly
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;