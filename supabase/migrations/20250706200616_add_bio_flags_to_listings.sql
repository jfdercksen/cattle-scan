ALTER TABLE livestock_listings
ADD COLUMN IF NOT EXISTS is_loading_at_birth_farm BOOLEAN,
ADD COLUMN IF NOT EXISTS livestock_moved_out_of_boundaries BOOLEAN;
