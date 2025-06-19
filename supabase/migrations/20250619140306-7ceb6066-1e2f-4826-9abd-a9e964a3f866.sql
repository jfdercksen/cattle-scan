
-- Check current RLS policies and fix them to allow super admins to see all profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Recreate the policy with proper logic
CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() IN ('super_admin', 'admin')
    AND public.get_current_user_status() = 'approved'
  );

-- Also ensure the policy works for viewing pending users specifically
CREATE POLICY "Admins can view pending profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() IN ('super_admin', 'admin')
    AND public.get_current_user_status() = 'approved'
  );
