
-- Drop the trigger first, then the function, then recreate both
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
      'super_admin'::public.user_role,
      'approved'::public.user_status,
      COALESCE(NEW.raw_user_meta_data ->> 'language', 'en')::public.language_preference,
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
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'seller')::public.user_role,
      'pending'::public.user_status,
      COALESCE(NEW.raw_user_meta_data ->> 'language', 'en')::public.language_preference,
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
