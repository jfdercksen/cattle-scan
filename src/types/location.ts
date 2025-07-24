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

export interface HerdLocation {
  birth_address: FarmAddress;
  current_address: FarmAddress;
  loading_address: FarmAddress;
  is_current_same_as_birth: boolean;
  is_loading_same_as_current: boolean;
  number_of_cattle: number;
  number_of_sheep: number;
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