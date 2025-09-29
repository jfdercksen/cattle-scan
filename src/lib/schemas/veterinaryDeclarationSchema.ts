import { z } from 'zod';

export const veterinaryDeclarationSchema = z.object({
  reference_id: z.string(),
  veterinarian_name: z.string().min(1, 'Veterinarian name is required'),
  veterinarian_registration_number: z.string().min(1, 'Registration number is required'),
  owner_of_livestock: z.string(),
  farm_address: z.string(),
  farm_name: z.string().optional(),
  farm_district: z.string().optional(),
  farm_province: z.string().optional(),
  signed_location: z.string().optional(),
  cattle_visually_inspected: z.boolean().nullable().optional(),
  cattle_mouthed: z.boolean().nullable().optional(),
  sheep_visually_inspected: z.boolean().nullable().optional(),
  sheep_mouthed: z.boolean().nullable().optional(),
  foot_and_mouth_symptoms: z.boolean().nullable().optional(),
  lumpy_skin_disease_symptoms: z.boolean().nullable().optional(),
  foot_and_mouth_case_in_10km: z.boolean().nullable().optional(),
  rift_valley_fever_case_in_10km: z.boolean().nullable().optional(),
  // Hidden fields for livestock counts (used for conditional validation)
  number_cattle_loaded: z.number().optional(),
  number_sheep_loaded: z.number().optional(),
}).superRefine((data, ctx) => {
  // Only validate cattle fields if cattle are present
  const hasCattle = (data.number_cattle_loaded ?? 0) > 0;
  const hasSheep = (data.number_sheep_loaded ?? 0) > 0;

  // Cattle validation - only required if cattle are loaded
  if (hasCattle) {
    if (data.cattle_visually_inspected === null || data.cattle_visually_inspected === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select Yes or No for cattle visual inspection',
        path: ['cattle_visually_inspected'],
      });
    }
    if (data.cattle_mouthed === null || data.cattle_mouthed === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select Yes or No for cattle mouthing',
        path: ['cattle_mouthed'],
      });
    }
  }

  // Sheep validation - only required if sheep are loaded
  if (hasSheep) {
    if (data.sheep_visually_inspected === null || data.sheep_visually_inspected === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select Yes or No for sheep visual inspection',
        path: ['sheep_visually_inspected'],
      });
    }
    if (data.sheep_mouthed === null || data.sheep_mouthed === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select Yes or No for sheep mouthing',
        path: ['sheep_mouthed'],
      });
    }
  }

  // General disease questions are always required regardless of livestock type
  if (data.foot_and_mouth_symptoms === null || data.foot_and_mouth_symptoms === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select Yes or No for foot and mouth disease symptoms',
      path: ['foot_and_mouth_symptoms'],
    });
  }
  if (data.lumpy_skin_disease_symptoms === null || data.lumpy_skin_disease_symptoms === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select Yes or No for lumpy skin disease symptoms',
      path: ['lumpy_skin_disease_symptoms'],
    });
  }
  if (data.foot_and_mouth_case_in_10km === null || data.foot_and_mouth_case_in_10km === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select Yes or No for foot and mouth disease area declaration',
      path: ['foot_and_mouth_case_in_10km'],
    });
  }
  if (data.rift_valley_fever_case_in_10km === null || data.rift_valley_fever_case_in_10km === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select Yes or No for rift valley fever area declaration',
      path: ['rift_valley_fever_case_in_10km'],
    });
  }
});

export type VeterinaryDeclarationFormData = z.infer<typeof veterinaryDeclarationSchema>;
