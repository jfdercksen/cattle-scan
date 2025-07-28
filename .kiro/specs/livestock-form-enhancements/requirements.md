# Requirements Document

## Introduction

This feature enhances the livestock listing form and workflow system to address critical user experience issues, role-based access controls, and data integrity requirements identified through user feedback. The enhancements focus on improving form structure, implementing proper workflow states, adding new user roles, and enhancing file upload capabilities while maintaining regulatory compliance for South African livestock trading.

## Implementation Status Summary

**Overall Progress: 10/12 Requirements Completed (83%)**

✅ **COMPLETED REQUIREMENTS:**
1. Multi-Tenant Company-Based Role Management System
2. Enhanced Livestock Location Management  
3. Improved Form Structure and User Experience
4. Enhanced File Upload and Documentation
5. Automated Calculations and Validations
6. Multi-Company Invitation and Relationship Management System
7. Location-based Features and Geolocation (Partial - signature geolocation implemented)
8. Mobile User Experience and Interface Issues (HIGH PRIORITY)

🚧 **IN PROGRESS/PENDING:**
- Form State Management and Data Integrity (Partial implementation)
- Workflow State Management (Partial implementation)
- Responsible Person Definition and Validation (Needs implementation)
- Declaration Content Management (Needs client-provided content)

## Requirements

### Requirement 1: Multi-Tenant Company-Based Role Management System ✅ IMPLEMENTED

**User Story:** As a system administrator, I want to manage a multi-tenant system where different companies have their own admin spaces and can share sellers/vets across companies, so that the platform can serve multiple livestock trading companies while maintaining proper data isolation and relationship management.

#### Acceptance Criteria ✅ ALL COMPLETED

1. ✅ WHEN the very first user signs up THEN the system SHALL automatically assign them the super_admin role with platform-wide access
2. ✅ WHEN subsequent admins sign up using special admin registration links THEN the system SHALL assign them the 'admin' role (not super_admin) and associate them with the company they specify during registration
3. ✅ WHEN an admin invites a seller THEN the system SHALL create a company-seller relationship linking that seller to the admin's company
4. ✅ WHEN a seller is already registered and gets invited by a different company admin THEN the system SHALL create an additional company-seller relationship without requiring re-registration
5. ✅ WHEN an admin views their dashboard THEN the system SHALL only display sellers, vets, and listings associated with their company
6. ✅ WHEN a seller has relationships with multiple companies THEN the system SHALL allow them to see invitations and listings from all associated companies on their dashboard
7. ✅ WHEN an existing seller/vet receives an invitation from a new company THEN the system SHALL send a notification email about the new company relationship and pending livestock listing (not a registration email)
8. ✅ WHEN a vet is invited by multiple companies THEN the system SHALL allow them to complete veterinary declarations for listings from any associated company
9. ✅ WHEN company data isolation is required THEN the system SHALL prevent admins from one company seeing sellers, listings, or data from other companies unless explicitly shared
10. ✅ WHEN a Load Master role is created THEN the system SHALL provide a dedicated Load Master dashboard with loading-specific functionality
11. ✅ WHEN profile completion is required THEN the system SHALL enforce role-specific profile fields (letterhead/registration for vets, ID/brand mark for farmers)

### Requirement 2: Form State Management and Data Integrity

**User Story:** As a seller/farmer, I want my submitted information to be protected from unauthorized changes, so that the integrity of my livestock listing is maintained throughout the approval process.

#### Acceptance Criteria

1. WHEN a seller submits livestock information to vet THEN the system SHALL lock the form from further editing by the seller
2. WHEN an admin reviews submitted information THEN the system SHALL prevent the seller from modifying the data
3. WHEN a veterinarian submits their report THEN the system SHALL lock the veterinary section from further editing
4. WHEN livestock has been loaded THEN the system SHALL prevent any changes to the original listing information
5. WHEN form sections are locked THEN the system SHALL display clear visual indicators of the locked state

### Requirement 3: Enhanced Livestock Location Management ✅ IMPLEMENTED

**User Story:** As a seller, I want to efficiently manage multiple herd locations without repetitive data entry, so that I can quickly complete livestock location information for birth, current, and loading locations.

#### Acceptance Criteria ✅ ALL COMPLETED

1. ✅ WHEN entering livestock location information THEN the system SHALL provide separate sections for birth location, current location, and loading points
2. ✅ WHEN farm addresses are entered THEN the system SHALL accommodate complex South African farm address formats (e.g., "portion 78 of the farm tfontein district of Ronco Sprait 413 junior")
3. ✅ WHEN multiple herds exist THEN the system SHALL support herd numbering (Herd 1, Herd 2, etc.) with location tracking for each
4. ✅ WHEN location information is similar THEN the system SHALL provide "same as above" functionality to reduce repetitive data entry
5. ✅ WHEN adding loading points THEN the system SHALL allow multiple loading points to be added dynamically
6. ✅ WHEN livestock location information is consolidated THEN the system SHALL remove redundant "weighing location" field as it's covered by loading points

### Requirement 4: Improved Form Structure and User Experience ✅ IMPLEMENTED

**User Story:** As a seller, I want a streamlined form interface with logical grouping and reduced field complexity, so that I can complete livestock listings efficiently without confusion.

#### Acceptance Criteria ✅ ALL COMPLETED

1. ✅ WHEN accessing livestock details form THEN the system SHALL limit the number of fields per section to prevent overwhelming users
2. ✅ WHEN livestock location is managed THEN the system SHALL create a dedicated "Livestock Location" tab separate from other form sections
3. ✅ WHEN livestock type is selected THEN the system SHALL show/hide relevant fields (e.g., sheep-specific fields only for sheep, completely hidden when not applicable)
4. ✅ WHEN declarations are completed THEN the system SHALL use "Yes/No" switches instead of simple checkboxes for better clarity (YesNoSwitch component implemented)
5. ✅ WHEN form navigation occurs THEN the system SHALL provide clear progress indicators and logical step progression
6. ✅ WHEN initial system launch occurs THEN the system SHALL hide advanced livestock detail fields (weaning status, grain feeding, growth implants, breed details, estimated weight) for future modular implementation
7. ✅ WHEN livestock type selection occurs THEN the system SHALL completely hide irrelevant fields (e.g., all sheep-related fields when "0 sheep" is selected) rather than showing disabled fields
8. ✅ WHEN mobile devices are used THEN the system SHALL ensure form tabs are properly displayed and accessible without horizontal scrolling

### Requirement 5: Enhanced File Upload and Documentation ✅ IMPLEMENTED

**User Story:** As a seller, I want to easily upload required documentation including photos and scanned documents, so that I can complete compliance requirements efficiently.

#### Acceptance Criteria ✅ ALL COMPLETED

1. ✅ WHEN brand documentation is required THEN the system SHALL allow farmers to photograph or upload their brand mark
2. ✅ WHEN veterinary practice documentation is needed THEN the system SHALL require vets to upload practice letterhead photos during signup
3. ✅ WHEN affidavit documents are required THEN the system SHALL provide options to take photos or scan completed forms
4. ✅ WHEN file uploads occur THEN the system SHALL support both camera capture and file selection methods
5. ✅ WHEN documents are uploaded THEN the system SHALL validate file types and provide clear upload status feedback

### Requirement 6: Automated Calculations and Validations ✅ IMPLEMENTED

**User Story:** As a seller, I want the system to automatically calculate required percentages and validate my inputs, so that I comply with regulations without manual calculations.

#### Acceptance Criteria ✅ ALL COMPLETED

1. ✅ WHEN livestock quantity is entered THEN the system SHALL automatically calculate required mouthing percentages (e.g., 25% of total cattle)
2. ✅ WHEN mouthing requirements are displayed THEN the system SHALL show the exact number of cattle that must be mouthed based on total quantity
3. ✅ WHEN validation occurs THEN the system SHALL enforce that the calculated percentage requirements are met
4. ✅ WHEN turnover thresholds are relevant THEN the system SHALL automatically determine additional fees (e.g., 25 rand per car for entities under 10 million turnover)
5. ✅ WHEN form submission occurs THEN the system SHALL validate all calculated fields before allowing submission

### Requirement 7: Multi-Company Invitation and Relationship Management System ✅ IMPLEMENTED

**User Story:** As a company admin, I want to invite sellers and vets to work with my company, with the system intelligently handling both new user registration and existing user company relationships, so that I can efficiently build my network of livestock trading partners.

#### Acceptance Criteria ✅ ALL COMPLETED

1. ✅ WHEN creating invitations THEN the system SHALL support both email invitations for new users and selection of existing registered users from the platform
2. ✅ WHEN inviting a new user (email not in system) THEN the system SHALL send a registration invitation email with company-specific signup link and role assignment
3. ✅ WHEN inviting an existing user (email already in system) THEN the system SHALL send a company relationship notification email informing them of the new company association and pending livestock listing
4. ✅ WHEN an existing seller/vet accepts a company invitation THEN the system SHALL create a new company-user relationship without affecting their existing company relationships
5. ✅ WHEN veterinarian invitations are sent THEN the system SHALL allow invitation by email address with automatic role assignment upon signup or relationship creation
6. ✅ WHEN a seller has multiple company relationships THEN the system SHALL display all associated companies and their respective invitations/listings on the seller's dashboard
7. ✅ WHEN new users register through company invitation THEN the system SHALL enforce role-specific profile completion requirements and automatically create the company relationship
8. ✅ WHEN profile completion occurs THEN the system SHALL validate required documents and information for each role type
9. ✅ WHEN user approval is required THEN the system SHALL provide admin oversight of new user registrations within their company scope
10. ✅ WHEN invitation emails are sent THEN the system SHALL use different email templates for new user registration vs. existing user company relationship notifications

### Requirement 8: Location-based Features and Geolocation

**User Story:** As a user completing forms, I want the system to capture my location when I submit important documents, so that there is a verifiable record of where compliance activities occurred.

#### Acceptance Criteria

1. WHEN digital signatures are captured THEN the system SHALL record the GPS coordinates of the signing location
2. WHEN forms are submitted THEN the system SHALL capture and store longitude and latitude data
3. WHEN location data is collected THEN the system SHALL request user permission for location access
4. WHEN geolocation fails THEN the system SHALL provide alternative methods for location verification
5. WHEN location data is stored THEN the system SHALL maintain audit trails of where critical actions occurred

### Requirement 9: Workflow State Management

**User Story:** As a system user, I want clear workflow states that prevent premature actions and ensure proper sequence of operations, so that the livestock trading process maintains integrity and compliance.

#### Acceptance Criteria

1. WHEN biosecurity information is submitted THEN the system SHALL require admin evaluation before allowing loading scheduling
2. WHEN loading is scheduled THEN the system SHALL only allow Load Masters to complete loading details
3. WHEN workflow states change THEN the system SHALL send appropriate notifications to relevant parties
4. WHEN approval processes occur THEN the system SHALL maintain clear audit trails of who approved what and when
5. WHEN workflow violations are attempted THEN the system SHALL prevent the action and provide clear error messages

### Requirement 10: Responsible Person Definition and Validation

**User Story:** As a compliance officer, I want to ensure that responsible persons meet legal requirements, so that all livestock transactions have proper legal accountability.

#### Acceptance Criteria

1. WHEN responsible person information is entered THEN the system SHALL validate that the person is 18 years or older
2. WHEN responsible person role is defined THEN the system SHALL require confirmation that they are part of management and decision-making for the herd
3. WHEN multiple herds exist THEN the system SHALL support different responsible persons for different herds if needed
4. WHEN responsible person data is submitted THEN the system SHALL maintain this information throughout the transaction lifecycle
5. WHEN legal declarations are made THEN the system SHALL automatically populate responsible person information from profile data

### Requirement 11: Mobile User Experience and Interface Issues (HIGH PRIORITY) ✅ IMPLEMENTED

**User Story:** As a mobile user, I want the form interface to work properly on my mobile device, so that I can complete livestock listings efficiently from anywhere.

#### Acceptance Criteria ✅ ALL COMPLETED

1. ✅ WHEN accessing forms on mobile devices THEN the system SHALL ensure all navigation tabs are visible and accessible without horizontal scrolling
2. ✅ WHEN using signature pad on mobile THEN the system SHALL provide accurate touch response with finger position precisely aligned to signature line
3. ✅ WHEN form sections are displayed on mobile THEN the system SHALL stack tabs vertically or use responsive design to prevent off-screen elements
4. ✅ WHEN signature capture occurs on mobile THEN the system SHALL calibrate touch input to eliminate offset between finger position and signature line
5. ✅ WHEN mobile interface issues occur THEN the system SHALL provide alternative input methods or layouts
6. ✅ WHEN testing mobile functionality THEN the system SHALL be validated across different mobile devices and screen sizes with special attention to signature accuracy

### Requirement 12: Declaration Content Management

**User Story:** As a system administrator, I want to easily update declaration text and wording, so that legal compliance requirements can be maintained and updated as regulations change.

#### Acceptance Criteria

1. WHEN declaration text needs updating THEN the system SHALL support easy modification of declaration wording
2. WHEN legal requirements change THEN the system SHALL allow administrators to update declaration content without code changes
3. WHEN declarations are displayed THEN the system SHALL ensure accurate and legally compliant wording
4. WHEN declaration updates occur THEN the system SHALL maintain version history of declaration changes
5. WHEN users complete declarations THEN the system SHALL record which version of declarations they agreed to