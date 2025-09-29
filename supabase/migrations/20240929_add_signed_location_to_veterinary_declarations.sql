-- Adds GPS signing location for veterinary declarations
alter table public.veterinary_declarations
  add column if not exists signed_location text;
