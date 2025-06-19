
-- Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure enum types exist with proper error handling
DO $$ 
BEGIN
    -- Check if user_role enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'seller', 'vet', 'agent', 'driver');
    END IF;
    
    -- Check if user_status enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
    END IF;
    
    -- Check if language_preference enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'language_preference') THEN
        CREATE TYPE language_preference AS ENUM ('en', 'af');
    END IF;
END $$;

-- Recreate the profiles table with proper structure if it doesn't exist correctly
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  role user_role NOT NULL DEFAULT 'seller',
  status user_status NOT NULL DEFAULT 'pending',
  language_preference language_preference NOT NULL DEFAULT 'en',
  phone text,
  company_name text,
  registration_number text,
  address text,
  city text,
  province text,
  postal_code text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_first_user boolean;
BEGIN
  -- Check if this is the first user (no existing super_admin with approved status)
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE role = 'super_admin' AND status = 'approved'
  ) INTO is_first_user;
  
  -- Insert the new profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    status,
    language_preference,
    phone,
    company_name,
    approved_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE 
      WHEN is_first_user THEN 'super_admin'::user_role
      ELSE COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'seller'::user_role)
    END,
    CASE 
      WHEN is_first_user THEN 'approved'::user_status
      ELSE 'pending'::user_status
    END,
    COALESCE((NEW.raw_user_meta_data ->> 'language')::language_preference, 'en'::language_preference),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'company_name',
    CASE 
      WHEN is_first_user THEN NOW()
      ELSE NULL
    END
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RAISE;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
