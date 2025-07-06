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
  cattle_visually_inspected: z.boolean().default(false),
  cattle_mouthed: z.boolean().default(false),
  sheep_visually_inspected: z.boolean().default(false),
  sheep_mouthed: z.boolean().default(false),
  foot_and_mouth_symptoms: z.boolean().default(false),
  lumpy_skin_disease_symptoms: z.boolean().default(false),
  foot_and_mouth_case_in_10km: z.boolean().default(false),
  rift_valley_fever_case_in_10km: z.boolean().default(false),
});

export type VeterinaryDeclarationFormData = z.infer<typeof veterinaryDeclarationSchema>;
