

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."language_preference" AS ENUM (
    'en',
    'af'
);


ALTER TYPE "public"."language_preference" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'super_admin',
    'admin',
    'seller',
    'vet',
    'agent',
    'driver',
    'load_master'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."user_role" IS 'User roles enum with load_master added';



CREATE TYPE "public"."user_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'suspended'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_user_by_admin"("target_user_id" "uuid", "requesting_user_id" "uuid") RETURNS TABLE("id" "uuid", "email" "text", "first_name" "text", "last_name" "text", "role" "text", "status" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if the requesting user is an admin or super_admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = requesting_user_id 
    AND p.role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admin or super_admin users can approve other users';
  END IF;

  -- Update the target user's status to approved
  UPDATE profiles 
  SET 
    status = 'approved',
    updated_at = NOW()
  WHERE profiles.id = target_user_id;

  -- Return the updated user profile
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role::TEXT,
    p.status::TEXT,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."approve_user_by_admin"("target_user_id" "uuid", "requesting_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_create_company_invitation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Only create company invitation if this is a new seller invitation (seller_email is provided but seller_id is null)
  IF NEW.seller_email IS NOT NULL AND NEW.seller_id IS NULL THEN
    -- Check if a company invitation already exists for this email and company
    IF NOT EXISTS (
      SELECT 1 FROM pending_company_invitations 
      WHERE email = NEW.seller_email 
      AND company_id = NEW.company_id
    ) THEN
      -- Create the company invitation
      INSERT INTO pending_company_invitations (
        company_id,
        email,
        relationship_type,
        invited_by,
        status,
        created_at
      ) VALUES (
        NEW.company_id,
        NEW.seller_email,
        'seller',
        NEW.created_by,
        'pending',
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_company_invitation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_link_listing_invitations"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- When a new user is created, link any pending listing invitations for their email
  IF TG_OP = 'INSERT' THEN
    UPDATE listing_invitations 
    SET 
      seller_id = NEW.id,
      status = 'accepted',
      updated_at = NOW()
    WHERE seller_email = NEW.email 
    AND seller_id IS NULL
    AND status = 'pending';
    
    RETURN NEW;
  END IF;
  
  -- When a user is approved, also ensure their listing invitations are linked
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    UPDATE listing_invitations 
    SET 
      seller_id = NEW.id,
      status = 'accepted',
      updated_at = NOW()
    WHERE seller_email = NEW.email 
    AND seller_id IS NULL;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_link_listing_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_link_listing_invitations_v2"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- When a new user is created, link any pending listing invitations for their email
  IF TG_OP = 'INSERT' THEN
    SELECT link_listing_invitations_for_user(NEW.id, NEW.email) INTO updated_count;
    RETURN NEW;
  END IF;
  
  -- When a user is approved, also ensure their listing invitations are linked
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    SELECT link_listing_invitations_for_user(NEW.id, NEW.email) INTO updated_count;
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_link_listing_invitations_v2"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_link_on_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  link_result JSON;
BEGIN
  -- Only run when status changes to 'approved'
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Use the RPC function to link invitations
    SELECT link_user_invitations(NEW.email) INTO link_result;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_link_on_approval"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_populate_company_id"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- If company_id is not provided and reference_id exists, fetch it from the invitation
  IF NEW.company_id IS NULL AND NEW.reference_id IS NOT NULL THEN
    SELECT li.company_id INTO NEW.company_id
    FROM listing_invitations li
    WHERE li.reference_id = NEW.reference_id;
    
    -- Log if we couldn't find a matching invitation (for debugging)
    IF NEW.company_id IS NULL THEN
      RAISE WARNING 'Could not find company_id for reference_id: %', NEW.reference_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_populate_company_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_populate_company_id"() IS 'Automatically populates company_id in livestock_listings from the related listing_invitations record based on reference_id match. Ensures proper multi-tenant access control.';



CREATE OR REPLACE FUNCTION "public"."auto_populate_seller_id"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Only populate seller_id if it's not already set and seller_email is provided
  IF NEW.seller_id IS NULL AND NEW.seller_email IS NOT NULL THEN
    -- Look up the user ID by email in the profiles table
    SELECT id INTO NEW.seller_id
    FROM public.profiles
    WHERE email = NEW.seller_email
    LIMIT 1;
    
    -- If we found a user, log it (optional, can be removed in production)
    IF NEW.seller_id IS NOT NULL THEN
      -- User exists, seller_id has been populated
      NULL; -- No action needed, just a placeholder
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_populate_seller_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_populate_seller_id"() IS 'Automatically populates seller_id in listing_invitations when the seller_email matches an existing user in profiles table. This handles inviting existing users from other companies to listings.';



CREATE OR REPLACE FUNCTION "public"."can_user_access_company"("user_uuid" "uuid", "target_company_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_role_val public.user_role;
  user_status_val public.user_status;
BEGIN
  -- Get user role and status
  SELECT role, status INTO user_role_val, user_status_val
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Super admins can access all companies
  IF user_role_val = 'super_admin'::public.user_role AND user_status_val = 'approved'::public.user_status THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is admin of the company
  IF EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = target_company_id AND admin_user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has active relationship with the company
  IF EXISTS (
    SELECT 1 FROM public.company_user_relationships 
    WHERE company_id = target_company_id 
    AND user_id = user_uuid 
    AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."can_user_access_company"("user_uuid" "uuid", "target_company_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_first_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Check if this is the first user
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'super_admin' AND status = 'approved') THEN
    NEW.role = 'super_admin';
    NEW.status = 'approved';
    NEW.approved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_first_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_pending_invitations"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.pending_company_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_pending_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_name_for_pending_invitation"("invitation_email" "text") RETURNS TABLE("company_id" "uuid", "company_name" "text", "relationship_type" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    c.id as company_id,
    c.name as company_name,
    pci.relationship_type::text
  FROM public.pending_company_invitations pci
  JOIN public.companies c ON c.id = pci.company_id
  WHERE pci.email = invitation_email
  AND pci.expires_at > now()
  AND pci.status = 'pending'
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_company_name_for_pending_invitation"("invitation_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_users"("company_id_param" "uuid", "requesting_user_id" "uuid") RETURNS TABLE("id" "uuid", "company_id" "uuid", "user_id" "uuid", "relationship_type" "text", "status" "text", "invited_by" "uuid", "created_at" timestamp with time zone, "accepted_at" timestamp with time zone, "user_email" "text", "user_first_name" "text", "user_last_name" "text", "user_role" "text", "user_status" "text", "user_company_name" "text", "user_seller_entity_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if the requesting user has admin access to this company
  -- Either they are the company owner OR they are an admin member
  IF NOT (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_id_param AND c.admin_user_id = requesting_user_id
    )
    OR
    EXISTS (
      SELECT 1 FROM company_user_relationships cur
      WHERE cur.company_id = company_id_param 
      AND cur.user_id = requesting_user_id 
      AND cur.relationship_type = 'admin'
      AND cur.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = requesting_user_id 
      AND p.role = 'super_admin'
      AND p.status = 'approved'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: User does not have admin access to this company';
  END IF;

  -- Return company users with their profile information including seller fields
  RETURN QUERY
  SELECT 
    cur.id,
    cur.company_id,
    cur.user_id,
    cur.relationship_type::TEXT as relationship_type,  -- Cast enum to text
    cur.status,
    cur.invited_by,
    cur.created_at,
    cur.accepted_at,
    p.email as user_email,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    p.role::TEXT as user_role,
    p.status::TEXT as user_status,
    p.company_name as user_company_name,
    p.seller_entity_name as user_seller_entity_name
  FROM company_user_relationships cur
  LEFT JOIN profiles p ON cur.user_id = p.id
  WHERE cur.company_id = company_id_param
  ORDER BY cur.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_company_users"("company_id_param" "uuid", "requesting_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_role"() RETURNS "public"."user_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_status"() RETURNS "public"."user_status"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_current_user_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_companies"("user_uuid" "uuid") RETURNS TABLE("company_id" "uuid", "company_name" "text", "relationship_type" "public"."user_role")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as company_id,
    c.name as company_name,
    COALESCE(cur.relationship_type, 'admin'::public.user_role) as relationship_type
  FROM public.companies c
  LEFT JOIN public.company_user_relationships cur ON c.id = cur.company_id AND cur.user_id = user_uuid
  WHERE 
    c.admin_user_id = user_uuid  -- User is admin
    OR 
    (cur.user_id = user_uuid AND cur.status = 'active');  -- User has active relationship
END;
$$;


ALTER FUNCTION "public"."get_user_companies"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_company_contexts"("user_id_param" "uuid") RETURNS TABLE("company_id" "uuid", "company_name" "text", "user_role" "public"."user_role")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cur.company_id,
    c.name as company_name,
    cur.relationship_type as user_role
  FROM company_user_relationships cur
  JOIN companies c ON cur.company_id = c.id
  WHERE cur.user_id = user_id_param
    AND cur.status = 'active';
END;
$$;


ALTER FUNCTION "public"."get_user_company_contexts"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS TABLE("id" "uuid", "first_name" "text", "last_name" "text", "email" "text", "phone" "text", "role" "public"."user_role", "status" "public"."user_status", "profile_completed" boolean, "seller_entity_name" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.role,
    p.status,
    p.profile_completed,
    p.seller_entity_name,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = user_id;
$$;


ALTER FUNCTION "public"."get_user_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  is_first_user BOOLEAN := FALSE;
  user_role_val public.user_role;
  company_name_val TEXT;
BEGIN
  -- Determine if this is the first user (super_admin)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'super_admin' AND status = 'approved') THEN
    is_first_user := TRUE;
    user_role_val := 'super_admin'::public.user_role;
  ELSE
    user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'seller'::public.user_role);
  END IF;
  
  -- Get company name from metadata if provided
  company_name_val := NEW.raw_user_meta_data ->> 'company_name';
  
  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    language_preference,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    user_role_val,
    COALESCE((NEW.raw_user_meta_data ->> 'language')::public.language_preference, 'en'::public.language_preference),
    CASE WHEN is_first_user THEN 'approved'::public.user_status ELSE 'pending'::public.user_status END
  );
  
  -- If this is an admin user and company name is provided, create company
  IF user_role_val = 'admin'::public.user_role AND company_name_val IS NOT NULL THEN
    INSERT INTO public.companies (name, admin_user_id)
    VALUES (company_name_val, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_listing_invitations_for_user"("user_id" "uuid", "user_email" "text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update listing invitations for this user, bypassing RLS with SECURITY DEFINER
  UPDATE listing_invitations 
  SET 
    seller_id = user_id,
    status = 'accepted',
    updated_at = NOW()
  WHERE seller_email = user_email 
  AND seller_id IS NULL
  AND status = 'pending';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;


ALTER FUNCTION "public"."link_listing_invitations_for_user"("user_id" "uuid", "user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_user_invitations"("user_email" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_record RECORD;
  updated_listing_count INTEGER := 0;
  updated_company_count INTEGER := 0;
  result JSON;
BEGIN
  -- Get the user record
  SELECT id, email, status INTO user_record
  FROM profiles 
  WHERE email = user_email;
  
  IF user_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found',
      'listing_invitations_updated', 0,
      'company_invitations_updated', 0
    );
  END IF;
  
  -- Link listing invitations (for new users) OR update status (for approved users)
  UPDATE listing_invitations 
  SET 
    seller_id = COALESCE(seller_id, user_record.id),  -- Set seller_id if null
    status = CASE 
      WHEN user_record.status = 'approved' THEN 'accepted'
      ELSE 'pending'  -- Keep as pending if user not yet approved
    END,
    updated_at = NOW()
  WHERE seller_email = user_email 
  AND (seller_id IS NULL OR seller_id = user_record.id);  -- Update both unlinked and linked invitations
  
  GET DIAGNOSTICS updated_listing_count = ROW_COUNT;
  
  -- Update company invitations status if user is approved
  IF user_record.status = 'approved' THEN
    UPDATE pending_company_invitations 
    SET status = 'accepted'
    WHERE email = user_email 
    AND status = 'pending';
    
    GET DIAGNOSTICS updated_company_count = ROW_COUNT;
  END IF;
  
  -- Return results
  result := json_build_object(
    'success', true,
    'user_id', user_record.id,
    'user_status', user_record.status,
    'listing_invitations_updated', updated_listing_count,
    'company_invitations_updated', updated_company_count
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."link_user_invitations"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_pending_invitations_on_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- When a new profile is created, check for pending invitations
  INSERT INTO public.company_user_relationships (
    company_id,
    user_id,
    relationship_type,
    invited_by,
    status,
    accepted_at
  )
  SELECT 
    pci.company_id,
    NEW.id,
    pci.relationship_type,
    pci.invited_by,
    'active',
    NOW()
  FROM public.pending_company_invitations pci
  WHERE pci.email = NEW.email
    AND pci.status = 'pending'
    AND pci.expires_at > NOW();

  -- Mark processed pending invitations as accepted
  UPDATE public.pending_company_invitations
  SET status = 'accepted'
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."process_pending_invitations_on_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."approval_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "action_by" "uuid" NOT NULL,
    "action" "public"."user_status" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."approval_actions" OWNER TO "postgres";


COMMENT ON TABLE "public"."approval_actions" IS 'Tracks approval/rejection actions by administrators';



CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."companies" IS 'Companies table for multi-tenant architecture';



COMMENT ON COLUMN "public"."companies"."admin_user_id" IS 'User ID of the company admin. Super admins can be admin of multiple companies.';



CREATE TABLE IF NOT EXISTS "public"."company_user_relationships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "relationship_type" "public"."user_role" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "invited_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "accepted_at" timestamp with time zone,
    CONSTRAINT "company_user_relationships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."company_user_relationships" OWNER TO "postgres";


COMMENT ON TABLE "public"."company_user_relationships" IS 'Many-to-many relationships between companies and users';



CREATE TABLE IF NOT EXISTS "public"."farms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "registration_number" "text",
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "province" "text" NOT NULL,
    "postal_code" "text",
    "coordinates" "point",
    "biosecurity_status" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."farms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reference_id" "text" NOT NULL,
    "seller_id" "uuid",
    "seller_email" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "listing_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_id" "uuid",
    CONSTRAINT "listing_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'completed'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."listing_invitations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."listing_invitations"."company_id" IS 'Associates invitation with a specific company';



CREATE TABLE IF NOT EXISTS "public"."livestock_listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "owner_name" "text" NOT NULL,
    "bred_or_bought" "text" NOT NULL,
    "location" "text",
    "weighing_location" "text",
    "loading_points_1" integer DEFAULT 0,
    "loading_points_2" integer DEFAULT 0,
    "loading_points_3" integer DEFAULT 0,
    "loading_points_4" integer DEFAULT 0,
    "loading_points_5" integer DEFAULT 0,
    "total_livestock_offered" integer NOT NULL,
    "number_of_heifers" integer DEFAULT 0,
    "males_castrated" boolean DEFAULT false,
    "mothers_status" "text",
    "weaned_duration" "text",
    "grazing_green_feed" boolean DEFAULT false,
    "growth_implant" boolean DEFAULT false,
    "growth_implant_type" "text",
    "estimated_average_weight" integer,
    "breed" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "livestock_moved_year" integer,
    "livestock_moved_month" integer,
    "loading_points" "jsonb",
    "is_loading_at_birth_farm" boolean,
    "livestock_moved_out_of_boundaries" boolean,
    "company_id" "uuid",
    "assigned_load_master_id" "uuid",
    "loading_completion_data" "jsonb",
    "reference_id" "text",
    "truck_registration_number" "text",
    "responsible_person_name" "text",
    "responsible_person_designation" "text",
    "breeder_name" "text",
    "is_breeder_seller" boolean DEFAULT false,
    "farm_birth_address" "text",
    "farm_loading_address" "text",
    "livestock_moved_location" "text",
    "declaration_no_cloven_hooved_animals" boolean DEFAULT false,
    "declaration_livestock_kept_away" boolean DEFAULT false,
    "declaration_no_animal_origin_feed" boolean DEFAULT false,
    "declaration_veterinary_products_registered" boolean DEFAULT false,
    "declaration_no_foot_mouth_disease" boolean DEFAULT false,
    "declaration_no_foot_mouth_disease_farm" boolean DEFAULT false,
    "declaration_livestock_south_africa" boolean DEFAULT false,
    "declaration_no_gene_editing" boolean DEFAULT false,
    "signature_data" "text",
    "signature_date" timestamp with time zone,
    "signed_location" "text",
    "additional_r25_per_calf" boolean,
    "affidavit_file_path" "text",
    "affidavit_required" boolean,
    "assigned_vet_id" "uuid",
    "invited_vet_email" "text",
    "livestock_type" "text",
    "number_cattle_loaded" integer DEFAULT 0,
    "number_sheep_loaded" integer DEFAULT 0,
    "invitation_id" "uuid",
    "profile_id" "uuid",
    CONSTRAINT "livestock_listings_bred_or_bought_check" CHECK (("bred_or_bought" = ANY (ARRAY['BRED'::"text", 'BOUGHT IN'::"text"]))),
    CONSTRAINT "livestock_listings_mothers_status_check" CHECK (("mothers_status" = ANY (ARRAY['WITH MOTHERS'::"text", 'ALREADY WEANED'::"text"]))),
    CONSTRAINT "livestock_listings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'completed'::"text", 'assigned_to_load_master'::"text", 'loading_completed'::"text", 'submitted_to_vet'::"text", 'available_for_loading'::"text"])))
);


ALTER TABLE "public"."livestock_listings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."livestock_listings"."location" IS 'Optional location field. Made nullable as this information is now handled by loading_points and marked as optional in the schema.';



COMMENT ON COLUMN "public"."livestock_listings"."weighing_location" IS 'Optional weighing location field. Made nullable as this information is redundant with loading_points data and is marked as optional for initial launch.';



COMMENT ON COLUMN "public"."livestock_listings"."breed" IS 'Optional breed field. Made nullable as it is marked as optional for initial launch in the schema.';



COMMENT ON COLUMN "public"."livestock_listings"."livestock_moved_out_of_boundaries" IS 'Whether livestock has moved outside farm boundaries';



COMMENT ON COLUMN "public"."livestock_listings"."company_id" IS 'Associates listing with a specific company for data isolation';



COMMENT ON COLUMN "public"."livestock_listings"."assigned_load_master_id" IS 'ID of the Load Master assigned to handle loading for this listing';



COMMENT ON COLUMN "public"."livestock_listings"."loading_completion_data" IS 'JSON data containing loading completion details (notes, condition, timestamps, etc.)';



COMMENT ON COLUMN "public"."livestock_listings"."reference_id" IS 'Reference ID linking this listing to its originating invitation';



COMMENT ON COLUMN "public"."livestock_listings"."truck_registration_number" IS 'Registration number of the truck used for loading livestock';



COMMENT ON COLUMN "public"."livestock_listings"."responsible_person_name" IS 'Name of the person responsible for the livestock';



COMMENT ON COLUMN "public"."livestock_listings"."responsible_person_designation" IS 'Job title/designation of the responsible person';



COMMENT ON COLUMN "public"."livestock_listings"."breeder_name" IS 'Name of the livestock breeder';



COMMENT ON COLUMN "public"."livestock_listings"."is_breeder_seller" IS 'Whether the seller is also the breeder';



COMMENT ON COLUMN "public"."livestock_listings"."farm_birth_address" IS 'Address where the livestock was born';



COMMENT ON COLUMN "public"."livestock_listings"."farm_loading_address" IS 'Address where the livestock will be loaded';



COMMENT ON COLUMN "public"."livestock_listings"."livestock_moved_location" IS 'Location where livestock was moved to';



COMMENT ON COLUMN "public"."livestock_listings"."signature_data" IS 'Digital signature data for the listing';



COMMENT ON COLUMN "public"."livestock_listings"."signature_date" IS 'Date and time when the listing was signed';



COMMENT ON COLUMN "public"."livestock_listings"."signed_location" IS 'Location where the listing was signed';



COMMENT ON COLUMN "public"."livestock_listings"."livestock_type" IS 'Type of livestock (CATTLE, SHEEP, or CATTLE AND SHEEP)';



COMMENT ON COLUMN "public"."livestock_listings"."number_cattle_loaded" IS 'Total number of cattle loaded for this listing';



COMMENT ON COLUMN "public"."livestock_listings"."number_sheep_loaded" IS 'Total number of sheep loaded for this listing';



COMMENT ON COLUMN "public"."livestock_listings"."invitation_id" IS 'Links livestock listing to the invitation that created it - restored from schema drift';



CREATE TABLE IF NOT EXISTS "public"."livestock_offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "chalmar_beef_offer" numeric(10,2) NOT NULL,
    "to_weight" integer NOT NULL,
    "then_penilazation_of" numeric(10,2) NOT NULL,
    "and_from" integer NOT NULL,
    "penilazation_of" numeric(10,2) NOT NULL,
    "percent_heifers_allowed" integer NOT NULL,
    "penilazation_for_additional_heifers" numeric(10,2) NOT NULL,
    "offer_valid_until_date" "date" NOT NULL,
    "offer_valid_until_time" time without time zone NOT NULL,
    "additional_r25_per_calf" boolean DEFAULT false,
    "affidavit_required" boolean DEFAULT false,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "seller_response_date" timestamp with time zone,
    "seller_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."livestock_offers" OWNER TO "postgres";


COMMENT ON TABLE "public"."livestock_offers" IS 'Livestock offers from admins to sellers (may be deprecated)';



CREATE TABLE IF NOT EXISTS "public"."pending_company_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "relationship_type" "public"."user_role" NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    CONSTRAINT "pending_company_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."pending_company_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "role" "public"."user_role" DEFAULT 'seller'::"public"."user_role" NOT NULL,
    "status" "public"."user_status" DEFAULT 'pending'::"public"."user_status" NOT NULL,
    "language_preference" "public"."language_preference" DEFAULT 'en'::"public"."language_preference" NOT NULL,
    "phone" "text",
    "company_name" "text",
    "registration_number" "text",
    "address" "text",
    "city" "text",
    "province" "text",
    "postal_code" "text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_completed" boolean DEFAULT false NOT NULL,
    "profile_completed_at" timestamp with time zone,
    "responsible_person_name" "text",
    "responsible_person_designation" "text",
    "declaration_no_cloven_hooved_animals" boolean DEFAULT false,
    "declaration_livestock_kept_away" boolean DEFAULT false,
    "declaration_no_animal_origin_feed" boolean DEFAULT false,
    "declaration_veterinary_products_registered" boolean DEFAULT false,
    "declaration_no_foot_mouth_disease" boolean DEFAULT false,
    "declaration_no_foot_mouth_disease_farm" boolean DEFAULT false,
    "declaration_livestock_south_africa" boolean DEFAULT false,
    "declaration_no_gene_editing" boolean DEFAULT false,
    "declaration_responsible_person_definition" boolean DEFAULT false,
    "signature_data" "text",
    "signature_date" timestamp with time zone,
    "signed_location" "text",
    "seller_entity_name" "text",
    "seller_ownership_type" "text",
    "seller_responsible_person_title" "text",
    "signature_url" "text",
    "signed_at" timestamp with time zone,
    "brand_mark_url" "text",
    "id_document_url" "text",
    "ownership_type" "text",
    "entity_name" "text",
    "responsible_person_title" "text",
    "agency_represented" "text",
    "appointment_letter_url" "text",
    "apac_registration_url" "text",
    "practice_letter_head_url" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."profile_completed" IS 'Whether the user has completed their profile setup';



COMMENT ON COLUMN "public"."profiles"."profile_completed_at" IS 'When the user completed their profile setup';



COMMENT ON COLUMN "public"."profiles"."responsible_person_name" IS 'Name of the person responsible for livestock declarations';



COMMENT ON COLUMN "public"."profiles"."responsible_person_designation" IS 'Job title/designation of the responsible person';



COMMENT ON COLUMN "public"."profiles"."seller_entity_name" IS 'Name of the seller entity/company - restored from schema drift';



COMMENT ON COLUMN "public"."profiles"."seller_ownership_type" IS 'Type of ownership for seller entity - restored from schema drift';



COMMENT ON COLUMN "public"."profiles"."seller_responsible_person_title" IS 'Title of responsible person for seller - restored from schema drift';



COMMENT ON COLUMN "public"."profiles"."signature_url" IS 'URL to signature file - restored from schema drift';



COMMENT ON COLUMN "public"."profiles"."signed_at" IS 'Timestamp when document was signed - restored from schema drift';



CREATE TABLE IF NOT EXISTS "public"."veterinary_declarations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reference_id" "text" NOT NULL,
    "veterinarian_name" "text" NOT NULL,
    "veterinarian_registration_number" "text" NOT NULL,
    "owner_of_livestock" "text" NOT NULL,
    "farm_address" "text" NOT NULL,
    "farm_name" "text",
    "farm_district" "text",
    "farm_province" "text",
    "cattle_visually_inspected" boolean,
    "cattle_mouthed" boolean,
    "sheep_visually_inspected" boolean,
    "sheep_mouthed" boolean,
    "foot_and_mouth_symptoms" boolean,
    "lumpy_skin_disease_symptoms" boolean,
    "foot_and_mouth_case_in_10km" boolean,
    "rift_valley_fever_case_in_10km" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."veterinary_declarations" OWNER TO "postgres";


COMMENT ON TABLE "public"."veterinary_declarations" IS 'Veterinary health declarations for livestock listings';



COMMENT ON COLUMN "public"."veterinary_declarations"."reference_id" IS 'Reference ID linking to the livestock listing';



COMMENT ON COLUMN "public"."veterinary_declarations"."veterinarian_name" IS 'Name of the veterinarian making the declaration';



COMMENT ON COLUMN "public"."veterinary_declarations"."veterinarian_registration_number" IS 'Professional registration number of the veterinarian';



COMMENT ON COLUMN "public"."veterinary_declarations"."owner_of_livestock" IS 'Name of the livestock owner';



COMMENT ON COLUMN "public"."veterinary_declarations"."farm_address" IS 'Address of the farm where livestock is located';



ALTER TABLE ONLY "public"."approval_actions"
    ADD CONSTRAINT "approval_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_user_relationships"
    ADD CONSTRAINT "company_user_relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."farms"
    ADD CONSTRAINT "farms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_invitations"
    ADD CONSTRAINT "listing_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_invitations"
    ADD CONSTRAINT "listing_invitations_reference_id_key" UNIQUE ("reference_id");



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "livestock_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."livestock_offers"
    ADD CONSTRAINT "livestock_offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_company_invitations"
    ADD CONSTRAINT "pending_company_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "unique_company_name" UNIQUE ("name");



ALTER TABLE ONLY "public"."company_user_relationships"
    ADD CONSTRAINT "unique_company_user_role" UNIQUE ("company_id", "user_id", "relationship_type");



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "unique_livestock_listings_reference_id" UNIQUE ("reference_id");



ALTER TABLE ONLY "public"."pending_company_invitations"
    ADD CONSTRAINT "unique_pending_company_email_role" UNIQUE ("company_id", "email", "relationship_type");



ALTER TABLE ONLY "public"."veterinary_declarations"
    ADD CONSTRAINT "veterinary_declarations_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_companies_admin_user_id" ON "public"."companies" USING "btree" ("admin_user_id");



CREATE INDEX "idx_company_user_relationships_company_id" ON "public"."company_user_relationships" USING "btree" ("company_id");



CREATE INDEX "idx_company_user_relationships_status" ON "public"."company_user_relationships" USING "btree" ("status");



CREATE INDEX "idx_company_user_relationships_user_id" ON "public"."company_user_relationships" USING "btree" ("user_id");



CREATE INDEX "idx_listing_invitations_company_id" ON "public"."listing_invitations" USING "btree" ("company_id");



CREATE INDEX "idx_livestock_listings_assigned_load_master_id" ON "public"."livestock_listings" USING "btree" ("assigned_load_master_id");



CREATE INDEX "idx_livestock_listings_company_id" ON "public"."livestock_listings" USING "btree" ("company_id");



CREATE INDEX "idx_livestock_listings_invitation_id" ON "public"."livestock_listings" USING "btree" ("invitation_id");



CREATE INDEX "idx_livestock_listings_profile_id" ON "public"."livestock_listings" USING "btree" ("profile_id");



CREATE INDEX "idx_livestock_listings_reference_id" ON "public"."livestock_listings" USING "btree" ("reference_id");



CREATE INDEX "idx_pending_company_invitations_company_id" ON "public"."pending_company_invitations" USING "btree" ("company_id");



CREATE INDEX "idx_pending_company_invitations_email" ON "public"."pending_company_invitations" USING "btree" ("email");



CREATE INDEX "idx_pending_company_invitations_expires_at" ON "public"."pending_company_invitations" USING "btree" ("expires_at");



CREATE INDEX "idx_pending_company_invitations_status" ON "public"."pending_company_invitations" USING "btree" ("status");



CREATE INDEX "idx_veterinary_declarations_reference_id" ON "public"."veterinary_declarations" USING "btree" ("reference_id");



CREATE OR REPLACE TRIGGER "process_pending_invitations_trigger" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."process_pending_invitations_on_signup"();



CREATE OR REPLACE TRIGGER "trigger_auto_create_company_invitation" AFTER INSERT ON "public"."listing_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_company_invitation"();



CREATE OR REPLACE TRIGGER "trigger_auto_link_on_approval" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."auto_link_on_approval"();



CREATE OR REPLACE TRIGGER "trigger_auto_populate_company_id" BEFORE INSERT ON "public"."livestock_listings" FOR EACH ROW EXECUTE FUNCTION "public"."auto_populate_company_id"();



COMMENT ON TRIGGER "trigger_auto_populate_company_id" ON "public"."livestock_listings" IS 'Trigger to auto-populate company_id from related invitation before INSERT to ensure RLS policy compliance.';



CREATE OR REPLACE TRIGGER "trigger_auto_populate_seller_id" BEFORE INSERT ON "public"."listing_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."auto_populate_seller_id"();



COMMENT ON TRIGGER "trigger_auto_populate_seller_id" ON "public"."listing_invitations" IS 'Trigger that automatically populates seller_id when inserting listing invitations if the email exists in profiles table.';



CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_veterinary_declarations_updated_at" BEFORE UPDATE ON "public"."veterinary_declarations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."approval_actions"
    ADD CONSTRAINT "approval_actions_action_by_fkey" FOREIGN KEY ("action_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."approval_actions"
    ADD CONSTRAINT "approval_actions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_user_relationships"
    ADD CONSTRAINT "company_user_relationships_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_user_relationships"
    ADD CONSTRAINT "company_user_relationships_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."company_user_relationships"
    ADD CONSTRAINT "company_user_relationships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."farms"
    ADD CONSTRAINT "farms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_user_relationships"
    ADD CONSTRAINT "fk_company_user_relationships_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "fk_livestock_listings_reference_id" FOREIGN KEY ("reference_id") REFERENCES "public"."listing_invitations"("reference_id");



ALTER TABLE ONLY "public"."veterinary_declarations"
    ADD CONSTRAINT "fk_veterinary_declarations_reference_id" FOREIGN KEY ("reference_id") REFERENCES "public"."livestock_listings"("reference_id");



ALTER TABLE ONLY "public"."listing_invitations"
    ADD CONSTRAINT "listing_invitations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_invitations"
    ADD CONSTRAINT "listing_invitations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."listing_invitations"
    ADD CONSTRAINT "listing_invitations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."livestock_listings"("id");



ALTER TABLE ONLY "public"."listing_invitations"
    ADD CONSTRAINT "listing_invitations_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "livestock_listings_assigned_load_master_id_fkey" FOREIGN KEY ("assigned_load_master_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "livestock_listings_assigned_vet_id_fkey" FOREIGN KEY ("assigned_vet_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "livestock_listings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "livestock_listings_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "public"."listing_invitations"("id");



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "livestock_listings_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."livestock_listings"
    ADD CONSTRAINT "livestock_listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."livestock_offers"
    ADD CONSTRAINT "livestock_offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."livestock_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_company_invitations"
    ADD CONSTRAINT "pending_company_invitations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_company_invitations"
    ADD CONSTRAINT "pending_company_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin members can create listing invitations" ON "public"."listing_invitations" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))) AND ("company_id" IN ( SELECT "company_user_relationships"."company_id"
   FROM "public"."company_user_relationships"
  WHERE (("company_user_relationships"."user_id" = "auth"."uid"()) AND ("company_user_relationships"."relationship_type" = 'admin'::"public"."user_role") AND ("company_user_relationships"."status" = 'active'::"text"))))));



CREATE POLICY "Admin members can create pending invitations" ON "public"."pending_company_invitations" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))) AND ("company_id" IN ( SELECT "company_user_relationships"."company_id"
   FROM "public"."company_user_relationships"
  WHERE (("company_user_relationships"."user_id" = "auth"."uid"()) AND ("company_user_relationships"."relationship_type" = 'admin'::"public"."user_role") AND ("company_user_relationships"."status" = 'active'::"text"))))));



CREATE POLICY "Admin users can view company relationships" ON "public"."company_user_relationships" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Admins can create listings for their company" ON "public"."livestock_listings" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND (EXISTS ( SELECT 1
           FROM "public"."companies"
          WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))))))));



CREATE POLICY "Admins can create listings for their company sellers" ON "public"."livestock_listings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "admin_profile"
     JOIN "public"."companies" ON (("companies"."admin_user_id" = "admin_profile"."id")))
     JOIN "public"."profiles" "seller_profile" ON (("seller_profile"."id" = "livestock_listings"."seller_id")))
     JOIN "public"."company_user_relationships" "cur" ON ((("cur"."user_id" = "seller_profile"."id") AND ("cur"."company_id" = "companies"."id"))))
  WHERE (("admin_profile"."id" = "auth"."uid"()) AND ("admin_profile"."role" = 'admin'::"public"."user_role") AND ("cur"."relationship_type" = 'seller'::"public"."user_role")))));



CREATE POLICY "Admins can create offers" ON "public"."livestock_offers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])) AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Admins can delete their company listings" ON "public"."livestock_listings" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND (EXISTS ( SELECT 1
           FROM "public"."companies"
          WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))))))));



CREATE POLICY "Admins can update their company listings" ON "public"."livestock_listings" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."profiles" "p"
     JOIN "public"."company_user_relationships" "cur" ON (("p"."id" = "cur"."user_id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"public"."user_role") AND ("cur"."company_id" = "livestock_listings"."company_id") AND ("cur"."status" = 'active'::"text")))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."profiles" "p"
     JOIN "public"."company_user_relationships" "cur" ON (("p"."id" = "cur"."user_id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"public"."user_role") AND ("cur"."company_id" = "livestock_listings"."company_id") AND ("cur"."status" = 'active'::"text"))))));



CREATE POLICY "Admins can view all declarations" ON "public"."veterinary_declarations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['super_admin'::"public"."user_role", 'admin'::"public"."user_role"])) AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Admins can view all offers" ON "public"."livestock_offers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])) AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Admins can view their company listings" ON "public"."livestock_listings" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role") AND (EXISTS ( SELECT 1
           FROM "public"."companies"
          WHERE (("companies"."id" = "livestock_listings"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))))))));



CREATE POLICY "All authenticated users can view company relationships" ON "public"."company_user_relationships" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "All authenticated users can view profiles" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to view companies" ON "public"."companies" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to view listing invitations" ON "public"."listing_invitations" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to view livestock listings" ON "public"."livestock_listings" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow unauthenticated email lookup for listing invitations" ON "public"."listing_invitations" FOR SELECT USING (("seller_email" IS NOT NULL));



CREATE POLICY "Allow unauthenticated email lookup for pending invitations" ON "public"."pending_company_invitations" FOR SELECT USING (true);



COMMENT ON POLICY "Allow unauthenticated email lookup for pending invitations" ON "public"."pending_company_invitations" IS 'Allows unauthenticated users to query pending invitations by email during signup to determine correct role assignment. This is safe as it only exposes invitation data to the email being queried.';



CREATE POLICY "Company admins can create pending invitations for their compani" ON "public"."pending_company_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "pending_company_invitations"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))));



CREATE POLICY "Company admins can manage their company invitations" ON "public"."listing_invitations" USING ((EXISTS ( SELECT 1
   FROM "public"."companies"
  WHERE (("companies"."id" = "listing_invitations"."company_id") AND ("companies"."admin_user_id" = "auth"."uid"())))));



CREATE POLICY "Company admins can manage their company relationships" ON "public"."company_user_relationships" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."admin_user_id" = "auth"."uid"()))));



CREATE POLICY "Company admins can update their own company" ON "public"."companies" FOR UPDATE USING (("admin_user_id" = "auth"."uid"()));



CREATE POLICY "Company admins can view their company relationships" ON "public"."company_user_relationships" FOR SELECT USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."admin_user_id" = "auth"."uid"()))));



CREATE POLICY "Company admins can view their own company" ON "public"."companies" FOR SELECT USING (("admin_user_id" = "auth"."uid"()));



CREATE POLICY "Load Masters can update their assigned listings" ON "public"."livestock_listings" FOR UPDATE USING (("assigned_load_master_id" = "auth"."uid"()));



CREATE POLICY "Load Masters can view declarations for assigned listings" ON "public"."veterinary_declarations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."profiles" "p"
     JOIN "public"."livestock_listings" "ll" ON (("ll"."assigned_load_master_id" = "p"."id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'load_master'::"public"."user_role") AND ("p"."status" = 'approved'::"public"."user_status") AND ("ll"."reference_id" = "veterinary_declarations"."reference_id")))));



CREATE POLICY "Load Masters can view their assigned listings" ON "public"."livestock_listings" FOR SELECT USING (("assigned_load_master_id" = "auth"."uid"()));



CREATE POLICY "Sellers can create their own listings" ON "public"."livestock_listings" FOR INSERT WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "Sellers can update their offers" ON "public"."livestock_offers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."livestock_listings" "ll"
     JOIN "public"."profiles" "p" ON (("p"."id" = "auth"."uid"())))
  WHERE (("ll"."id" = "livestock_offers"."listing_id") AND ("ll"."seller_id" = "auth"."uid"()) AND ("p"."role" = 'seller'::"public"."user_role") AND ("p"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Sellers can update their own listings" ON "public"."livestock_listings" FOR UPDATE USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Sellers can view their offers" ON "public"."livestock_offers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."livestock_listings" "ll"
     JOIN "public"."profiles" "p" ON (("p"."id" = "auth"."uid"())))
  WHERE (("ll"."id" = "livestock_offers"."listing_id") AND ("ll"."seller_id" = "auth"."uid"()) AND ("p"."role" = 'seller'::"public"."user_role") AND ("p"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Sellers can view their own listings" ON "public"."livestock_listings" FOR SELECT USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Super admins can create any livestock listing" ON "public"."livestock_listings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "Super admins can create companies" ON "public"."companies" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Super admins can create listing invitations" ON "public"."listing_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Super admins can create pending company invitations" ON "public"."pending_company_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Super admins can manage all relationships" ON "public"."company_user_relationships" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Super admins can update any livestock listing" ON "public"."livestock_listings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "Super admins can view all relationships" ON "public"."company_user_relationships" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own farms" ON "public"."farms" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can view their own relationships" ON "public"."company_user_relationships" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Veterinarians can create declarations" ON "public"."veterinary_declarations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'vet'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Veterinarians can view their own declarations" ON "public"."veterinary_declarations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'vet'::"public"."user_role") AND ("profiles"."status" = 'approved'::"public"."user_status")))));



CREATE POLICY "Vets can update their assigned listings" ON "public"."livestock_listings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'vet'::"public"."user_role") AND ("livestock_listings"."assigned_vet_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'vet'::"public"."user_role") AND ("livestock_listings"."assigned_vet_id" = "auth"."uid"())))));



ALTER TABLE "public"."approval_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_user_relationships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."farms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."livestock_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."livestock_offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_company_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."veterinary_declarations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."approve_user_by_admin"("target_user_id" "uuid", "requesting_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_user_by_admin"("target_user_id" "uuid", "requesting_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_user_by_admin"("target_user_id" "uuid", "requesting_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_company_invitation"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_company_invitation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_company_invitation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_link_listing_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_link_listing_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_link_listing_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_link_listing_invitations_v2"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_link_listing_invitations_v2"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_link_listing_invitations_v2"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_link_on_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_link_on_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_link_on_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_populate_company_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_populate_company_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_populate_company_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_populate_seller_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_populate_seller_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_populate_seller_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_user_access_company"("user_uuid" "uuid", "target_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_user_access_company"("user_uuid" "uuid", "target_company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_user_access_company"("user_uuid" "uuid", "target_company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_first_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_first_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_first_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_pending_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_pending_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_pending_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_name_for_pending_invitation"("invitation_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_name_for_pending_invitation"("invitation_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_name_for_pending_invitation"("invitation_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_users"("company_id_param" "uuid", "requesting_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_users"("company_id_param" "uuid", "requesting_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_users"("company_id_param" "uuid", "requesting_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_companies"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_companies"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_companies"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_company_contexts"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_company_contexts"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_company_contexts"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."link_listing_invitations_for_user"("user_id" "uuid", "user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."link_listing_invitations_for_user"("user_id" "uuid", "user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_listing_invitations_for_user"("user_id" "uuid", "user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."link_user_invitations"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."link_user_invitations"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_user_invitations"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_pending_invitations_on_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_pending_invitations_on_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_pending_invitations_on_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."approval_actions" TO "anon";
GRANT ALL ON TABLE "public"."approval_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_actions" TO "service_role";



GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_user_relationships" TO "anon";
GRANT ALL ON TABLE "public"."company_user_relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."company_user_relationships" TO "service_role";



GRANT ALL ON TABLE "public"."farms" TO "anon";
GRANT ALL ON TABLE "public"."farms" TO "authenticated";
GRANT ALL ON TABLE "public"."farms" TO "service_role";



GRANT ALL ON TABLE "public"."listing_invitations" TO "anon";
GRANT ALL ON TABLE "public"."listing_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."livestock_listings" TO "anon";
GRANT ALL ON TABLE "public"."livestock_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."livestock_listings" TO "service_role";



GRANT ALL ON TABLE "public"."livestock_offers" TO "anon";
GRANT ALL ON TABLE "public"."livestock_offers" TO "authenticated";
GRANT ALL ON TABLE "public"."livestock_offers" TO "service_role";



GRANT ALL ON TABLE "public"."pending_company_invitations" TO "anon";
GRANT ALL ON TABLE "public"."pending_company_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_company_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."veterinary_declarations" TO "anon";
GRANT ALL ON TABLE "public"."veterinary_declarations" TO "authenticated";
GRANT ALL ON TABLE "public"."veterinary_declarations" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
