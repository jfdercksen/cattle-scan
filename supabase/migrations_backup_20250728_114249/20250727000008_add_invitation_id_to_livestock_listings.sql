-- Migration to add missing invitation_id field to livestock_listings table
-- This addresses schema drift where the invitation_id field was missing

-- Add invitation_id field to livestock_listings table
ALTER TABLE livestock_listings 
ADD COLUMN IF NOT EXISTS invitation_id UUID;

-- Add foreign key constraint to link to listing_invitations
ALTER TABLE livestock_listings 
ADD CONSTRAINT livestock_listings_invitation_id_fkey 
FOREIGN KEY (invitation_id) REFERENCES listing_invitations(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_livestock_listings_invitation_id 
ON livestock_listings(invitation_id);

-- Add comment for documentation
COMMENT ON COLUMN livestock_listings.invitation_id IS 'Links livestock listing to the invitation that created it - restored from schema drift';
