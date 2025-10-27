-- Adds distance note field for when vets don't have cell coverage at inspection location
alter table public.veterinary_declarations
  add column if not exists location_distance_note text;
