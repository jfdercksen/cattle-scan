
-- Drop everything completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS language_preference CASCADE;

-- Create enum types in public schema explicitly
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'seller', 'vet', 'agent', 'driver');
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.language_preference AS ENUM ('en', 'af');

-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  role public.user_role NOT NULL DEFAULT 'seller',
  status public.user_status NOT NULL DEFAULT 'pending',
  language_preference public.language_preference NOT NULL DEFAULT 'en',
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple trigger function that uses string values only
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if this is the first user (no existing super_admin)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'super_admin' AND status = 'approved') THEN
    -- First user becomes super admin
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
      'super_admin',
      'approved',
      COALESCE(NEW.raw_user_meta_data ->> 'language', 'en'),
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'company_name',
      NOW()
    );
  ELSE
    -- Regular users
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      last_name, 
      role,
      status,
      language_preference,
      phone,
      company_name
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'seller'),
      'pending',
      COALESCE(NEW.raw_user_meta_data ->> 'language', 'en'),
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'company_name'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RAISE;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile data"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
