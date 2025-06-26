
-- Add new columns to profiles table for biosecurity attestation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS responsible_person_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS responsible_person_designation text;

-- Responsible person declarations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_cloven_hooved_animals boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_livestock_kept_away boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_animal_origin_feed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_veterinary_products_registered boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease_farm boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_livestock_south_africa boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_no_gene_editing boolean DEFAULT false;

-- Signature fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_date timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signed_location text;
