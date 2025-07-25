-- Remove unique_admin_user constraint to allow super admins to create multiple companies
-- This constraint was preventing super admins from creating multiple companies
-- since it enforced that each user can only be admin of one company

-- Drop the unique constraint on admin_user_id
ALTER TABLE public.companies 
DROP CONSTRAINT IF EXISTS unique_admin_user;

-- Add a comment to document the change
COMMENT ON COLUMN public.companies.admin_user_id IS 'User ID of the company admin. Super admins can be admin of multiple companies.';
