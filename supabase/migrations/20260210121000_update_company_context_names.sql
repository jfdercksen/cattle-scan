CREATE OR REPLACE FUNCTION public.get_user_companies(user_uuid uuid)
RETURNS TABLE(company_id uuid, company_name text, relationship_type public.user_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as company_id,
    COALESCE(cs.registered_name, c.name) as company_name,
    COALESCE(cur.relationship_type, 'admin'::public.user_role) as relationship_type
  FROM public.companies c
  LEFT JOIN public.company_settings cs ON cs.company_id = c.id
  LEFT JOIN public.company_user_relationships cur
    ON c.id = cur.company_id
    AND cur.user_id = user_uuid
  WHERE
    c.admin_user_id = user_uuid
    OR (cur.user_id = user_uuid AND cur.status = 'active');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_contexts(user_id_param uuid)
RETURNS TABLE(company_id uuid, company_name text, user_role public.user_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cur.company_id,
    COALESCE(cs.registered_name, c.name) as company_name,
    cur.relationship_type as user_role
  FROM company_user_relationships cur
  JOIN companies c ON cur.company_id = c.id
  LEFT JOIN company_settings cs ON cs.company_id = c.id
  WHERE cur.user_id = user_id_param
    AND cur.status = 'active';
END;
$$;

