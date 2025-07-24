import { useFormContext } from 'react-hook-form';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { HerdLocation, FarmAddress, LocationCopyOptions } from '@/types/location';

export class LivestockLocationManager {
  private form: any;

  constructor(form: any) {
    this.form = form;
  }

  /**
   * Add a new herd with default empty addresses
   */
  addHerd(): void {
    const currentHerds = this.form.getValues('loading_points') || [];
    const newHerd: HerdLocation = {
      birth_address: {
        farm_name: '',
        district: '',
        province: '',
      },
      current_address: {
        farm_name: '',
        district: '',
        province: '',
      },
      loading_address: {
        farm_name: '',
        district: '',
        province: '',
      },
      is_current_same_as_birth: false,
      is_loading_same_as_current: false,
      number_of_cattle: 0,
      number_of_sheep: 0,
    };

    this.form.setValue('loading_points', [...currentHerds, newHerd]);
  }

  /**
   * Update a specific herd's location data
   */
  updateHerdLocation(herdIndex: number, locationData: Partial<HerdLocation>): void {
    const currentHerds = this.form.getValues('loading_points') || [];
    if (herdIndex >= 0 && herdIndex < currentHerds.length) {
      const updatedHerd = { ...currentHerds[herdIndex], ...locationData };
      currentHerds[herdIndex] = updatedHerd;
      this.form.setValue('loading_points', currentHerds);
    }
  }

  /**
   * Copy location data within a herd or from another herd
   */
  copyLocationData(targetHerdIndex: number, copyOption: LocationCopyOptions, sourceHerdIndex?: number): void {
    const currentHerds = this.form.getValues('loading_points') || [];
    
    if (targetHerdIndex < 0 || targetHerdIndex >= currentHerds.length) {
      return;
    }

    const targetHerd = currentHerds[targetHerdIndex];

    switch (copyOption) {
      case 'birth_to_current':
        this.copyAddress(targetHerdIndex, 'birth_address', 'current_address');
        this.form.setValue(`loading_points.${targetHerdIndex}.is_current_same_as_birth`, true);
        break;

      case 'current_to_loading':
        this.copyAddress(targetHerdIndex, 'current_address', 'loading_address');
        this.form.setValue(`loading_points.${targetHerdIndex}.is_loading_same_as_current`, true);
        break;

      case 'birth_to_loading':
        this.copyAddress(targetHerdIndex, 'birth_address', 'loading_address');
        break;

      case 'from_herd':
        // Copy from another herd (sourceHerdIndex must be provided)
        if (sourceHerdIndex !== undefined && sourceHerdIndex >= 0 && sourceHerdIndex < currentHerds.length) {
          this.copyFromHerd(sourceHerdIndex, targetHerdIndex);
        }
        break;

      default:
        break;
    }
  }

  /**
   * Copy address from one field to another within the same herd
   */
  private copyAddress(herdIndex: number, sourceField: keyof HerdLocation, targetField: keyof HerdLocation): void {
    const sourceAddress = this.form.getValues(`loading_points.${herdIndex}.${sourceField}`) as FarmAddress;
    
    if (sourceAddress) {
      this.form.setValue(`loading_points.${herdIndex}.${targetField}.farm_name`, sourceAddress.farm_name);
      this.form.setValue(`loading_points.${herdIndex}.${targetField}.district`, sourceAddress.district);
      this.form.setValue(`loading_points.${herdIndex}.${targetField}.province`, sourceAddress.province);

    }
  }

  /**
   * Copy all location data from one herd to another
   */
  private copyFromHerd(sourceHerdIndex: number, targetHerdIndex: number): void {
    const sourceHerd = this.form.getValues(`loading_points.${sourceHerdIndex}`) as HerdLocation;
    
    if (sourceHerd) {
      // Copy birth address
      this.form.setValue(`loading_points.${targetHerdIndex}.birth_address`, { ...sourceHerd.birth_address });
      
      // Copy current address
      this.form.setValue(`loading_points.${targetHerdIndex}.current_address`, { ...sourceHerd.current_address });
      
      // Copy loading address
      this.form.setValue(`loading_points.${targetHerdIndex}.loading_address`, { ...sourceHerd.loading_address });
      
      // Copy same-as flags
      this.form.setValue(`loading_points.${targetHerdIndex}.is_current_same_as_birth`, sourceHerd.is_current_same_as_birth);
      this.form.setValue(`loading_points.${targetHerdIndex}.is_loading_same_as_current`, sourceHerd.is_loading_same_as_current);
    }
  }

  /**
   * Remove a herd by index
   */
  removeHerd(herdIndex: number): void {
    const currentHerds = this.form.getValues('loading_points') || [];
    if (herdIndex >= 0 && herdIndex < currentHerds.length && currentHerds.length > 1) {
      const updatedHerds = currentHerds.filter((_, index) => index !== herdIndex);
      this.form.setValue('loading_points', updatedHerds);
    }
  }

  /**
   * Get the total number of herds
   */
  getHerdCount(): number {
    const herds = this.form.getValues('loading_points') || [];
    return herds.length;
  }

  /**
   * Validate that all required fields are filled for a herd
   */
  validateHerd(herdIndex: number): boolean {
    const herd = this.form.getValues(`loading_points.${herdIndex}`) as HerdLocation;
    
    if (!herd) return false;

    // Check birth address
    if (!herd.birth_address.farm_name || !herd.birth_address.district || !herd.birth_address.province) {
      return false;
    }

    // Check current address (unless same as birth)
    if (!herd.is_current_same_as_birth) {
      if (!herd.current_address.farm_name || !herd.current_address.district || !herd.current_address.province) {
        return false;
      }
    }

    // Check loading address (unless same as current)
    if (!herd.is_loading_same_as_current) {
      if (!herd.loading_address.farm_name || !herd.loading_address.district || !herd.loading_address.province) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Hook to use the LivestockLocationManager
 */
export const useLivestockLocationManager = () => {
  const form = useFormContext<LivestockListingFormData>();
  return new LivestockLocationManager(form);
};