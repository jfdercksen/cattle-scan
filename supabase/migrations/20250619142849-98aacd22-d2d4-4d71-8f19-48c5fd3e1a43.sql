
-- Add profile completion tracking fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN profile_completed_at TIMESTAMP WITH TIME ZONE;

-- Update existing profiles to mark them as incomplete since they haven't gone through the profile completion flow
UPDATE public.profiles 
SET profile_completed = FALSE 
WHERE profile_completed IS NULL;
