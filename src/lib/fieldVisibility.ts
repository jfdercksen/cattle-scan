/**
 * Field Visibility Controller for Livestock Form
 * 
 * This module implements a modular approach to field visibility,
 * allowing advanced fields to be hidden for initial launch while
 * maintaining them in the database schema for future activation.
 */

export interface FormContext {
  isInitialLaunch?: boolean;
  userRole?: string;
  featureFlags?: Record<string, boolean>;
}

export enum FormSection {
  LIVESTOCK_DETAILS = 'livestock_details',
  BIOSECURITY = 'biosecurity',
  LOADING_POINTS = 'loading_points',
  LOADING_DETAILS = 'loading_details',
  VET_SELECTION = 'vet_selection',
  OFFER_TERMS = 'offer_terms',
  DECLARATIONS = 'declarations',
  SIGNATURE = 'signature',
}

// Fields that are hidden for initial launch
const HIDDEN_FIELDS_INITIAL_LAUNCH = [
  // Weaning status fields
  'mothers_status',
  'weaned_duration',
  
  // Grain feeding field
  'grazing_green_feed',
  
  // Growth implant fields
  'growth_implant',
  'growth_implant_type',
  
  // Breed details
  'breed',
  
  // Estimated weight
  'estimated_average_weight',
  
  // Weighing location (redundant with loading points)
  'weighing_location',
];

// Advanced fields that may be shown in future releases
const ADVANCED_FIELDS = [
  ...HIDDEN_FIELDS_INITIAL_LAUNCH,
  'number_of_heifers', // May be considered advanced
];

export class FieldVisibilityController {
  private context: FormContext;

  constructor(context: FormContext = {}) {
    this.context = {
      isInitialLaunch: true, // Default to initial launch mode
      ...context,
    };
  }

  /**
   * Check if a specific field should be visible
   */
  isFieldVisible(fieldName: string, section?: FormSection): boolean {
    // For initial launch, hide advanced fields
    if (this.context.isInitialLaunch) {
      return !HIDDEN_FIELDS_INITIAL_LAUNCH.includes(fieldName);
    }

    // Check feature flags if available
    if (this.context.featureFlags) {
      const flagKey = `show_${fieldName}`;
      if (this.context.featureFlags.hasOwnProperty(flagKey)) {
        return this.context.featureFlags[flagKey];
      }
    }

    // Default to showing all fields if not in initial launch mode
    return true;
  }

  /**
   * Get all visible fields for a specific section
   */
  getVisibleFields(section: FormSection): string[] {
    const allFields = this.getAllFieldsForSection(section);
    return allFields.filter(field => this.isFieldVisible(field, section));
  }

  /**
   * Check if advanced fields should be shown
   */
  showAdvancedFields(): boolean {
    return !this.context.isInitialLaunch;
  }

  /**
   * Hide advanced fields (set to initial launch mode)
   */
  hideAdvancedFields(): void {
    this.context.isInitialLaunch = true;
  }

  /**
   * Show advanced fields (disable initial launch mode)
   */
  enableAdvancedFields(): void {
    this.context.isInitialLaunch = false;
  }

  /**
   * Update the context
   */
  updateContext(newContext: Partial<FormContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Get all fields for a specific section
   * This helps with organizing field visibility by section
   */
  private getAllFieldsForSection(section: FormSection): string[] {
    switch (section) {
      case FormSection.LIVESTOCK_DETAILS:
        return [
          'livestock_type',
          'bred_or_bought',
          'location',
          'weighing_location', // Hidden for initial launch
          'breed', // Hidden for initial launch
          'estimated_average_weight', // Hidden for initial launch
          'total_livestock_offered',
          'number_of_heifers',
          'males_castrated',
          'mothers_status', // Hidden for initial launch
          'weaned_duration', // Hidden for initial launch
          'grazing_green_feed', // Hidden for initial launch
          'growth_implant', // Hidden for initial launch
          'growth_implant_type', // Hidden for initial launch
        ];
      case FormSection.BIOSECURITY:
        return [
          'breeder_name',
          'is_breeder_seller',
          'farm_birth_address',
          'is_loading_at_birth_farm',
          'farm_loading_address',
          'livestock_moved_out_of_boundaries',
          'livestock_moved_location',
          'livestock_moved_location_to',
          'livestock_moved_year',
          'livestock_moved_month',
        ];
      // Add other sections as needed
      default:
        return [];
    }
  }

  /**
   * Get hidden fields for debugging/admin purposes
   */
  getHiddenFields(): string[] {
    if (this.context.isInitialLaunch) {
      return HIDDEN_FIELDS_INITIAL_LAUNCH;
    }
    return [];
  }

  /**
   * Check if a field is considered advanced
   */
  isAdvancedField(fieldName: string): boolean {
    return ADVANCED_FIELDS.includes(fieldName);
  }
}

// Default instance for initial launch
export const defaultFieldVisibility = new FieldVisibilityController({
  isInitialLaunch: true,
});

// Helper function to create field visibility controller
export const createFieldVisibilityController = (context?: FormContext) => {
  return new FieldVisibilityController(context);
};