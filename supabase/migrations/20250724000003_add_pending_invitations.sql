-- Add Pending Invitations Table
-- This migration creates a table to store invitations for users who haven't registered yet

-- Create pending_company_invitations table
CREATE TABLE public.pending_company_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  relationship_type public.user_role NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Ensure unique pending invitation per company-email-role combination
  CONSTRAINT unique_pending_company_email_role UNIQUE (company_id, email, relationship_type)
);

-- Create indexes for performance
CREATE INDEX idx_pending_company_invitations_company_id ON public.pending_company_invitations(company_id);
CREATE INDEX idx_pending_company_invitations_email ON public.pending_company_invitations(email);
CREATE INDEX idx_pending_company_invitations_status ON public.pending_company_invitations(status);
CREATE INDEX idx_pending_company_invitations_expires_at ON public.pending_company_invitations(expires_at);

-- Enable Row Level Security
ALTER TABLE public.pending_company_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_company_invitations table
CREATE POLICY "Super admins can view all pending invitations" 
  ON public.pending_company_invitations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Company admins can view their company pending invitations" 
  ON public.pending_company_invitations 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view pending invitations sent to their email" 
  ON public.pending_company_invitations 
  FOR SELECT 
  USING (
    email = (
      SELECT email FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Company admins can manage their company pending invitations" 
  ON public.pending_company_invitations 
  FOR ALL 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all pending invitations" 
  ON public.pending_company_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

-- Create a function to automatically process pending invitations when a user registers
CREATE OR REPLACE FUNCTION public.process_pending_invitations_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a new profile is created, check for pending invitations
  INSERT INTO public.company_user_relationships (
    company_id,
    user_id,
    relationship_type,
    invited_by,
    status,
    accepted_at
  )
  SELECT 
    pci.company_id,
    NEW.id,
    pci.relationship_type,
    pci.invited_by,
    'active',
    NOW()
  FROM public.pending_company_invitations pci
  WHERE pci.email = NEW.email
    AND pci.status = 'pending'
    AND pci.expires_at > NOW();

  -- Mark processed pending invitations as accepted
  UPDATE public.pending_company_invitations
  SET status = 'accepted'
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW();

  RETURN NEW;
END;
$$;

-- Create trigger to process pending invitations when a user signs up
CREATE TRIGGER process_pending_invitations_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.process_pending_invitations_on_signup();

-- Create a function to clean up expired pending invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_pending_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pending_company_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.cleanup_expired_pending_invitations() TO authenticated;
