-- Replace 'driver' role with 'load_master' role
-- This migration adds 'load_master' to the enum

-- Step 1: Add 'load_master' to the existing enum
ALTER TYPE public.user_role ADD VALUE 'load_master';

-- Note: Updates to use the new enum value will be done in the next migration
-- due to PostgreSQL's restriction on using newly added enum values in the same transaction

-- Add comment for documentation
COMMENT ON TYPE public.user_role IS 'User roles enum with load_master added';