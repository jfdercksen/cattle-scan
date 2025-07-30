-- Add missing columns to livestock_listings table from skipped migrations
-- These fields are needed for biosecurity attestation and livestock declarations

-- Biosecurity and farm information
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS responsible_person_name TEXT;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS responsible_person_designation TEXT;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS breeder_name TEXT;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS is_breeder_seller BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS farm_birth_address TEXT;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS farm_loading_address TEXT;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS livestock_moved_out_of_boundaries BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS livestock_moved_location TEXT;

-- Responsible person declarations
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_cloven_hooved_animals BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_livestock_kept_away BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_animal_origin_feed BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_veterinary_products_registered BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_foot_mouth_disease_farm BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_livestock_south_africa BOOLEAN DEFAULT false;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS declaration_no_gene_editing BOOLEAN DEFAULT false;

-- Livestock loading details (number_cattle_loaded and number_sheep_loaded were removed in earlier fixes)
-- truck_registration_number was already added in a previous migration

-- Signature fields
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS signature_data TEXT;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS signature_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.livestock_listings ADD COLUMN IF NOT EXISTS signed_location TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.livestock_listings.responsible_person_name IS 'Name of the person responsible for the livestock';
COMMENT ON COLUMN public.livestock_listings.responsible_person_designation IS 'Job title/designation of the responsible person';
COMMENT ON COLUMN public.livestock_listings.breeder_name IS 'Name of the livestock breeder';
COMMENT ON COLUMN public.livestock_listings.is_breeder_seller IS 'Whether the seller is also the breeder';
COMMENT ON COLUMN public.livestock_listings.farm_birth_address IS 'Address where the livestock was born';
COMMENT ON COLUMN public.livestock_listings.farm_loading_address IS 'Address where the livestock will be loaded';
COMMENT ON COLUMN public.livestock_listings.livestock_moved_out_of_boundaries IS 'Whether livestock has moved outside farm boundaries';
COMMENT ON COLUMN public.livestock_listings.livestock_moved_location IS 'Location where livestock was moved to';
COMMENT ON COLUMN public.livestock_listings.signature_data IS 'Digital signature data for the listing';
COMMENT ON COLUMN public.livestock_listings.signature_date IS 'Date and time when the listing was signed';
COMMENT ON COLUMN public.livestock_listings.signed_location IS 'Location where the listing was signed';