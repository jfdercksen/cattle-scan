-- Add columns only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'livestock_listings' AND column_name = 'livestock_moved_year') THEN
        ALTER TABLE public.livestock_listings ADD COLUMN livestock_moved_year INT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'livestock_listings' AND column_name = 'livestock_moved_month') THEN
        ALTER TABLE public.livestock_listings ADD COLUMN livestock_moved_month INT;
    END IF;
END $$;
