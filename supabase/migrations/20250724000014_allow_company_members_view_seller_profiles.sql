-- Allow company members to view seller profiles for invitation dashboard
-- This policy allows users to view profiles of sellers who have invitations in their company

-- First create the missing function
CREATE OR REPLACE FUNCTION public.get_current_user_status() 
RETURNS public.user_status 
AS $$ 
  SELECT status FROM public.profiles WHERE id = auth.uid(); 
$$ 
LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Company members can view seller profiles for invitations"
  ON public.profiles
  FOR SELECT
  USING (
    -- Super admins and admins can see all profiles (existing logic)
    (
      public.get_current_user_role() IN ('super_admin', 'admin')
      AND public.get_current_user_status() = 'approved'
    )
    OR
    -- Company members can see seller profiles if there's a listing invitation 
    -- from that seller to their company
    EXISTS (
      SELECT 1 
      FROM public.company_user_relationships cur
      JOIN public.listing_invitations li ON li.company_id = cur.company_id
      WHERE cur.user_id = auth.uid()
        AND cur.status = 'active'
        AND li.seller_id = profiles.id
    )
    OR
    -- Users can always see their own profile
    profiles.id = auth.uid()
  );
