-- Create a security definer function to approve users
-- This bypasses RLS restrictions and allows admin users to approve other users

CREATE OR REPLACE FUNCTION approve_user_by_admin(
  target_user_id UUID,
  requesting_user_id UUID
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin or super_admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = requesting_user_id 
    AND p.role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admin or super_admin users can approve other users';
  END IF;

  -- Update the target user's status to approved
  UPDATE profiles 
  SET 
    status = 'approved',
    updated_at = NOW()
  WHERE profiles.id = target_user_id;

  -- Return the updated user profile
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role::TEXT,
    p.status::TEXT,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = target_user_id;
END;
$$;
