
-- Create helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_status()
RETURNS user_status
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can insert their own profile (this is actually handled by the trigger)
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile data"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'super_admin' 
    AND public.get_current_user_status() = 'approved'
  );

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.get_current_user_role() = 'super_admin' 
    AND public.get_current_user_status() = 'approved'
  );
