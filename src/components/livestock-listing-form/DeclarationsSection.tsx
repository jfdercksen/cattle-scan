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
          {renderDeclaration("declaration_no_cloven_hooved_animals", "No cloven hooved animals have been introduced onto the farm or gained access to the farm in the 30 days pre-ceding the loading of livestock to Chalmar Beef")}
          {renderDeclaration("declaration_livestock_kept_away", "All resident cloven hooved livestock were kept away from boundary camps in the 30 days pre-ceding the loading of livestock to Chalmar Beef")}
          {renderDeclaration("declaration_no_contact_with_non_resident_livestock", "Resident cloven hooved livestock were in no way in contact with non-resident cloven hooved animals in the 30 days pre-ceding the loading of livestock to Chalmar Beef.")}
          {renderDeclaration("declaration_no_animal_origin_feed", "No feed of animal origin (for instance chicken litter, bone meal, carcass meal, blood meal, etc.) has ever been fed to the livestock sold to Chalmar Beef.")}
          {renderDeclaration("declaration_veterinary_products_registered", "All veterinary products used on the farm are registered for use in South Africa and are used according to label directions")}
          {renderDeclaration("declaration_no_foot_mouth_disease", "There has never been a case of Foot and Mouth Disease on the farm")}
          {renderDeclaration("declaration_no_foot_mouth_disease_farm", "There has been no Foot and Mouth Disease case within a radius of 10 km around the farm in the past 12 months")}
          {renderDeclaration("declaration_no_rift_valley_fever_10km_12_months", "There has been no Rift Valley Fever case within a radius of 10 km around the farm in the past 12 months")}
          {renderDeclaration("declaration_livestock_south_africa", "The livestock sold to Chalmar Beef were all born in the Republic of South Africa")}
          {renderDeclaration("declaration_never_vaccinated_against_fmd", "The livestock on the farm have never been vaccinated against Foot and Mouth Disease")}
          {renderDeclaration("declaration_no_gene_editing", "No livestock on the farm has been subjected to gene editing, gene therapy or has been genetically modified by unnatural means")}
        </div>
    </div>
  );
};

