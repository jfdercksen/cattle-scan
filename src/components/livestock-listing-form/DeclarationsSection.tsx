import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { YesNoSwitch } from "@/components/ui/YesNoSwitch";
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth';

export const DeclarationsSection = () => {
  const form = useFormContext<LivestockListingFormData>();
  const { profile } = useAuth();

  const renderDeclaration = (field: keyof LivestockListingFormData, label: string) => (
    <div className="flex items-center justify-between py-2 border-b">
      <Label htmlFor={field as string} className="text-sm leading-5 flex-1 pr-4">
        {label}
      </Label>
      <YesNoSwitch
        value={!!form.watch(field)}
        onChange={(checked) => form.setValue(field, checked, { shouldValidate: true, shouldDirty: true })}
      />
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Responsible Person Declarations</h3>
      <p className="text-sm text-gray-600 mb-4">
        I, <strong className="font-semibold">{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}</strong>, the responsible person, hereby declare and affirm that:
      </p>
      <div className="space-y-2">
          {renderDeclaration("declaration_no_cloven_hooved_animals", "No cloven hooved animals (cattle, sheep, goats, pigs) other than those offered for sale have been on the farm for the past 21 days")}
          {renderDeclaration("declaration_livestock_kept_away", "The livestock offered for sale have been kept away from all other livestock for the past 21 days")}
          {renderDeclaration("declaration_no_animal_origin_feed", "No feed of animal origin has been fed to the livestock offered for sale")}
          {renderDeclaration("declaration_veterinary_products_registered", "All veterinary products used on the livestock offered for sale are registered")}
          {renderDeclaration("declaration_no_foot_mouth_disease", "No foot and mouth disease has occurred on the farm for the past 12 months")}
          {renderDeclaration("declaration_no_foot_mouth_disease_farm", "No foot and mouth disease has occurred on neighbouring farms for the past 3 months")}
          {renderDeclaration("declaration_livestock_south_africa", "The livestock offered for sale have been in South Africa for at least 21 days")}
          {renderDeclaration("declaration_no_gene_editing", "No gene editing technology has been used on the livestock offered for sale")}
        </div>
    </div>
  );
};
