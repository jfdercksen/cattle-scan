-- Update get_company_users function to include seller_entity_name and company_name fields
-- This ensures the seller dropdown in ListingInvitationForm shows proper seller names

-- Drop the existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_company_users(uuid,uuid);

CREATE OR REPLACE FUNCTION get_company_users(company_id_param UUID, requesting_user_id UUID)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  user_id UUID,
  relationship_type TEXT,
  status TEXT,
  invited_by UUID,
  created_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  user_email TEXT,
  user_first_name TEXT,
  user_last_name TEXT,
  user_role TEXT,
  user_status TEXT,
  user_company_name TEXT,
  user_seller_entity_name TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the requesting user has admin access to this company
  -- Either they are the company owner OR they are an admin member
  IF NOT (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_id_param AND c.admin_user_id = requesting_user_id
    )
    OR
    EXISTS (
      SELECT 1 FROM company_user_relationships cur
      WHERE cur.company_id = company_id_param 
      AND cur.user_id = requesting_user_id 
      AND cur.relationship_type = 'admin'
      AND cur.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = requesting_user_id 
      AND p.role = 'super_admin'
      AND p.status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: User does not have admin access to this company';
  END IF;

  -- Return company users with their profile information including seller fields
  RETURN QUERY
  SELECT 
    cur.id,
    cur.company_id,
    cur.user_id,
    cur.relationship_type,
    cur.status,
    cur.invited_by,
    cur.created_at,
    cur.accepted_at,
    p.email as user_email,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    p.role::TEXT as user_role,
    p.status::TEXT as user_status,
    p.company_name as user_company_name,
    p.seller_entity_name as user_seller_entity_name
  FROM company_user_relationships cur
  LEFT JOIN profiles p ON cur.user_id = p.id
  WHERE cur.company_id = company_id_param
  ORDER BY cur.created_at DESC;
END;
$$;
