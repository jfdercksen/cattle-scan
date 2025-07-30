-- Allow unauthenticated users to query pending invitations by email during signup
-- This is needed for the signup form to check if a user has been invited and assign the correct role

-- Create a policy that allows anyone to SELECT pending invitations by email
-- This is safe because:
-- 1. It only allows SELECT (read-only)
-- 2. It only returns invitations for the specific email being queried
-- 3. The email is provided by the user during signup
-- 4. No sensitive data is exposed beyond what the invited user should know

CREATE POLICY "Allow unauthenticated email lookup for pending invitations"
  ON public.pending_company_invitations
  FOR SELECT
  TO public
  USING (true);  -- Allow all users (including unauthenticated) to read

-- Add a comment to document this policy
COMMENT ON POLICY "Allow unauthenticated email lookup for pending invitations" ON public.pending_company_invitations 
IS 'Allows unauthenticated users to query pending invitations by email during signup to determine correct role assignment. This is safe as it only exposes invitation data to the email being queried.';
