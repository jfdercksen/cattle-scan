
-- Check current state and completely reset everything
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies first
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    -- Drop trigger and function
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user();
    
    -- Drop table completely
    DROP TABLE IF EXISTS public.profiles CASCADE;
    
    -- Drop all enum types
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS user_status CASCADE;
    DROP TYPE IF EXISTS language_preference CASCADE;
END $$;

-- Recreate enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'seller', 'vet', 'agent', 'driver');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE language_preference AS ENUM ('en', 'af');

-- Create the profiles table
CREATE TABLE public.profiles (
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a much simpler trigger function that uses string literals instead of enum casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role_val text;
  user_status_val text;
  approval_time timestamptz;
BEGIN
  -- Determine role and status using simple logic
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role::text = 'super_admin' AND status::text = 'approved') THEN
    user_role_val := 'super_admin';
    user_status_val := 'approved';
    approval_time := NOW();
  ELSE
    user_role_val := COALESCE(NEW.raw_user_meta_data ->> 'role', 'seller');
    user_status_val := 'pending';
    approval_time := NULL;
  END IF;

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
    user_role_val::user_role,
    user_status_val::user_status,
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en')::language_preference,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'company_name',
    approval_time
  );
  
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
