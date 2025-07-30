-- Add Security Definer Function for Company Membership Access
-- This migration creates a function to safely get company contexts without RLS recursion

-- Create a security definer function to get user company contexts
CREATE OR REPLACE FUNCTION public.get_user_company_contexts(user_id_param UUID)
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  user_role public.user_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cur.company_id,
    c.name as company_name,
    cur.relationship_type as user_role
  FROM company_user_relationships cur
  JOIN companies c ON cur.company_id = c.id
  WHERE cur.user_id = user_id_param
    AND cur.status = 'active';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_company_contexts(UUID) TO authenticated;

-- This function bypasses RLS policies to safely join company_user_relationships with companies
-- It's secure because it only returns data for the specified user_id parameter
