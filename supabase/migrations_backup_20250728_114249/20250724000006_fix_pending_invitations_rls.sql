-- Fix Pending Invitations RLS Policy
-- Add policy to allow company admin members (not just owners) to create pending invitations

-- Add policy to allow users with admin role in a company to manage pending invitations for that company
CREATE POLICY "Company admin members can manage pending invitations" 
  ON public.pending_company_invitations 
  FOR ALL 
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.company_user_relationships 
      WHERE user_id = auth.uid() 
      AND relationship_type = 'admin'
      AND status = 'active'
    )
  );

-- This policy allows users who are admin members of a company (not just owners) 
-- to create and manage pending invitations for that company
