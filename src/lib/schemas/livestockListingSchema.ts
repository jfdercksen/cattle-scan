import * as z from 'zod';

export const livestockListingSchema = z.object({
  invitation_id: z.string().optional(),
  reference_id: z.string().optional(),
  owner_name: z.string().min(1, 'Owner name is required'),
  livestock_type: z.enum(['CATTLE AND SHEEP', 'CATTLE', 'SHEEP']).optional(),
  bred_or_bought: z.enum(['BRED', 'BOUGHT IN']).optional(),
  location: z.string().optional(), // Now handled by loading_points
  // Weighing location - Made optional for initial launch (redundant with loading points)
  weighing_location: z.string().optional(),

  total_livestock_offered: z.number().min(0).default(0),
  number_of_heifers: z.number().min(0).default(0),
  males_castrated: z.boolean().default(false),
  mothers_status: z.enum(['WITH MOTHERS', 'ALREADY WEANED']).optional(),
  weaned_duration: z.string().optional(),
  grazing_green_feed: z.boolean().default(false),
  growth_implant: z.boolean().default(false),
  growth_implant_type: z.string().optional(),
  // Estimated weight - Made optional for initial launch
  estimated_average_weight: z.number().min(0).optional(),
  // Breed - Made optional for initial launch
  breed: z.string().optional(),
  additional_r25_per_calf: z.boolean().optional(),
  // Additional R25 per head (based on GLN)
  additional_r25_per_head: z.boolean().optional(),
  gln_num: z.string().optional(),
  gln_document_url: z.string().url('GLN document must be a valid URL').optional().nullable(),
  affidavit_required: z.boolean().optional(),
  affidavit_file_path: z.string().nullable().optional(),
  affidavit_file: z.any().optional(),
  
  // New biosecurity fields
  breeder_name: z.string().optional(),
  is_breeder_seller: z.boolean().default(false),
  farm_birth_address: z.object({
    farm_name: z.string(),
    district: z.string(),
    province: z.string(),
    country: z.string().optional(),
  }).optional(), // Now handled by loading_points
  is_loading_at_birth_farm: z.boolean().default(true),
  farm_loading_address: z.object({
    farm_name: z.string(),
    district: z.string(),
    province: z.string(),
    country: z.string().optional(),
  }).optional(),
  livestock_moved_out_of_boundaries: z.boolean().default(false),
  livestock_moved_location: z.object({
    farm_name: z.string(),
    district: z.string(),
    province: z.string(),
    country: z.string().optional(),
  }).optional(),
  livestock_moved_location_to: z.object({
    farm_name: z.string(),
    district: z.string(),
    province: z.string(),
    country: z.string().optional(),
  }).optional(),
  livestock_moved_year: z.coerce.number().optional(),
  livestock_moved_month: z.coerce.number().optional(),
  
  // Responsible person declarations
  declaration_no_cloven_hooved_animals: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_livestock_kept_away: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  // New declarations (UI added; DB columns to be added later)
  declaration_no_contact_with_non_resident_livestock: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_animal_origin_feed: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_veterinary_products_registered: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_foot_mouth_disease: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_never_vaccinated_against_fmd: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_foot_mouth_disease_farm: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_rift_valley_fever_10km_12_months: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_livestock_south_africa: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_gene_editing: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  // declaration_not_fed_antibiotics: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  // declaration_no_beta_agonists: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  // declaration_no_hormonal_growth_promotants: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  // declaration_signed_by_seller: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  
  // Livestock loading details
  number_cattle_loaded: z.number().min(0).default(0),
  number_sheep_loaded: z.number().min(0).default(0),
  truck_registration_number: z.string().optional(), // Now captured by Load Master during loading process
  
  // Signature validation
  signature_data: z.string().min(1, 'Digital signature is required'),
  signed_location: z.string().min(1, 'Signed location is required'),

  // Enhanced Loading Points with three addresses
  loading_points: z.array(z.object({
    birth_address: z.object({
      farm_name: z.string().min(1, 'Farm name is required'),
      district: z.string().min(1, 'District is required'),
      province: z.string().min(1, 'Province is required'),
      country: z.string().default(''),
    }),
    current_address: z.object({
      farm_name: z.string().default(''),
      district: z.string().default(''),
      province: z.string().default(''),
      country: z.string().default(''),
    }),
    loading_address: z.object({
      farm_name: z.string().default(''),
      district: z.string().default(''),
      province: z.string().default(''),
      country: z.string().default(''),
    }),
    is_current_same_as_birth: z.boolean().default(false),
    is_loading_same_as_current: z.boolean().default(false),
    // Per-herd livestock details (moved from LivestockDetailsSection)
    details: z.object({
      livestock_type: z.enum(['CATTLE', 'SHEEP']).optional(),
      bred_or_bought: z.enum(['BRED', 'BOUGHT IN']).optional(),
      breed: z.string().optional(),
      number_of_males: z.number().min(0).default(0),
      number_of_females: z.number().min(0).default(0),
      males_castrated: z.boolean().default(false),
      previous_owner_declaration_url: z.string().url('Declaration upload must be a valid URL').optional().nullable(),
      previous_owner_declaration_name: z.string().optional().nullable(),
    }).optional(),

    // Per-herd biosecurity details (moved from BiosecuritySection)
    biosecurity: z.object({
      is_breeder_seller: z.boolean().default(true),
      breeder_name: z.string().optional(),
      livestock_moved_out_of_boundaries: z.boolean().default(false),
      livestock_moved_location: z.object({
        farm_name: z.string(),
        district: z.string(),
        province: z.string(),
        country: z.string().optional(),
      }).optional(),
      livestock_moved_location_to: z.object({
        farm_name: z.string(),
        district: z.string(),
        province: z.string(),
        country: z.string().optional(),
      }).optional(),
      livestock_moved_how: z.enum(['Transport Contractor', 'Own Truck', 'On Foot']).optional(),
      livestock_moved_year: z.coerce.number().optional(),
      livestock_moved_month: z.coerce.number().optional(),
    }).optional(),
  })).min(1, "At least one loading point is required"),

  // Vet selection
  assigned_vet_id: z.string().optional(),
  invited_vet_email: z.union([z.literal(''), z.string().email({ message: "Invalid email address" })]).optional()
}).superRefine((data, ctx) => {
  // Vet selection validation
  if (!data.assigned_vet_id && !data.invited_vet_email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'You must either select a vet or invite a new one.',
      path: ['assigned_vet_id'],
    });
  }
  if (data.assigned_vet_id && data.invited_vet_email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'You cannot both select an existing vet and invite a new one.',
      path: ['assigned_vet_id'],
    });
  }

  // Affidavit validation
  if (data.additional_r25_per_calf && !data.affidavit_file && !data.affidavit_file_path) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'An affidavit is required for the additional payment.',
      path: ['affidavit_file'],
    });
  }

  // GLN validation: when additional R25 per head is selected, require GLN number
  if (data.additional_r25_per_head) {
    if (!data.gln_num || data.gln_num.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'GLN number is required to qualify for the additional R25 per head.',
        path: ['gln_num'],
      });
    }
    if (!data.gln_document_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'GLN registration document is required when applying for the additional R25 per head.',
        path: ['gln_document_url'],
      });
    }
  }

  // Enhanced loading points validation
  data.loading_points?.forEach((loadingPoint, index) => {
    const herdDetails = loadingPoint.details;

    // Validate current address if not same as birth
    if (!loadingPoint.is_current_same_as_birth) {
      if (!loadingPoint.current_address?.farm_name) {
        ctx.addIssue({ 
          path: [`loading_points.${index}.current_address.farm_name`], 
          message: 'Farm name is required for current address', 
          code: 'custom' 
        });
      }
      if (!loadingPoint.current_address?.district) {
        ctx.addIssue({ 
          path: [`loading_points.${index}.current_address.district`], 
          message: 'District is required for current address', 
          code: 'custom' 
        });
      }
      if (!loadingPoint.current_address?.province) {
        ctx.addIssue({ 
          path: [`loading_points.${index}.current_address.province`], 
          message: 'Province is required for current address', 
          code: 'custom' 
        });
      }
    }

    // Validate loading address if not same as current
    if (!loadingPoint.is_loading_same_as_current) {
      if (!loadingPoint.loading_address?.farm_name) {
        ctx.addIssue({ 
          path: [`loading_points.${index}.loading_address.farm_name`], 
          message: 'Farm name is required for loading address', 
          code: 'custom' 
        });
      }
      if (!loadingPoint.loading_address?.district) {
        ctx.addIssue({ 
          path: [`loading_points.${index}.loading_address.district`], 
          message: 'District is required for loading address', 
          code: 'custom' 
        });
      }
      if (!loadingPoint.loading_address?.province) {
        ctx.addIssue({ 
          path: [`loading_points.${index}.loading_address.province`], 
          message: 'Province is required for loading address', 
          code: 'custom' 
        });
      }
    }

    if (herdDetails?.bred_or_bought === 'BOUGHT IN') {
      if (!herdDetails.previous_owner_declaration_url) {
        ctx.addIssue({
          path: [`loading_points.${index}.details.previous_owner_declaration_url`],
          message: 'Declaration from previous owner is required when livestock is bought in.',
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

  // Conditional validation for livestock_moved_location: only enforce when any related field is provided
  if (
    data.livestock_moved_out_of_boundaries &&
    (data.livestock_moved_location ||
      data.livestock_moved_location_to ||
      data.livestock_moved_year !== undefined ||
      data.livestock_moved_month !== undefined)
  ) {
    if (!data.livestock_moved_location?.farm_name) {
      ctx.addIssue({ path: ['livestock_moved_location.farm_name'], message: 'Farm name is required', code: 'custom' });
    }
    if (!data.livestock_moved_location?.district) {
      ctx.addIssue({ path: ['livestock_moved_location.district'], message: 'District is required', code: 'custom' });
    }
    if (!data.livestock_moved_location?.province) {
      ctx.addIssue({ path: ['livestock_moved_location.province'], message: 'Province is required', code: 'custom' });
    }
    if (!data.livestock_moved_location_to?.farm_name) {
      ctx.addIssue({ path: ['livestock_moved_location_to.farm_name'], message: 'Farm name is required', code: 'custom' });
    }
    if (!data.livestock_moved_location_to?.district) {
      ctx.addIssue({ path: ['livestock_moved_location_to.district'], message: 'District is required', code: 'custom' });
    }
    if (!data.livestock_moved_location_to?.province) {
      ctx.addIssue({ path: ['livestock_moved_location_to.province'], message: 'Province is required', code: 'custom' });
    }
    if (data.livestock_moved_year === undefined || data.livestock_moved_year === null || Number.isNaN(data.livestock_moved_year)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Year when livestock was moved is required.',
        path: ['livestock_moved_year'],
      });
    }
    if (data.livestock_moved_month === undefined || data.livestock_moved_month === null || Number.isNaN(data.livestock_moved_month)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Month when livestock was moved is required.',
        path: ['livestock_moved_month'],
      });
    }
  }
});

export type LivestockListingFormData = z.infer<typeof livestockListingSchema>;
