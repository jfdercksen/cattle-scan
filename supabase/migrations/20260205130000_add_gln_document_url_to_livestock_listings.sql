ALTER TABLE public.livestock_listings
  ADD COLUMN IF NOT EXISTS gln_document_url text;

