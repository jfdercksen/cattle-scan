-- Migration: Auto-populate company_id in livestock_listings from related invitation
-- This ensures proper multi-tenant access control and RLS policy compliance

-- Create the trigger function
CREATE OR REPLACE FUNCTION auto_populate_company_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create the trigger that fires before INSERT
CREATE TRIGGER trigger_auto_populate_company_id
  BEFORE INSERT ON livestock_listings
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_company_id();

-- Add comment for documentation
COMMENT ON FUNCTION auto_populate_company_id() IS 'Automatically populates company_id in livestock_listings from the related listing_invitations record based on reference_id match. Ensures proper multi-tenant access control.';

COMMENT ON TRIGGER trigger_auto_populate_company_id ON livestock_listings IS 'Trigger to auto-populate company_id from related invitation before INSERT to ensure RLS policy compliance.';
