-- Allow cancelled status for listing invitations

alter table listing_invitations
  drop constraint if exists listing_invitations_status_check;

alter table listing_invitations
  add constraint listing_invitations_status_check
  check (status in ('pending', 'accepted', 'completed', 'expired', 'cancelled'));

