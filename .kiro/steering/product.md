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
- **Multi-role system**: Granular role-based access control (Admin, Seller, Agent, Veterinarian, Driver)
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

### Super Admin / Admin
- **Primary Functions**: Platform management, user approval, system oversight
- **Key Capabilities**:
  - Create and manage listing invitations
  - Approve/reject user registrations
  - View all listings and offers across the platform
  - Access comprehensive admin dashboard with analytics
  - Manage system-wide settings and configurations

### Seller
- **Primary Functions**: Livestock listing creation, offer management
- **Key Capabilities**:
  - Accept listing invitations from admins
  - Create detailed livestock listings with biosecurity information
  - Manage incoming offers (accept/reject/negotiate)
  - Provide digital signatures for legal compliance
  - Track listing status and offer history

### Agent
- **Primary Functions**: Transaction facilitation, buyer representation
- **Key Capabilities**:
  - Browse available livestock listings
  - Submit offers on behalf of buyers
  - Facilitate negotiations between buyers and sellers
  - Access market analytics and pricing information

### Veterinarian
- **Primary Functions**: Health declarations, compliance verification
- **Key Capabilities**:
  - Complete veterinary declaration forms
  - Verify livestock health and safety compliance
  - Provide professional oversight for transactions
  - Access veterinary-specific dashboard and tools

### Driver
- **Primary Functions**: Transportation coordination, logistics management
- **Key Capabilities**:
  - Access transportation schedules and routes
  - Coordinate livestock pickup and delivery
  - Update transportation status and tracking
  - Manage vehicle and driver information

## Core Workflow

### 1. Invitation & Registration Phase
- Admin creates listing invitation with unique reference ID
- Seller receives invitation (existing user) or email invitation (new user)
- New users complete registration and profile setup
- Admin approves new user accounts

### 2. Listing Creation Phase
- Seller accepts listing invitation
- Multi-step form completion:
  - Basic livestock details (type, quantity, breed)
  - Biosecurity information (farm locations, movement history)
  - Loading details and logistics information
  - Veterinary selection and coordination
  - Legal declarations and compliance statements
  - Digital signature capture

### 3. Market Phase
- Completed listings become available to agents/buyers
- Agents submit offers with pricing and terms
- Sellers review and respond to offers
- Negotiation process through offer modifications

### 4. Completion Phase
- Offer acceptance triggers completion workflow
- Veterinary declarations completed by assigned veterinarian
- Final documentation and signature collection
- Transportation coordination with drivers
- Transaction completion and record archival

## Data Architecture Concepts

### Reference System
- **Unique Reference IDs**: Every invitation and listing has a traceable reference
- **Cross-reference Linking**: References maintained throughout the entire workflow
- **Audit Trail**: Complete history of all actions and status changes

### Status Management
- **Invitation Status**: pending, accepted, completed, expired
- **Listing Status**: draft, active, under_offer, completed, cancelled
- **Offer Status**: pending, accepted, rejected, withdrawn, expired

### Compliance Tracking
- **Declaration Requirements**: Multiple mandatory declarations for legal compliance
- **Signature Verification**: Digital signatures with timestamp and location data
- **Document Storage**: Secure file storage for affidavits and supporting documents

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