# Product Overview

Cattle Scan is a comprehensive livestock trading platform that facilitates the buying and selling of cattle and sheep in South Africa. The application manages the complete livestock trading workflow from invitation creation to final delivery, ensuring regulatory compliance and traceability throughout the process.

## Business Context

The platform addresses the complex requirements of livestock trading in South Africa, including:
- **Regulatory Compliance**: Adherence to South African livestock trading regulations
- **Biosecurity Requirements**: Comprehensive tracking of livestock movement and health declarations
- **Traceability**: Complete audit trail from farm to market
- **Multi-stakeholder Coordination**: Seamless interaction between sellers, buyers, veterinarians, and logistics providers

## Key Features

### Core Trading Features
- **Invitation-based listings**: Admin-initiated workflow ensuring controlled market entry
- **Comprehensive livestock documentation**: Multi-step forms capturing livestock details, biosecurity information, and veterinary declarations
- **Digital signatures**: Electronic signature capture for legal compliance and document authentication
- **Offer management**: Complete offer lifecycle from creation to acceptance with negotiation capabilities
- **Reference tracking**: Unique reference IDs for complete transaction traceability

### User Management & Authentication
- **Multi-role system**: Granular role-based access control (Admin, Seller, Agent, Veterinarian, Load Master)
- **Profile completion workflow**: Mandatory profile setup with role-specific information
- **User approval system**: Admin approval required for new user accounts
- **Session management**: Secure authentication with Supabase Auth

### Compliance & Documentation
- **Veterinary declarations**: Comprehensive health and safety declarations
- **Biosecurity tracking**: Detailed farm location and livestock movement history
- **Legal declarations**: Multiple mandatory declarations for regulatory compliance
- **Document management**: File upload and storage for affidavits and supporting documents

### User Experience
- **Bilingual support**: Complete English and Afrikaans language support for South African market
  - Language switching via header toggle buttons (EN/AF)
  - User language preference persistence across sessions
  - All UI text, form labels, validation messages, and notifications in both languages
  - Legal declarations and compliance text in both official languages
  - Date and number formatting according to South African locales
- **Responsive design**: Mobile-first approach with desktop optimization
- **Dark/Light theme**: User preference-based theming
- **Progressive forms**: Multi-step forms with validation and progress tracking

## User Roles & Permissions

### Super Admin
- **Primary Functions**: Platform-wide management, first user with system-wide access
- **Key Capabilities**:
  - View and manage all companies across the platform
  - Manage system-wide settings and configurations
  - Platform oversight and analytics
  - Automatically assigned to the first user who registers

### Company Admin
- **Primary Functions**: Company-specific management, user approval, company oversight
- **Key Capabilities**:
  - Create and manage listing invitations within their company
  - Approve/reject user registrations for their company
  - View all listings and offers within their company
  - Manage company-specific settings and branding
  - Invite sellers and vets to join their company
  - Access company-specific admin dashboard with analytics

### Seller
- **Primary Functions**: Livestock listing creation from invitation, multi-company relationships
- **Key Capabilities**:
  - Accept listing invitations from multiple company admins
  - Create detailed livestock listings with enhanced location management
  - Provide digital signatures with geolocation for legal compliance
  - Track listing status and offer history across all associated companies
  - Upload brand mark photos and required documentation
  - Switch between different company contexts if associated with multiple companies

### Agent
- **Primary Functions**: Transaction facilitation, buyer representation
- **Key Capabilities**:
  - Browse available livestock listings
  - Submit offers on behalf of buyers
  - Facilitate negotiations between buyers and sellers
  - Access market analytics and pricing information

### Veterinarian
- **Primary Functions**: Health declarations, compliance verification, multi-company service
- **Key Capabilities**:
  - Complete veterinary declaration forms with conditional field visibility
  - Verify livestock health and safety compliance with automated calculations
  - Provide professional oversight for transactions across multiple companies
  - Access veterinary-specific dashboard showing listings from all associated companies
  - Upload practice letterhead and registration documentation
  - View livestock details with enhanced location and loading point information

### Load Master
- **Primary Functions**: Transportation coordination, loading management
- **Key Capabilities**:
  - Access loading schedules and coordinate livestock transportation
  - Complete loading details with geolocation capture
  - Update transportation status and tracking
  - Manage vehicle and loading information
  - Access Load Master-specific dashboard and tools

## Core Workflow

### 1. Company Setup & Multi-Tenant Invitation Phase
- First user becomes Super Admin with platform-wide access
- Subsequent admins register with company association
- Company admins create listing invitations with unique reference IDs
- System intelligently handles new user registration vs existing user company relationships
- New users receive registration emails, existing users receive company relationship notifications
- Company admins approve new user accounts within their company scope

### 2. Enhanced Listing Creation Phase
- Seller accepts listing invitation from company admin
- Multi-step form completion with mobile-responsive navigation:
  - Basic livestock details with conditional field visibility (simplified for initial launch)
  - Enhanced livestock location management for multiple herds (birth, current, loading addresses)
  - Biosecurity information with complex South African farm address support
  - Multiple loading points with dynamic addition/removal
  - Veterinary selection and coordination
  - Legal declarations with file upload capabilities (affidavits, brand marks)
  - Digital signature capture with mobile touch calibration and geolocation

### 3. Market Phase
- Completed listings become available to agents/buyers
- Agents submit offers with pricing and terms
- Sellers review and respond to offers
- Negotiation process through offer modifications

### 4. Enhanced Completion Phase
- Offer acceptance triggers completion workflow with state management
- Veterinary declarations completed with conditional field visibility based on livestock types
- Automated mouthing requirement calculations (25% for cattle and sheep)
- Final documentation and signature collection with geolocation
- Load Master coordination for transportation with loading completion workflow
- Transaction completion and record archival with comprehensive audit trails

## Data Architecture Concepts

### Multi-Tenant Company Architecture
- **Company-Based Data Isolation**: Each company has its own data space with controlled access
- **Cross-Company User Relationships**: Users can belong to multiple companies simultaneously
- **Company-User Relationship Management**: Many-to-many relationships with status tracking
- **Intelligent Invitation System**: Automatic detection of new vs existing users

### Reference System
- **Unique Reference IDs**: Every invitation and listing has a traceable reference
- **Cross-reference Linking**: References maintained throughout the entire workflow
- **Audit Trail**: Complete history of all actions and status changes with geolocation data

### Enhanced Status Management
- **Form State Management**: Workflow-based form section locking and permissions
- **Invitation Status**: pending, accepted, completed, expired
- **Listing Status**: draft, vet_assigned, submitted_to_vet, vet_completed, available_for_loading, loading_completed
- **Company Relationship Status**: pending, active, inactive

### Advanced Compliance Tracking
- **Declaration Requirements**: Multiple mandatory declarations with file upload support
- **Signature Verification**: Digital signatures with timestamp, geolocation, and mobile calibration
- **Document Storage**: Secure file storage with role-based access (brand marks, vet letterheads, affidavits)
- **Automated Calculations**: Mouthing requirements and compliance validations
- **Conditional Field Visibility**: Dynamic form fields based on livestock types and feature flags

## Business Rules

### Invitation Rules
- Only admins can create listing invitations
- Each invitation must have a unique reference ID
- Invitations can only be accepted by the designated seller
- Expired invitations cannot be used for listing creation

### Listing Rules
- Listings must be created from valid invitations
- All mandatory fields must be completed before submission
- At least one loading point must be specified
- Either an existing vet must be selected or a new vet invited

### Offer Rules
- Offers can only be submitted on active listings
- Sellers cannot submit offers on their own listings
- Offer modifications create new offer versions
- Accepted offers lock the listing from further offers

### Compliance Rules
- All declarations must be accepted (boolean true) before submission
- Digital signatures are mandatory for listing completion
- Veterinary declarations required before final completion
- File uploads required for specific declaration types (affidavits)

### Language & Localization Rules
- Users can switch between English and Afrikaans at any time
- Language preference is persisted in user profile or local storage
- All legal declarations must be available in both languages
- Form validation messages must be localized
- Date formats follow South African conventions (DD/MM/YYYY)
- Currency displays in South African Rand (ZAR) format
- All email notifications sent in user's preferred language