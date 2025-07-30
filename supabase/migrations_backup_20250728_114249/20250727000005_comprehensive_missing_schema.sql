-- Comprehensive migration to add all missing schema elements from skipped migrations
-- This consolidates all the important changes from the improperly named migration files

-- ============================================================================
-- ENUM TYPES (if they don't exist)
-- ============================================================================

-- Ensure enum types exist
DO $$ 
BEGIN
    -- Check if user_role enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'seller', 'vet', 'agent', 'load_master');
    ELSE
        -- Add load_master to existing enum if it doesn't exist
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'load_master';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
    
    -- Check if user_status enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
    END IF;
    
    -- Check if language_preference enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'language_preference') THEN
        CREATE TYPE language_preference AS ENUM ('en', 'af');
    END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

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

-- ============================================================================
-- PROFILES TABLE ENHANCEMENTS
-- ============================================================================

-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP WITH TIME ZONE;

-- Add biosecurity attestation fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS responsible_person_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS responsible_person_designation TEXT;

-- Responsible person declarations for profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_cloven_hooved_animals BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_livestock_kept_away BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_animal_origin_feed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_veterinary_products_registered BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease_farm BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_livestock_south_africa BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_gene_editing BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_responsible_person_definition BOOLEAN DEFAULT false;

-- Signature fields for profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_data TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signed_location TEXT;

-- ============================================================================
-- APPROVAL ACTIONS TABLE
-- ============================================================================

-- Create approval_actions table to track who approved/rejected users and when
CREATE TABLE IF NOT EXISTS public.approval_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_by UUID NOT NULL REFERENCES auth.users(id),
  action user_status NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on approval_actions
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view approval actions" ON public.approval_actions;
DROP POLICY IF EXISTS "Admins can insert approval actions" ON public.approval_actions;

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

-- ============================================================================
-- LIVESTOCK OFFERS TABLE (if not using the new system)
-- ============================================================================

-- Create livestock_offers table if it doesn't exist (this may be deprecated in favor of new system)
CREATE TABLE IF NOT EXISTS public.livestock_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.livestock_listings(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  chalmar_beef_offer DECIMAL(10,2) NOT NULL,
  to_weight INTEGER NOT NULL,
  then_penilazation_of DECIMAL(10,2) NOT NULL,
  and_from INTEGER NOT NULL,
  penilazation_of DECIMAL(10,2) NOT NULL,
  percent_heifers_allowed INTEGER NOT NULL,
  penilazation_for_additional_heifers DECIMAL(10,2) NOT NULL,
  offer_valid_until_date DATE NOT NULL,
  offer_valid_until_time TIME NOT NULL,
  additional_r25_per_calf BOOLEAN DEFAULT FALSE,
  affidavit_required BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  seller_response_date TIMESTAMP WITH TIME ZONE,
  seller_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on livestock_offers
ALTER TABLE public.livestock_offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can create offers" ON public.livestock_offers;
DROP POLICY IF EXISTS "Admins can view all offers" ON public.livestock_offers;
DROP POLICY IF EXISTS "Sellers can view their offers" ON public.livestock_offers;
DROP POLICY IF EXISTS "Sellers can update their offers" ON public.livestock_offers;

-- Create policies for livestock_offers
CREATE POLICY "Admins can create offers"
  ON public.livestock_offers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can view all offers"
  ON public.livestock_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND status = 'approved'
    )
  );

CREATE POLICY "Sellers can view their offers"
  ON public.livestock_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.livestock_listings ll
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE ll.id = livestock_offers.listing_id
      AND ll.seller_id = auth.uid()
      AND p.role = 'seller'
      AND p.status = 'approved'
    )
  );

CREATE POLICY "Sellers can update their offers"
  ON public.livestock_offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.livestock_listings ll
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE ll.id = livestock_offers.listing_id
      AND ll.seller_id = auth.uid()
      AND p.role = 'seller'
      AND p.status = 'approved'
    )
  );

-- ============================================================================
-- ADDITIONAL LIVESTOCK LISTINGS FIELDS
-- ============================================================================

-- Add fields that might be missing from livestock_listings (some may already exist)
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS livestock_moved_month INTEGER;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS livestock_moved_year INTEGER;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS additional_r25_per_calf BOOLEAN;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS affidavit_file_path TEXT;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS affidavit_required BOOLEAN;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS assigned_vet_id UUID REFERENCES auth.users(id);
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS invited_vet_email TEXT;

-- ============================================================================
-- ENHANCED RLS POLICIES FOR PROFILES
-- ============================================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view pending profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profile status" ON public.profiles;

-- Enhanced policies for profiles
CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.get_current_user_role() IN ('super_admin', 'admin')
    AND public.get_current_user_status() = 'approved'
  );

CREATE POLICY "Admins can update profile status" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.get_current_user_role() IN ('super_admin', 'admin') 
    AND public.get_current_user_status() = 'approved'
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.profiles.profile_completed IS 'Whether the user has completed their profile setup';
COMMENT ON COLUMN public.profiles.profile_completed_at IS 'When the user completed their profile setup';
COMMENT ON COLUMN public.profiles.responsible_person_name IS 'Name of the person responsible for livestock declarations';
COMMENT ON COLUMN public.profiles.responsible_person_designation IS 'Job title/designation of the responsible person';
COMMENT ON TABLE public.approval_actions IS 'Tracks approval/rejection actions by administrators';
COMMENT ON TABLE public.livestock_offers IS 'Livestock offers from admins to sellers (may be deprecated)';

-- ============================================================================
-- UPDATE EXISTING DATA
-- ============================================================================

-- Update existing profiles to mark them as incomplete if they haven't gone through profile completion
UPDATE public.profiles 
SET profile_completed = FALSE 
WHERE profile_completed IS NULL;