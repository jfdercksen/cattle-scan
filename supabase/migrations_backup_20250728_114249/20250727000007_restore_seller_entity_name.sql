-- Migration to restore missing seller_entity_name field and other potentially missing fields
-- This addresses schema drift caused by previous migrations

-- Add seller_entity_name field back to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_entity_name TEXT;

-- Add other potentially missing fields that were identified in the audit
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_ownership_type TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_responsible_person_title TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS signature_url TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN profiles.seller_entity_name IS 'Name of the seller entity/company - restored from schema drift';
COMMENT ON COLUMN profiles.seller_ownership_type IS 'Type of ownership for seller entity - restored from schema drift';
COMMENT ON COLUMN profiles.seller_responsible_person_title IS 'Title of responsible person for seller - restored from schema drift';
COMMENT ON COLUMN profiles.signature_url IS 'URL to signature file - restored from schema drift';
COMMENT ON COLUMN profiles.signed_at IS 'Timestamp when document was signed - restored from schema drift';
