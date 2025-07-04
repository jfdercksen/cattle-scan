# Work in Progress: Refactoring the Livestock Listing Process

This document outlines the plan for refactoring the application to an admin-initiated workflow.

## 1. Database Schema Changes

- [ ] Create a new `listing_invitations` table with the following columns:
  - `id` (uuid, primary key)
  - `reference_id` (text, unique)
  - `seller_id` (uuid, foreign key to `profiles`)
  - `seller_email` (text, for new sellers)
  - `status` (text, e.g., 'pending', 'accepted', 'completed')
  - `created_by` (uuid, foreign key to `profiles` - the admin)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

## 2. UI/UX Changes

### Admin Dashboard (`src/pages/AdminDashboard.tsx`)

- [ ] Create a new component `ListingInvitationForm.tsx`.
- [ ] Add a section to the dashboard to display and manage listing invitations.
- [ ] The `ListingInvitationForm.tsx` will allow the admin to:
  - [ ] Select an existing seller from a dropdown.
  - [ ] Invite a new seller by email.
  - [ ] The form will display the auto-generated `reference_id`.

### Seller Dashboard (`src/pages/SellerDashboard.tsx`)

- [ ] Create a new component `ListingInvitationsTable.tsx` to display pending invitations.
- [ ] When a seller accepts an invitation, they are redirected to the `LivestockListingForm.tsx`.
- [ ] The `reference_id` from the invitation will be passed to and displayed on the `LivestockListingForm.tsx`.

### Component Modifications

- [ ] `LivestockListingForm.tsx`: 
  - [ ] Add a field to display the `reference_id`.
  - [ ] This field should be read-only.
- [ ] `LivestockListingsTable.tsx`:
  - [ ] Add a column to display the `reference_id`.
- [ ] `LivestockOfferForm.tsx`:
  - [ ] Display the `reference_id`.
- [ ] `SellerOffersTable.tsx`:
  - [ ] Add a column to display the `reference_id`.

## 3. Logic and Data Flow

- [ ] Implement the logic to generate a unique `reference_id` when an invitation is created.
- [ ] Update the application's data fetching and submission logic to work with the new `listing_invitations` table.
- [ ] Ensure the `reference_id` is passed through the entire workflow, from invitation to offer completion.
