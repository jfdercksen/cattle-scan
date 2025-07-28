-- Multi-Tenant Company-Based Architecture Migration
-- This migration adds the foundational multi-tenant schema for company-based data isolation

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure company names are unique
  CONSTRAINT unique_company_name UNIQUE (name),
  -- Ensure each admin can only have one company (for now)
  CONSTRAINT unique_admin_user UNIQUE (admin_user_id)
);

-- Create company_user_relationships table for many-to-many relationships
CREATE TABLE public.company_user_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type public.user_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure unique relationship per company-user-role combination
  CONSTRAINT unique_company_user_role UNIQUE (company_id, user_id, relationship_type)
);

-- Add company_id to livestock_listings table
ALTER TABLE public.livestock_listings 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add company_id to listing_invitations table (create table if it doesn't exist)
DO $$ 
BEGIN
    -- Create listing_invitations table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_invitations') THEN
        CREATE TABLE public.listing_invitations (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            reference_id TEXT NOT NULL UNIQUE,
            seller_id UUID REFERENCES auth.users(id),
            seller_email TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
            created_by UUID NOT NULL REFERENCES auth.users(id),
            listing_id UUID REFERENCES public.livestock_listings(id),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.listing_invitations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Add company_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listing_invitations' AND column_name = 'company_id') THEN
        ALTER TABLE public.listing_invitations 
        ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX idx_companies_admin_user_id ON public.companies(admin_user_id);
CREATE INDEX idx_company_user_relationships_company_id ON public.company_user_relationships(company_id);
CREATE INDEX idx_company_user_relationships_user_id ON public.company_user_relationships(user_id);
CREATE INDEX idx_company_user_relationships_status ON public.company_user_relationships(status);
CREATE INDEX idx_livestock_listings_company_id ON public.livestock_listings(company_id);
CREATE INDEX idx_listing_invitations_company_id ON public.listing_invitations(company_id);

-- Enable Row Level Security on new tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_user_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies table
CREATE POLICY "Super admins can view all companies" 
  ON public.companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Company admins can view their own company" 
  ON public.companies 
  FOR SELECT 
  USING (admin_user_id = auth.uid());

CREATE POLICY "Users can view companies they belong to" 
  ON public.companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_user_relationships 
      WHERE company_id = companies.id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Super admins can manage all companies" 
  ON public.companies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Company admins can update their own company" 
  ON public.companies 
  FOR UPDATE 
  USING (admin_user_id = auth.uid());

-- RLS Policies for company_user_relationships table
CREATE POLICY "Super admins can view all relationships" 
  ON public.company_user_relationships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Company admins can view their company relationships" 
  ON public.company_user_relationships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own relationships" 
  ON public.company_user_relationships 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Company admins can manage their company relationships" 
  ON public.company_user_relationships 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id 
      AND admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all relationships" 
  ON public.company_user_relationships 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

-- Update RLS policies for livestock_listings to include company isolation
DROP POLICY IF EXISTS "Users can view livestock listings" ON public.livestock_listings;
DROP POLICY IF EXISTS "Sellers can manage their listings" ON public.livestock_listings;
DROP POLICY IF EXISTS "Approved users can view listings" ON public.livestock_listings;

CREATE POLICY "Users can view listings from their companies" 
  ON public.livestock_listings 
  FOR SELECT 
  USING (
    -- Super admins can see all
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
    OR
    -- Users can see listings from companies they belong to
    EXISTS (
      SELECT 1 FROM public.company_user_relationships 
      WHERE company_id = livestock_listings.company_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
    OR
    -- Company admins can see their company listings
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = livestock_listings.company_id 
      AND admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can manage their own listings within company context" 
  ON public.livestock_listings 
  FOR ALL 
  USING (
    seller_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.company_user_relationships 
      WHERE company_id = livestock_listings.company_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Company admins can manage their company listings" 
  ON public.livestock_listings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = livestock_listings.company_id 
      AND admin_user_id = auth.uid()
    )
  );

-- Update RLS policies for listing_invitations to include company isolation
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.listing_invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON public.listing_invitations;

CREATE POLICY "Company admins can manage their company invitations" 
  ON public.listing_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = listing_invitations.company_id 
      AND admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all invitations" 
  ON public.listing_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Users can view invitations for their companies" 
  ON public.listing_invitations 
  FOR SELECT 
  USING (
    seller_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.company_user_relationships 
      WHERE company_id = listing_invitations.company_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Function to get user's companies
CREATE OR REPLACE FUNCTION public.get_user_companies(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  relationship_type public.user_role,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as company_id,
    c.name as company_name,
    cur.relationship_type,
    (c.admin_user_id = user_uuid) as is_admin
  FROM public.companies c
  LEFT JOIN public.company_user_relationships cur ON c.id = cur.company_id AND cur.user_id = user_uuid
  WHERE 
    c.admin_user_id = user_uuid 
    OR 
    (cur.user_id = user_uuid AND cur.status = 'active');
END;
$$;

-- Function to check if user can access company data
CREATE OR REPLACE FUNCTION public.can_user_access_company(user_uuid UUID, target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_val public.user_role;
  user_status_val public.user_status;
BEGIN
  -- Get user role and status
  SELECT role, status INTO user_role_val, user_status_val
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Super admins can access all companies
  IF user_role_val = 'super_admin'::public.user_role AND user_status_val = 'approved'::public.user_status THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is admin of the company
  IF EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = target_company_id AND admin_user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has active relationship with the company
  IF EXISTS (
    SELECT 1 FROM public.company_user_relationships 
    WHERE company_id = target_company_id 
    AND user_id = user_uuid 
    AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Update the handle_new_user function to support company creation for first admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  is_first_user BOOLEAN := FALSE;
  user_role_val public.user_role;
  company_name_val TEXT;
BEGIN
  -- Determine if this is the first user (super_admin)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'super_admin' AND status = 'approved') THEN
    is_first_user := TRUE;
    user_role_val := 'super_admin'::public.user_role;
  ELSE
    user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'seller'::public.user_role);
  END IF;
  
  -- Get company name from metadata if provided
  company_name_val := NEW.raw_user_meta_data ->> 'company_name';
  
  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    language_preference,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    user_role_val,
    COALESCE((NEW.raw_user_meta_data ->> 'language')::public.language_preference, 'en'::public.language_preference),
    CASE WHEN is_first_user THEN 'approved'::public.user_status ELSE 'pending'::public.user_status END
  );
  
  -- If this is an admin user and company name is provided, create company
  IF user_role_val = 'admin'::public.user_role AND company_name_val IS NOT NULL THEN
    INSERT INTO public.companies (name, admin_user_id)
    VALUES (company_name_val, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to update updated_at timestamp for companies
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON public.companies 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.companies IS 'Companies table for multi-tenant architecture';
COMMENT ON TABLE public.company_user_relationships IS 'Many-to-many relationships between companies and users';
COMMENT ON COLUMN public.livestock_listings.company_id IS 'Associates listing with a specific company for data isolation';
COMMENT ON COLUMN public.listing_invitations.company_id IS 'Associates invitation with a specific company';