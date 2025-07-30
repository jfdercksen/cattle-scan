-- Add RLS Policy for Company Members
-- This migration adds a policy to allow users to view companies they are members of (not just companies they own/admin)

-- Add policy to allow users to view companies they are members of through company_user_relationships
CREATE POLICY "Users can view companies they are members of" 
  ON public.companies 
  FOR SELECT 
  USING (
    id IN (
      SELECT company_id 
      FROM public.company_user_relationships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- This policy allows users to see company data when they have an active relationship with the company
-- This is essential for multi-tenant functionality where users can be members of companies they don't own
