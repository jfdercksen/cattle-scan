
-- Add new columns to livestock_listings table for biosecurity attestation
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS responsible_person_name text;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS responsible_person_designation text;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS breeder_name text;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS is_breeder_seller boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS farm_birth_address text;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS farm_loading_address text;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS livestock_moved_out_of_boundaries boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS livestock_moved_location text;

-- Responsible person declarations
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_cloven_hooved_animals boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_livestock_kept_away boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_animal_origin_feed boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_veterinary_products_registered boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease_farm boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_livestock_south_africa boolean DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_gene_editing boolean DEFAULT false;

-- Livestock loading details
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS number_cattle_loaded integer DEFAULT 0;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS number_sheep_loaded integer DEFAULT 0;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS truck_registration_number text;

-- Signature fields
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS signature_date timestamp with time zone;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS signed_location text;
