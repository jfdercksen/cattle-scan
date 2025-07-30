-- Add truck_registration_number field to livestock_listings table
-- This field stores the truck registration number used for loading

ALTER TABLE public.livestock_listings 
ADD COLUMN IF NOT EXISTS truck_registration_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.livestock_listings.truck_registration_number IS 'Registration number of the truck used for loading livestock';