-- Add reference_id column to livestock_listings table
-- This field links livestock listings to their originating invitations

ALTER TABLE public.livestock_listings 
ADD COLUMN reference_id TEXT;

-- Add foreign key constraint to ensure referential integrity
ALTER TABLE public.livestock_listings 
ADD CONSTRAINT fk_livestock_listings_reference_id 
FOREIGN KEY (reference_id) REFERENCES public.listing_invitations(reference_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_livestock_listings_reference_id 
ON public.livestock_listings(reference_id);

-- Add comment for documentation
COMMENT ON COLUMN public.livestock_listings.reference_id IS 'Reference ID linking this listing to its originating invitation';