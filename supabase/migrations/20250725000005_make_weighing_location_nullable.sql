-- Make weighing_location column nullable in livestock_listings table
-- This field should be optional as it's redundant with loading_points information

ALTER TABLE public.livestock_listings 
ALTER COLUMN weighing_location DROP NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN public.livestock_listings.weighing_location 
IS 'Optional weighing location field. Made nullable as this information is redundant with loading_points data and is marked as optional for initial launch.';
