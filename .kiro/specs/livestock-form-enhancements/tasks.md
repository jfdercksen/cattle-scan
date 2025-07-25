# Implementation Plan

## FOUNDATIONAL ARCHITECTURE TASKS (Must be completed first)

- [-] 0. Implement Multi-Tenant Company-Based Architecture (FOUNDATIONAL)
  - Create company-based multi-tenancy system
  - Implement company-user relationship management
  - Update invitation system for multi-company support
  - Add data isolation and access controls
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [ ] 0.1 Create Multi-Tenant Database Schema (FOUNDATIONAL)
  - Create companies table with admin_user_id and company settings
  - Create company_user_relationships table for many-to-many relationships
  - Add company_id to livestock_listings table
  - Update user roles to distinguish between super_admin and admin
  - Add database constraints and indexes for multi-tenancy
  - _Requirements: 1.1, 1.2, 1.3, 1.9_

- [ ] 0.2 Implement Company Registration and Management (FOUNDATIONAL)
  - Create company registration flow for first-time super_admin
  - Implement admin registration with company association
  - Build company management interface for super_admin
  - Add company settings and configuration options
  - _Requirements: 1.1, 1.2_

- [ ] 0.3 Build Multi-Company Invitation System (FOUNDATIONAL)
  - Create InvitationManager with checkUserExists() method
  - Implement separate email templates for new users vs existing users
  - Build invitation workflow for existing user company relationships
  - Add invitation status tracking and management
  - _Requirements: 7.1, 7.2, 7.3, 7.10_

- [ ] 0.4 Implement Company-User Relationship Management (FOUNDATIONAL)
  - Create CompanyUserRelationship model and database operations
  - Implement relationship creation, activation, and deactivation
  - Build user interface for managing company relationships
  - Add relationship status tracking and notifications
  - _Requirements: 1.4, 1.5, 1.6, 7.4, 7.5, 7.6_

- [ ] 0.5 Add Multi-Tenant Data Access Controls (FOUNDATIONAL)
  - Implement company-based data filtering for all queries
  - Create MultiTenantDashboardController for role-specific data access
  - Add company context switching for users with multiple relationships
  - Implement data isolation validation and security checks
  - _Requirements: 1.5, 1.6, 1.9_

- [ ] 0.6 Update Dashboards for Multi-Tenancy (FOUNDATIONAL)
  - Update AdminDashboard to show only company-specific data
  - Modify SellerDashboard to display multiple company relationships
  - Add company context selector for users with multiple relationships
  - Update VetDashboard to show listings from all associated companies
  - _Requirements: 1.6, 1.7, 1.8_

## IMPLEMENTATION TASKS

- [ ] 1. Implement Form State Management System
  - Create FormStateController component to manage form states and locking
  - Add state transition validation and role-based editing permissions
  - Implement visual indicators for locked form sections
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.1 Create Form State Controller Component
  - Write FormStateController interface with state management methods
  - Implement canEdit() method for section-level permissions
  - Add lockSection() and unlockSection() methods
  - Create state transition validation logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.2 Add Form State Database Schema
  - Create form_states table to track listing states
  - Add locked_sections column to livestock_listings table
  - Create state_transitions table for audit trail
  - Add database triggers for state change validation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.3 Implement Visual State Indicators
  - Add locked section styling to form components
  - Create read-only form field variants
  - Add state badges and progress indicators
  - Implement section-level disable/enable functionality
  - _Requirements: 2.5_

- [ ] 2. Add Load Master Role and Dashboard
  - Create Load Master role in user_role enum
  - Build LoadMasterDashboard component with loading-specific functionality
  - Implement loading details management restricted to Load Master role
  - Add loading completion workflow with geolocation capture
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 2.1 Create Load Master Role Infrastructure
  - Add 'load_master' to user_role enum in database
  - Update role-based routing to include Load Master dashboard
  - Create LoadMasterDashboard page component
  - Add Load Master specific navigation and permissions
  - _Requirements: 1.2, 1.3_

- [ ] 2.2 Build Loading Management Interface
  - Create LoadingSchedule and LoadingRecord interfaces
  - Implement pendingLoadings and completedLoadings data fetching
  - Build loading details form with vehicle information
  - Add loading status tracking and updates
  - _Requirements: 1.4_

- [ ] 2.3 Implement Loading Completion Workflow
  - Create updateLoadingDetails method with geolocation capture
  - Add loading completion validation and state transitions
  - Implement loading notes and livestock condition tracking
  - Create loading completion notifications
  - _Requirements: 1.4, 8.1, 8.2_

- [x] 3. Enhanced Livestock Location Management
  - Refactor location management to support multiple herds with separate birth, current, and loading locations
  - Add "same as above" functionality to reduce repetitive data entry
  - Implement complex South African farm address format support
  - Create dynamic loading points management
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 Create Enhanced Location Data Models
  - Update HerdLocation interface with birth, current, and loading locations
  - Create FarmAddress interface for complex SA farm addresses
  - Add MovementRecord interface for livestock movement history
  - Update database schema for enhanced location tracking
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.2 Build Livestock Location Manager Component
  - Create LivestockLocationManager with herd management
  - Implement addHerd(), updateHerdLocation(), and copyLocationData() methods
  - Add herd numbering (Herd 1, Herd 2, etc.) with location tracking
  - Create "same as above" functionality for similar locations
  - _Requirements: 3.3, 3.4_

- [x] 3.3 Update Loading Points Section
  - Refactor LoadingPointsSection to use enhanced location management
  - Add support for multiple loading points per herd
  - Implement dynamic loading point addition/removal
  - Update form validation for complex address formats
  - _Requirements: 3.5_

- [x] 4. Implement Enhanced File Upload System
  - Add brand mark photo upload for farmers during signup
  - Implement veterinary practice letterhead upload for vets
  - Create affidavit document upload with camera/scan options
  - Add file type validation and upload status feedback
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.1 Create File Upload Manager Component
  - Build FileUploadManager with uploadBrandPhoto(), uploadVetLetterhead(), and uploadAffidavit() methods
  - Implement capturePhoto() method for camera integration
  - Add validateFileType() method for file validation
  - Create upload progress and status feedback UI
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.2 Update Profile Completion Forms
  - Add brand mark photo upload to farmer profile completion
  - Implement veterinary letterhead upload for vet signup
  - Update ProfileCompletionForm with role-specific file uploads
  - Add file upload validation and error handling
  - _Requirements: 1.5, 5.1, 5.2_

- [x] 4.3 Enhance Affidavit Upload in Livestock Form
  - Update DeclarationsSection with affidavit upload functionality
  - Add camera capture and file selection options
  - Implement file preview and replacement functionality
  - Add upload validation and error handling
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 5. Implement Automated Calculations and Validations
  - Create calculation engine for mouthing percentage requirements
  - Implement real-time validation of calculated fields
  - Add visual feedback for calculation results
  - Add conditional field visibility based on livestock types loaded (cattle/sheep)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5.1 Build Calculation Engine
  - Create CalculationEngine interface with calculateMouthingRequirement() method
  - Implement MouthingRequirement interface with percentage calculations
  - Create validatePercentageCompliance() method
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5.2 Integrate Calculations into Livestock Form
  - Add real-time mouthing percentage calculations based on total cattle
  - Add validation for calculated percentage requirements
  - Create visual indicators for calculation results
  - Implement conditional field visibility in VeterinaryDeclarationForm based on loaded livestock types
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 5.3 Add Conditional Visibility to VeterinaryDeclarationForm
  - Hide sheep-related questions when only cattle are loaded (number_sheep_loaded is 0 or null)
  - Hide cattle-related questions when only sheep are loaded (number_cattle_loaded is 0 or null)
  - Show all questions when both cattle and sheep are loaded
  - Update form validation to only validate visible fields
  - _Requirements: 6.5_

- [ ] 6. Enhanced Multi-Company Invitation System (Depends on 0.3, 0.4)
  - Integrate multi-tenant invitation system with livestock listing workflow
  - Add company-specific invitation templates and branding
  - Implement cross-company seller/vet sharing functionality
  - Create invitation acceptance workflow for existing users
  - _Requirements: 7.7, 7.8, 7.9_

- [ ] 6.1 Integrate Multi-Tenant Invitations with Livestock Workflow
  - Update ListingInvitationForm to use multi-tenant invitation system
  - Add company context to all invitation-related operations
  - Implement invitation acceptance for existing users
  - Create notification system for new company relationships
  - _Requirements: 7.7, 7.8_

- [ ] 6.2 Enhance Cross-Company User Sharing
  - Implement seller/vet sharing across multiple companies
  - Add user interface for managing multiple company relationships
  - Create company-specific user lists and filtering
  - Implement permission checks for cross-company access
  - _Requirements: 7.6, 7.9_

- [ ] 7. Implement Geolocation Features
  - Add GPS coordinate capture for digital signatures
  - Implement location data collection with user permission
  - Create geolocation fallback options and error handling
  - Add location audit trails for critical actions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7.1 Create Geolocation Data Models
  - Build GeolocationData interface with latitude, longitude, accuracy, and timestamp
  - Add geolocation fields to livestock_listings table
  - Create location audit trail tables
  - Implement geolocation data encryption
  - _Requirements: 8.1, 8.2, 8.5_

- [ ] 7.2 Enhance Signature Section with Geolocation
  - Update SignatureSection to capture GPS coordinates during signing
  - Add location permission request handling
  - Implement geolocation accuracy validation
  - Create fallback location entry options
  - _Requirements: 8.1, 8.3, 8.4_

- [ ] 7.3 Add Geolocation to Form Submission
  - Capture location data during form submission
  - Add geolocation to loading completion workflow
  - Implement location-based audit logging
  - Create location data privacy controls
  - _Requirements: 8.2, 8.5_

- [ ] 8. Implement Workflow State Management
  - Create comprehensive workflow state system with proper sequence enforcement
  - Add biosecurity evaluation requirements before loading scheduling
  - Implement Load Master-only loading completion restrictions
  - Create workflow notifications and audit trails
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8.1 Build Workflow State System
  - Create workflow state enum with all required states
  - Implement state transition validation logic
  - Add workflow state tracking in database
  - Create state-based permission checking
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 8.2 Add Workflow Notifications
  - Implement notification system for state changes
  - Create role-specific notification templates
  - Add email notifications for workflow transitions
  - Build in-app notification display
  - _Requirements: 9.3_

- [ ] 8.3 Create Workflow Audit System
  - Build comprehensive audit trail for all workflow actions
  - Add approval tracking with user and timestamp
  - Implement workflow violation logging
  - Create audit trail display for administrators
  - _Requirements: 9.4_

- [ ] 9. Implement Responsible Person Validation
  - Add age validation (18+ years) for responsible persons
  - Create management role confirmation requirements
  - Support multiple responsible persons for different herds
  - Implement responsible person data persistence throughout transaction lifecycle
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9.1 Create Responsible Person Data Models
  - Build ResponsiblePerson interface with age and role validation
  - Add responsible person fields to livestock listings
  - Create validation schemas for responsible person data
  - Implement responsible person relationship to herds
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 9.2 Add Responsible Person Validation
  - Implement age validation (18+ years) in form validation
  - Add management role confirmation checkboxes
  - Create responsible person data persistence logic
  - Add validation error handling and user feedback
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [x] 10. Enhanced Form Structure and User Experience (HIGH PRIORITY)
  - Hide advanced livestock detail fields for initial launch (modular approach)
  - Create dedicated "Livestock Location" tab separate from other sections
  - Implement livestock type-specific field visibility with complete hiding of irrelevant fields
  - Fix mobile responsiveness issues with form tabs and navigation
  - Fix signature pad accuracy issues on mobile devices
  - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 11.1, 11.2, 11.3, 11.4_

- [x] 10.1 Simplify Form Fields for Initial Launch (CRITICAL)
  - Hide advanced livestock detail fields: weaning status, grain feeding, growth implants, breed details, estimated weight
  - Remove redundant "weighing location" field (covered by loading points)
  - Implement modular field system for future feature additions
  - Ensure hidden fields remain in database schema for future activation
  - _Requirements: 4.6, 4.7, 3.6_

- [x] 10.2 Fix Mobile Responsiveness Issues (CRITICAL)
  - Fix form tab navigation to prevent horizontal scrolling on mobile
  - Implement vertical tab stacking or responsive tab design for mobile
  - Test and validate tab visibility across different mobile screen sizes
  - Ensure all form sections are accessible on mobile devices
  - _Requirements: 11.1, 11.3, 11.5, 11.6_

- [x] 10.3 Fix Signature Pad Accuracy (CRITICAL)
  - Calibrate signature pad touch input to eliminate finger position offset
  - Test signature accuracy across different mobile devices
  - Implement touch position correction algorithms
  - Ensure signature pad works accurately on both mobile and desktop
  - _Requirements: 11.2, 11.4, 11.6_

- [x] 10.4 Implement Conditional Field Visibility
  - Completely hide sheep-related fields when livestock type is "CATTLE" only
  - Completely hide cattle-related fields when livestock type is "SHEEP" only
  - Show all fields only when livestock type is "CATTLE AND SHEEP"
  - Implement dynamic field hiding based on user selections
  - _Requirements: 4.3, 4.7_

- [x] 10.1 Simplify Form Fields for Initial Launch (CRITICAL)
- [x] 10.2 Fix Mobile Responsiveness Issues (CRITICAL) 
- [x] 10.3 Fix Signature Pad Accuracy (CRITICAL)
- [ ] 11. Update Declaration Content and Wording (HIGH PRIORITY)
- [ ] 11.1 Update Declaration Content and Wording (HIGH PRIORITY)
  - Update declaration text based on client-provided corrected wording
  - Implement easy declaration content management system for future updates
  - Ensure legal compliance of all declaration statements
  - Test declaration display and functionality after content updates
  - _Requirements: 12.1, 12.2, 12.3_