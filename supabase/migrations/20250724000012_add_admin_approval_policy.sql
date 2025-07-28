-- Add RLS policy to allow admin users to approve other users
-- This allows admin users (both approved and pending) to update the status field of other users' profiles
-- Admin users can approve other users regardless of their own approval status

-- First create the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_current_user_role() 
RETURNS public.user_role 
AS $$ 
  SELECT role FROM public.profiles WHERE id = auth.uid(); 
$$ 
LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Admins can approve users"
  ON public.profiles
  FOR UPDATE
  USING (
    public.get_current_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'super_admin')
  );
