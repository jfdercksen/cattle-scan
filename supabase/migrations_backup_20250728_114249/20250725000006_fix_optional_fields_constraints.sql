-- Fix NOT NULL constraints on fields that should be optional according to the schema
-- These fields are marked as .optional() in the Zod schema but have NOT NULL constraints in the database

-- Make breed column nullable (currently causing the error)
ALTER TABLE public.livestock_listings 
ALTER COLUMN breed DROP NOT NULL;

-- Make location column nullable (also marked as optional in schema)
ALTER TABLE public.livestock_listings 
ALTER COLUMN location DROP NOT NULL;

-- Add comments to document these changes
COMMENT ON COLUMN public.livestock_listings.breed 
IS 'Optional breed field. Made nullable as it is marked as optional for initial launch in the schema.';

COMMENT ON COLUMN public.livestock_listings.location 
IS 'Optional location field. Made nullable as this information is now handled by loading_points and marked as optional in the schema.';
