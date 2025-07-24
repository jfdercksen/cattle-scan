# Multi-Tenant Architecture Summary

## Overview

The livestock trading platform implements a sophisticated multi-tenant architecture that allows multiple livestock trading companies (e.g., Chalma Beef, Sparta Beef Master, Karen Beef) to operate independently while sharing certain resources like sellers and veterinarians across companies.

## Key Architectural Concepts

### 1. Company-Based Tenancy
- Each livestock trading company operates as a separate tenant
- Companies have their own admin users and isolated data
- Companies can share sellers and veterinarians across tenants

### 2. Role Hierarchy
```
Super Admin (Platform Level)
├── Admin (Company Level)
├── Seller/Farmer (Multi-Company)
├── Veterinarian (Multi-Company)
├── Load Master (Company Level)
└── Agent (Company Level)
```

### 3. User Registration Flow

#### First User (Super Admin)
1. First person to register becomes `super_admin`
2. Has platform-wide access and company management capabilities
3. Can create and manage multiple companies

#### Company Admins
1. Register using special admin registration links
2. Assigned `admin` role (not `super_admin`)
3. Associated with specific company during registration
4. Can only see and manage their company's data

#### Sellers and Veterinarians
1. Can be associated with multiple companies simultaneously
2. Relationships created through company-specific invitations
3. See combined data from all associated companies on their dashboard

## Data Relationships

### Company-User Relationships
```typescript
interface CompanyUserRelationship {
  id: string;
  companyId: string;
  userId: string;
  relationshipType: 'admin' | 'seller' | 'vet' | 'agent' | 'load_master';
  status: 'pending' | 'active' | 'inactive';
  invitedBy: string;
  createdAt: Date;
  acceptedAt?: Date;
}
```

### Data Isolation
- **Livestock Listings**: Associated with specific company, only visible to that company's admin and related sellers/vets
- **User Profiles**: Shared across companies but relationships are company-specific
- **Invitations**: Company-specific with different workflows for new vs existing users

## Invitation System Logic

### Inviting New Users (Email not in system)
1. Admin enters email address for invitation
2. System checks if email exists in database
3. If not found, sends **registration invitation email**
4. Email contains company-specific signup link
5. User registers with automatic role assignment and company relationship

### Inviting Existing Users (Email already in system)
1. Admin selects existing user or enters known email
2. System finds existing user account
3. Sends **company relationship notification email** (not registration)
4. Email informs user of new company association and pending livestock listing
5. User accepts invitation, creating new company relationship
6. User can now see listings from both companies on their dashboard

## Dashboard Behavior

### Admin Dashboard
- Shows only data from admin's company
- Cannot see sellers, listings, or data from other companies
- Can invite sellers/vets (creating company relationships)

### Seller Dashboard
- Shows invitations and listings from ALL associated companies
- Can switch between company contexts if needed
- Maintains separate relationships with each company

### Veterinarian Dashboard
- Shows veterinary declarations from ALL associated companies
- Can complete declarations for any company they're associated with
- Maintains professional relationships across multiple companies

## Security and Access Control

### Data Isolation
- All database queries filtered by company relationships
- Users can only access data from companies they're associated with
- Strict validation of company access permissions

### Role-Based Permissions
- Super Admin: Platform-wide access
- Admin: Company-specific management
- Sellers/Vets: Multi-company access based on relationships
- Load Masters: Company-specific operational access

## Implementation Considerations

### Database Schema Changes
```sql
-- New tables
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  admin_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE company_user_relationships (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  relationship_type VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP
);

-- Modified tables
ALTER TABLE livestock_listings ADD COLUMN company_id UUID REFERENCES companies(id);
ALTER TABLE profiles MODIFY COLUMN role ENUM('super_admin', 'admin', 'seller', 'vet', 'agent', 'load_master');
```

### Email Templates
- **New User Registration**: "Welcome to [Company Name] Livestock Trading Platform"
- **Existing User Company Invitation**: "[Company Name] has invited you to their livestock trading network"
- **Listing Notification**: "New livestock listing requires your attention from [Company Name]"

## Benefits

1. **Scalability**: Multiple companies can use the same platform
2. **Resource Sharing**: Sellers and vets can work with multiple companies
3. **Data Isolation**: Companies maintain privacy and security
4. **Operational Efficiency**: Shared users reduce duplicate registrations
5. **Flexible Relationships**: Users can have different roles with different companies

## Migration Strategy

1. **Phase 1**: Create multi-tenant database schema
2. **Phase 2**: Migrate existing users to company relationships
3. **Phase 3**: Update invitation and registration flows
4. **Phase 4**: Modify dashboards and access controls
5. **Phase 5**: Test cross-company functionality

This architecture provides a robust foundation for a multi-company livestock trading platform while maintaining the flexibility and security required for commercial operations.