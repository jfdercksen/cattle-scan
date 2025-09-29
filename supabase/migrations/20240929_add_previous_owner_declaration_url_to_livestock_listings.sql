-- Adds top-level previous owner declaration reference for listings
alter table public.livestock_listings
  add column if not exists previous_owner_declaration_url text;
