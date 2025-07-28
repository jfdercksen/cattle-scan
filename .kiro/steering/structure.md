# Project Structure

## Root Directory Structure

### Configuration Files
- **`package.json`**: Dependencies, scripts, and project metadata
- **`vite.config.ts`**: Vite build configuration with React SWC and path aliases
- **`tailwind.config.ts`**: Tailwind CSS configuration with custom theme and dark mode
- **`tsconfig.json`**: TypeScript configuration with project references
- **`tsconfig.app.json`**: Application-specific TypeScript settings
- **`tsconfig.node.json`**: Node.js-specific TypeScript settings
- **`eslint.config.js`**: ESLint configuration with TypeScript and React rules

### Environment & Documentation
- **`.env`**: Environment variables (not tracked in git)
- **`.env.example`**: Template for required environment variables
- **`README.md`**: Project documentation and setup instructions
- **`WIP.md`**: Work in progress notes and development roadmap
- **`.gitignore`**: Git ignore patterns for build artifacts and secrets

### Build & Deployment
- **`dist/`**: Production build output (generated)
- **`node_modules/`**: NPM dependencies (generated)
- **`public/`**: Static assets served directly

## Source Structure (`src/`)

### Core Application Files
```
src/
├── main.tsx              # Application entry point with React root
├── App.tsx               # Main app component with providers and routing
├── index.css             # Global styles, Tailwind imports, CSS variables
├── App.css               # Additional application styles (if needed)
└── vite-env.d.ts         # Vite environment type definitions
```

### Component Architecture (`src/components/`)

#### Main Application Components
```
components/
├── Header.tsx                    # Main navigation header with auth controls
├── Authenticated.tsx             # Authentication wrapper component
├── ProfileSection.tsx            # User profile display and management
├── ProfileCompletionForm.tsx     # New user profile setup form
├── theme-provider.tsx            # Dark/light theme context provider
└── theme-toggle.tsx              # Theme switching component
```

#### Form Components (Complex Multi-step Forms)
```
components/
├── LivestockListingForm.tsx      # Main livestock listing form container
├── VeterinaryDeclarationForm.tsx # Veterinary health declaration form with conditional field visibility
├── LivestockOfferForm.tsx        # Offer submission form
├── ListingInvitationForm.tsx     # Admin invitation creation form
├── SignaturePad.tsx              # Digital signature capture with mobile calibration
├── FileUploadManager.tsx         # File upload component with camera integration
├── CompanyRegistrationForm.tsx   # Company registration for admins
├── CompanySelector.tsx           # Company context switching component
├── CompanyManagement.tsx         # Company management interface
└── CompanyUserRelationshipManager.tsx # Multi-tenant user relationship management
```

#### Data Display Components (Tables & Views)
```
components/
├── LivestockListingsTable.tsx    # Main listings table with actions
├── AdminOffersTable.tsx          # Admin view of all offers
├── SellerOffersTable.tsx         # Seller-specific offers table
├── SellerLivestockTable.tsx      # Seller's livestock inventory
├── ListingInvitationsTable.tsx   # Admin invitations management
└── SellerInvitationsTable.tsx    # Seller's pending invitations
```

#### Dialog Components (Modals & Overlays)
```
components/
├── LivestockListingDialog.tsx         # Listing details modal
├── LivestockListingDetailsDialog.tsx  # Extended listing information
├── AdminViewListingDialog.tsx         # Admin-specific listing view
├── OfferDetailsDialog.tsx             # Offer information modal
├── AdminOfferDetailsDialog.tsx        # Admin offer management modal
└── SellerLivestockDialog.tsx          # Livestock item details
```

#### Specialized Component Folders

##### Multi-step Form Sections (`components/livestock-listing-form/`)
```
livestock-listing-form/
├── FormStepper.tsx                # Mobile-responsive step navigation component
├── LivestockDetailsSection.tsx    # Basic livestock information with field visibility control
├── BiosecuritySection.tsx         # Farm and biosecurity details
├── LoadingPointsSection.tsx       # Multiple loading locations with enhanced address management
├── VetSelectionSection.tsx        # Veterinarian assignment
├── DeclarationsSection.tsx        # Legal compliance declarations with file uploads
├── OfferTermsSection.tsx          # Pricing and terms
├── SignatureSection.tsx           # Digital signature capture with geolocation
└── LivestockLocationManager.tsx   # Enhanced location management for multiple herds
```

##### UI Components (`components/ui/`)
```
ui/
├── button.tsx              # Button variants and styles
├── input.tsx               # Form input components
├── form.tsx                # Form wrapper and field components
├── card.tsx                # Card container components
├── table.tsx               # Table structure components
├── dialog.tsx              # Modal and dialog components
├── select.tsx              # Dropdown selection components
├── checkbox.tsx            # Checkbox input components
├── switch.tsx              # Toggle switch components
├── badge.tsx               # Status and label badges
├── alert.tsx               # Alert and notification components
├── toast.tsx               # Toast notification system
├── calendar.tsx            # Date picker component
├── tabs.tsx                # Tab navigation components
├── accordion.tsx           # Collapsible content sections
├── YesNoSwitch.tsx         # Custom yes/no toggle component
└── use-toast.ts            # Toast hook utilities
```

### Page Components (`src/pages/`)

#### Role-based Dashboards
```
pages/
├── AdminDashboard.tsx      # Admin control panel with user management
├── SellerDashboard.tsx     # Seller livestock and offers management
├── AgentDashboard.tsx      # Agent marketplace and offer tools
├── VetDashboard.tsx        # Veterinarian declaration tools
└── LoadMasterDashboard.tsx # Load Master coordination and loading management
```

#### Feature Pages
```
pages/
├── CreateListingPage.tsx       # Livestock listing creation workflow
├── ViewListingPage.tsx         # Seller listing view and management
├── AdminViewListingPage.tsx    # Admin listing oversight and approval
├── Auth.tsx                    # Authentication (login/register)
├── Admin.tsx                   # Admin user approval interface
├── Index.tsx                   # Landing page and navigation
└── NotFound.tsx                # 404 error page
```

### Data Layer Architecture

#### Database Integration (`src/integrations/supabase/`)
```
integrations/supabase/
├── client.ts               # Supabase client configuration
└── types.ts                # Auto-generated database types
```

#### Type Definitions (`src/types/`)
```
types/
├── livestock.ts            # Livestock-specific type definitions
├── location.ts             # Enhanced location data models for multi-herd management
└── supabase.ts             # Extended Supabase type utilities
```

#### Validation Schemas (`src/lib/schemas/`)
```
lib/schemas/
├── livestockListingSchema.ts      # Livestock listing form validation
└── veterinaryDeclarationSchema.ts # Veterinary form validation
```

#### State Management (`src/contexts/`, `src/hooks/`, `src/providers/`, `src/services/`)
```
contexts/
├── auth.ts                 # Authentication context definition
├── companyContext.tsx      # Company context for multi-tenant switching
└── languageContext.tsx     # Language preference management

hooks/
├── use-mobile.tsx          # Mobile device detection
├── use-toast.ts            # Toast notification management
└── useUserProfile.ts       # User profile data management

providers/
└── AuthProvider.tsx        # Authentication state provider with multi-tenant support

services/
├── companyService.ts       # Company management and user relationships
├── invitationManager.ts    # Multi-tenant invitation system
└── multiTenantDashboardController.ts # Role-based dashboard data management
```

#### Utilities (`src/lib/`)
```
lib/
├── utils.ts                      # Utility functions (cn, clsx, etc.)
├── fieldVisibility.ts            # Field visibility controller for modular features
├── calculationEngine.ts          # Automated calculations for livestock requirements
├── signaturePadController.ts     # Mobile signature pad calibration and accuracy
└── __tests__/
    └── calculationEngine.test.ts # Unit tests for calculation engine
```

### Layout System (`src/layouts/`)
```
layouts/
└── AppLayout.tsx           # Main application layout with header and content
```

## Database Structure (`supabase/`)

### Schema Management
```
supabase/
├── migrations/             # Database schema version control
│   ├── 001_initial_schema.sql
│   ├── 002_add_listings.sql
│   └── 003_add_offers.sql
├── config.toml             # Supabase project configuration
└── .temp/                  # Temporary CLI files (gitignored)
```

## Naming Conventions & Standards

### File Naming
- **Components**: PascalCase matching the component name exactly
  - `LivestockListingForm.tsx` exports `LivestockListingForm`
  - `AdminDashboard.tsx` exports `AdminDashboard`
- **Hooks**: camelCase starting with `use`
  - `useUserProfile.ts` exports `useUserProfile`
- **Utilities**: camelCase descriptive names
  - `utils.ts` contains utility functions
- **Types**: PascalCase, often matching database entities
  - `livestock.ts` exports `LivestockListing`, `ListingInvitation`

### Folder Naming
- **Multi-word folders**: kebab-case
  - `livestock-listing-form/`
  - `supabase/`
- **Single word folders**: lowercase
  - `components/`, `pages/`, `hooks/`

### Component Naming Patterns
- **Form Components**: End with `Form`
  - `LivestockListingForm`, `ProfileCompletionForm`
- **Table Components**: End with `Table`
  - `LivestockListingsTable`, `AdminOffersTable`
- **Dialog Components**: End with `Dialog`
  - `OfferDetailsDialog`, `LivestockListingDialog`
- **Page Components**: End with `Page` or descriptive name
  - `CreateListingPage`, `AdminDashboard`

### Type Naming
- **Database Types**: Match table names in PascalCase
  - `LivestockListing` from `livestock_listings` table
  - `ListingInvitation` from `listing_invitations` table
- **Form Data Types**: End with `FormData`
  - `LivestockListingFormData`, `VeterinaryDeclarationFormData`
- **Props Types**: End with `Props`
  - `LivestockListingFormProps`, `FormStepperProps`

## Import Patterns & Conventions

### Import Ordering
```typescript
// 1. External library imports
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// 2. Internal component imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// 3. Internal utility imports
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';

// 4. Type imports (grouped separately)
import type { Tables } from '@/integrations/supabase/types';
import type { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
```

### Path Alias Usage
- **Always use `@/` for internal imports**: Never use relative paths like `../`
- **Consistent alias usage**: `@/components/`, `@/hooks/`, `@/lib/`, etc.
- **Type imports**: Use `import type` for type-only imports

### Export Patterns
- **Named exports preferred**: Easier to refactor and tree-shake
- **Default exports for pages**: Page components use default exports
- **Consistent export style**: Either all named or all default per file

## Architecture Patterns

### Component Composition
- **Compound Components**: Complex components broken into sub-components
- **Render Props**: Flexible component composition for reusable logic
- **Custom Hooks**: Extract stateful logic into reusable hooks
- **Context Providers**: Share state across component trees

### State Management Strategy
- **Server State**: TanStack Query for all API interactions
- **Global Client State**: React Context for authentication and app-wide state
- **Local Component State**: useState for component-specific state
- **Form State**: React Hook Form for complex forms with validation

### Error Handling
- **Error Boundaries**: Catch and handle React component errors
- **API Error Handling**: Consistent error handling in TanStack Query
- **Form Validation**: Zod schemas for runtime validation
- **User Feedback**: Toast notifications for user actions

### Performance Optimization
- **Code Splitting**: Route-based and component-based lazy loading
- **Memoization**: React.memo and useMemo for expensive operations
- **Query Optimization**: TanStack Query caching and background updates
- **Bundle Analysis**: Regular bundle size monitoring and optimization