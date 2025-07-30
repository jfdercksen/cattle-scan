
-- Create security definer function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create security definer function to check user status
CREATE OR REPLACE FUNCTION public.get_current_user_status()
RETURNS user_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- Add missing INSERT policy for profiles
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Recreate super admin policies using security definer functions
CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'super_admin' 
    AND public.get_current_user_status() = 'approved'
  );

CREATE POLICY "Super admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.get_current_user_role() = 'super_admin' 
    AND public.get_current_user_status() = 'approved'
  );

-- Add missing UPDATE policy for users to update their own profiles
CREATE POLICY "Users can update their own profile data"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update farms policies to use security definer functions
DROP POLICY IF EXISTS "Approved users can view farms" ON public.farms;

CREATE POLICY "Approved users can view farms" 
  ON public.farms 
  FOR SELECT 
  USING (
    public.get_current_user_status() = 'approved'
  );

-- Update audit log policy to use security definer functions
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.audit_log;

CREATE POLICY "Super admins can view audit logs" 
  ON public.audit_log 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'super_admin' 
    AND public.get_current_user_status() = 'approved'
  );
