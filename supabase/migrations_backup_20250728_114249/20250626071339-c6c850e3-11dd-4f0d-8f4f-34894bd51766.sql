
-- Add new column for responsible person definition checkbox
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS declaration_responsible_person_definition boolean DEFAULT false;
