-- Add Load Master assignment fields to livestock_listings table
-- This migration adds support for assigning Load Masters to listings

-- First, update any existing users with 'driver' role to 'load_master'
-- This is done in a separate transaction from the enum addition
UPDATE public.profiles 
SET role = 'load_master'
WHERE role = 'driver';

-- Update any company_user_relationships with 'driver' relationship_type to 'load_master'
UPDATE public.company_user_relationships 
SET relationship_type = 'load_master'
WHERE relationship_type = 'driver';

-- Add assigned_load_master_id column to livestock_listings
ALTER TABLE public.livestock_listings 
ADD COLUMN assigned_load_master_id UUID REFERENCES auth.users(id);

-- Add loading_completion_data column for storing additional loading details
ALTER TABLE public.livestock_listings 
ADD COLUMN loading_completion_data JSONB;

-- Update status field constraint to include new Load Master workflow statuses
-- The status field is TEXT with CHECK constraint, so we need to update the constraint
ALTER TABLE public.livestock_listings 
DROP CONSTRAINT IF EXISTS livestock_listings_status_check;

ALTER TABLE public.livestock_listings 
ADD CONSTRAINT livestock_listings_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'assigned_to_load_master', 'loading_completed'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_livestock_listings_assigned_load_master_id 
ON public.livestock_listings(assigned_load_master_id);

-- Add RLS policy for Load Masters to view their assigned listings
CREATE POLICY "Load Masters can view their assigned listings" 
  ON public.livestock_listings 
  FOR SELECT 
  USING (assigned_load_master_id = auth.uid());

-- Add RLS policy for Load Masters to update their assigned listings
CREATE POLICY "Load Masters can update their assigned listings" 
  ON public.livestock_listings 
  FOR UPDATE 
  USING (assigned_load_master_id = auth.uid());

-- Add comments for documentation
COMMENT ON COLUMN public.livestock_listings.assigned_load_master_id IS 'ID of the Load Master assigned to handle loading for this listing';
COMMENT ON COLUMN public.livestock_listings.loading_completion_data IS 'JSON data containing loading completion details (notes, condition, timestamps, etc.)';