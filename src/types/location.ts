// Enhanced location data models for livestock management

export interface FarmAddress {
  farm_name: string;
  district: string;
  province: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Per-herd livestock details (aligned with updated Zod schema)
export interface HerdDetails {
  livestock_type?: 'CATTLE' | 'SHEEP';
  bred_or_bought?: 'BRED' | 'BOUGHT IN';
  number_of_males: number;
  number_of_females: number;
  males_castrated: boolean;
}

// Per-herd biosecurity details (aligned with Zod schema)
export interface HerdBiosecurity {
  is_breeder_seller: boolean;
  breeder_name?: string;
  livestock_moved_out_of_boundaries: boolean;
  livestock_moved_location?: FarmAddress;
  livestock_moved_location_to?: FarmAddress;
  livestock_moved_year?: number;
  livestock_moved_month?: number;
}

export interface HerdLocation {
  birth_address: FarmAddress;
  current_address: FarmAddress;
  loading_address: FarmAddress;
  is_current_same_as_birth: boolean;
  is_loading_same_as_current: boolean;
  number_of_cattle: number;
  number_of_sheep: number;
  details?: HerdDetails;
  biosecurity?: HerdBiosecurity;
}

export interface MovementRecord {
  from_address: FarmAddress;
  to_address: FarmAddress;
  movement_date: {
    year: number;
    month: number;
  };
  reason?: string;
  livestock_count?: {
    cattle: number;
    sheep: number;
  };
}

export interface LivestockLocationData {
  herds: HerdLocation[];
  movement_history: MovementRecord[];
  livestock_moved_out_of_boundaries: boolean;
}

// Utility types for form management
export type LocationCopyOptions = 'birth_to_current' | 'current_to_loading' | 'birth_to_loading' | 'from_herd';

export interface LocationManagerState {
  herds: HerdLocation[];
  activeHerdIndex: number;
}