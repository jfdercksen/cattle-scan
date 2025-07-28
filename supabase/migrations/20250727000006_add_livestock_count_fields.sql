-- Add missing livestock count and type fields to livestock_listings table
-- These fields are essential for the application functionality

-- Add livestock type field
ALTER TABLE public.livestock_listings 
ADD COLUMN IF NOT EXISTS livestock_type TEXT;

-- Add livestock count fields
ALTER TABLE public.livestock_listings 
ADD COLUMN IF NOT EXISTS number_cattle_loaded INTEGER DEFAULT 0;

ALTER TABLE public.livestock_listings 
ADD COLUMN IF NOT EXISTS number_sheep_loaded INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.livestock_listings.livestock_type IS 'Type of livestock (CATTLE, SHEEP, or CATTLE AND SHEEP)';
COMMENT ON COLUMN public.livestock_listings.number_cattle_loaded IS 'Total number of cattle loaded for this listing';
COMMENT ON COLUMN public.livestock_listings.number_sheep_loaded IS 'Total number of sheep loaded for this listing';