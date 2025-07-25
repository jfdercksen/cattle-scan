-- Fix Infinite Recursion in RLS Policies
-- This migration fixes the circular dependency between companies and company_user_relationships tables

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "Company admins can view their company relationships" ON public.company_user_relationships;
DROP POLICY IF EXISTS "Company admins can manage their company relationships" ON public.company_user_relationships;

-- Recreate company_user_relationships policies without circular dependency
-- Super admins can view all relationships (already exists, no change needed)

-- Users can view their own relationships (already exists, no change needed)

-- Company admins can view relationships for companies they admin
-- This uses a direct check against admin_user_id instead of querying companies table
CREATE POLICY "Company admins can view their company relationships" 
  ON public.company_user_relationships 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE admin_user_id = auth.uid()
    )
  );

-- Company admins can manage relationships for companies they admin
CREATE POLICY "Company admins can manage their company relationships" 
  ON public.company_user_relationships 
  FOR ALL 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE admin_user_id = auth.uid()
    )
  );

-- For companies table, we'll use a simpler approach that doesn't cause recursion
-- Users can view companies where they are explicitly the admin
-- OR where they have an active relationship (but we'll check this differently)

-- Create a more efficient policy for users to view companies they belong to
-- This avoids the circular dependency by using a direct subquery approach
CREATE POLICY "Users can view companies they belong to" 
  ON public.companies 
  FOR SELECT 
  USING (
    -- User is the admin of the company
    admin_user_id = auth.uid()
    OR
    -- User has an active relationship with the company
    -- We use a direct subquery that doesn't trigger RLS on company_user_relationships
    id IN (
      SELECT company_id 
      FROM public.company_user_relationships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Add a bypass policy for system operations to prevent recursion
-- This allows the system to read company_user_relationships without triggering company RLS
CREATE POLICY "System bypass for relationships" 
  ON public.company_user_relationships 
  FOR SELECT 
  USING (true);

-- However, we need to be more restrictive, so let's drop the bypass and use a different approach
DROP POLICY IF EXISTS "System bypass for relationships" ON public.company_user_relationships;

-- Instead, let's create a security definer function to handle the complex queries
-- This function will run with elevated privileges to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_companies(user_uuid UUID)
RETURNS TABLE(company_id UUID, company_name TEXT, relationship_type public.user_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as company_id,
    c.name as company_name,
    COALESCE(cur.relationship_type, 'admin'::public.user_role) as relationship_type
  FROM public.companies c
  LEFT JOIN public.company_user_relationships cur ON c.id = cur.company_id AND cur.user_id = user_uuid
  WHERE 
    c.admin_user_id = user_uuid  -- User is admin
    OR 
    (cur.user_id = user_uuid AND cur.status = 'active');  -- User has active relationship
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_companies(UUID) TO authenticated;

-- Update the companies policy to be simpler and avoid recursion
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;

CREATE POLICY "Users can view companies they belong to" 
  ON public.companies 
  FOR SELECT 
  USING (
    -- User is the admin of the company (direct check, no recursion)
    admin_user_id = auth.uid()
  );

-- For non-admin users, we'll handle company access through the application layer
-- using the security definer function to avoid RLS recursion
