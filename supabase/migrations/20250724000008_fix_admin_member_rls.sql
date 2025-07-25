-- Fix RLS policy to allow admin members (not just owners) to view company relationships
-- This allows users with admin role in a company to see all relationships for that company

-- Add policy to allow users with admin role in a company to view all relationships for that company
CREATE POLICY "Company admin members can view all company relationships" 
  ON public.company_user_relationships 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.company_user_relationships 
      WHERE user_id = auth.uid() 
      AND relationship_type = 'admin'
      AND status = 'active'
    )
  );

-- Add policy to allow users with admin role in a company to manage all relationships for that company
CREATE POLICY "Company admin members can manage all company relationships" 
  ON public.company_user_relationships 
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
