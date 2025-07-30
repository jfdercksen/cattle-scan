
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

-- Add an approval_actions table to track who approved/rejected users and when
CREATE TABLE public.approval_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_by UUID NOT NULL REFERENCES auth.users(id),
  action user_status NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on approval_actions
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;

-- Only super admins and admins can view approval actions
CREATE POLICY "Admins can view approval actions" 
  ON public.approval_actions 
  FOR SELECT 
  USING (
    public.get_current_user_role() IN ('super_admin', 'admin') 
    AND public.get_current_user_status() = 'approved'
  );

-- Only super admins and admins can insert approval actions
CREATE POLICY "Admins can insert approval actions" 
  ON public.approval_actions 
  FOR INSERT 
  WITH CHECK (
    public.get_current_user_role() IN ('super_admin', 'admin') 
    AND public.get_current_user_status() = 'approved'
    AND auth.uid() = action_by
  );

-- Add policy for super admins and admins to update any profile status
CREATE POLICY "Admins can update profile status" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.get_current_user_role() IN ('super_admin', 'admin') 
    AND public.get_current_user_status() = 'approved'
  );
