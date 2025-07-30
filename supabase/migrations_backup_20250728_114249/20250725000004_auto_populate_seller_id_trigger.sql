-- Create a trigger to automatically populate seller_id in listing_invitations
-- when the invited email already exists in the profiles table

-- First, create the trigger function
CREATE OR REPLACE FUNCTION public.auto_populate_seller_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create the trigger on the listing_invitations table
CREATE TRIGGER trigger_auto_populate_seller_id
  BEFORE INSERT ON public.listing_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_populate_seller_id();

-- Add comments for documentation
COMMENT ON FUNCTION public.auto_populate_seller_id() 
IS 'Automatically populates seller_id in listing_invitations when the seller_email matches an existing user in profiles table. This handles inviting existing users from other companies to listings.';

COMMENT ON TRIGGER trigger_auto_populate_seller_id ON public.listing_invitations 
IS 'Trigger that automatically populates seller_id when inserting listing invitations if the email exists in profiles table.';
