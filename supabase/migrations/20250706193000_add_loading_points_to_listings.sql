ALTER TABLE livestock_listings
ADD COLUMN IF NOT EXISTS loading_points JSONB; 

ALTER TABLE livestock_listings
DROP COLUMN IF EXISTS number_of_loading_points,
DROP COLUMN IF EXISTS livestock_at_loading_point_1,
DROP COLUMN IF EXISTS livestock_at_loading_point_2,
DROP COLUMN IF EXISTS livestock_at_loading_point_3,
DROP COLUMN IF EXISTS livestock_at_loading_point_4,
DROP COLUMN IF EXISTS livestock_at_loading_point_5;
