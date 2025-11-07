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
import { useTranslation } from '@/i18n/useTranslation';

export const DeclarationsSection = ({ companyName }: { companyName?: string }) => {
  const form = useFormContext<LivestockListingFormData>();
  const { profile } = useAuth();
  const { t } = useTranslation();

  const renderDeclaration = (field: keyof LivestockListingFormData, label: string) => (
    <div className="flex items-center justify-between py-2 border-b">
      <Label htmlFor={field as string} className="text-sm leading-5 flex-1 pr-4">
        {label}
      </Label>
      <YesNoSwitch
        value={!!form.watch(field)}
        onChange={(checked) => form.setValue(field, checked, { shouldValidate: true, shouldDirty: true })}
        trueLabel={t('declarationsSection', 'switchTrueLabel')}
        falseLabel={t('declarationsSection', 'switchFalseLabel')}
      />
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('declarationsSection', 'heading')}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {t('declarationsSection', 'intro').replace(
          '{name}',
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
        )}
      </p>
      <div className="space-y-2">
          {renderDeclaration(
            "declaration_no_cloven_hooved_animals",
            t('declarationsSection', 'declarationNoClovenHoovedAnimals').replace(
              '{company}',
              companyName || t('declarationsSection', 'defaultCompanyName')
            )
          )}
          {renderDeclaration(
            "declaration_livestock_kept_away",
            t('declarationsSection', 'declarationLivestockKeptAway').replace(
              '{company}',
              companyName || t('declarationsSection', 'defaultCompanyName')
            )
          )}
          {renderDeclaration(
            "declaration_no_contact_with_non_resident_livestock",
            t('declarationsSection', 'declarationNoContactWithNonResidentLivestock').replace(
              '{company}',
              companyName || t('declarationsSection', 'defaultCompanyName')
            )
          )}
          {renderDeclaration(
            "declaration_no_animal_origin_feed",
            t('declarationsSection', 'declarationNoAnimalOriginFeed').replace(
              '{company}',
              companyName || t('declarationsSection', 'defaultCompanyName')
            )
          )}
          {renderDeclaration(
            "declaration_veterinary_products_registered",
            t('declarationsSection', 'declarationVeterinaryProductsRegistered')
          )}
          {renderDeclaration(
            "declaration_no_foot_mouth_disease",
            t('declarationsSection', 'declarationNoFootMouthDisease')
          )}
          {renderDeclaration(
            "declaration_no_foot_mouth_disease_farm",
            t('declarationsSection', 'declarationNoFootMouthDiseaseFarm')
          )}
          {renderDeclaration(
            "declaration_no_rift_valley_fever_10km_12_months",
            t('declarationsSection', 'declarationNoRiftValleyFever')
          )}
          {renderDeclaration(
            "declaration_livestock_south_africa",
            t('declarationsSection', 'declarationLivestockSouthAfrica').replace(
              '{company}',
              companyName || t('declarationsSection', 'defaultCompanyName')
            )
          )}
          {renderDeclaration(
            "declaration_never_vaccinated_against_fmd",
            t('declarationsSection', 'declarationNeverVaccinatedAgainstFmd')
          )}
          {renderDeclaration(
            "declaration_no_gene_editing",
            t('declarationsSection', 'declarationNoGeneEditing')
          )}
        </div>
    </div>
  );
};


