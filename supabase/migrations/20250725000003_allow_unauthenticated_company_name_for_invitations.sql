-- Allow unauthenticated users to view company names for pending invitations during signup
-- This enables the signup form to populate and lock company names for admin invites

-- Create a policy that allows unauthenticated users to SELECT company name 
-- only if there's a pending invitation for that company
CREATE POLICY "Allow unauthenticated company name lookup for pending invitations"
  ON public.companies
  FOR SELECT
  TO public
  USING (
    -- Allow if there's a pending invitation for this company
    EXISTS (
      SELECT 1 
      FROM public.pending_company_invitations pci
      WHERE pci.company_id = companies.id
        AND pci.status = 'pending'
    )
  );

-- Add a comment to document this policy
COMMENT ON POLICY "Allow unauthenticated company name lookup for pending invitations" ON public.companies 
IS 'Allows unauthenticated users to view company names when there are pending invitations for that company. This enables proper company name display during signup for invited users.';
