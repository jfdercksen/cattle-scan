-- Add GLN columns to farms table
ALTER TABLE farms ADD COLUMN IF NOT EXISTS has_gln BOOLEAN DEFAULT false;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS gln_number TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS gln_document_url TEXT;

