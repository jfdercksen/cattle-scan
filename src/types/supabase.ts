export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      approval_actions: {
        Row: {
          action: Database["public"]["Enums"]["user_status"]
          action_by: string
          created_at: string
          id: string
          profile_id: string
          reason: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["user_status"]
          action_by: string
          created_at?: string
          id?: string
          profile_id: string
          reason?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["user_status"]
          action_by?: string
          created_at?: string
          id?: string
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_actions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      farms: {
        Row: {
          address: string
          biosecurity_status: Json | null
          city: string
          coordinates: unknown | null
          created_at: string
          id: string
          name: string
          owner_id: string
          postal_code: string | null
          province: string
          registration_number: string | null
          updated_at: string
        }
        Insert: {
          address: string
          biosecurity_status?: Json | null
          city: string
          coordinates?: unknown | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          postal_code?: string | null
          province: string
          registration_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          biosecurity_status?: Json | null
          city?: string
          coordinates?: unknown | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          postal_code?: string | null
          province?: string
          registration_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      listing_invitations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          listing_id: string | null
          reference_id: string
          seller_email: string | null
          seller_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          listing_id?: string | null
          reference_id: string
          seller_email?: string | null
          seller_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          listing_id?: string | null
          reference_id?: string
          seller_email?: string | null
          seller_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_invitations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "livestock_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock_listings: {
        Row: {
          additional_r25_per_calf: boolean | null
          affidavit_file_path: string | null
          affidavit_required: boolean | null
          assigned_vet_id: string | null
          bred_or_bought: string
          breed: string
          breeder_name: string | null
          created_at: string
          declaration_livestock_kept_away: boolean | null
          declaration_livestock_south_africa: boolean | null
          declaration_no_animal_origin_feed: boolean | null
          declaration_no_cloven_hooved_animals: boolean | null
          declaration_no_foot_mouth_disease: boolean | null
          declaration_no_foot_mouth_disease_farm: boolean | null
          declaration_no_gene_editing: boolean | null
          declaration_veterinary_products_registered: boolean | null
          estimated_average_weight: number | null
          farm_birth_address: string | null
          farm_loading_address: string | null
          grazing_green_feed: boolean | null
          growth_implant: boolean | null
          growth_implant_type: string | null
          id: string
          invitation_id: string | null
          invited_vet_email: string | null
          is_breeder_seller: boolean | null
          livestock_moved_location: string | null
          livestock_moved_location_to: string | null
          livestock_moved_month: number | null
          livestock_moved_out_of_boundaries: boolean | null
          livestock_moved_year: number | null
          livestock_type: string | null
          loading_points: Json | null
          location: string
          males_castrated: boolean | null
          mothers_status: string | null
          number_cattle_loaded: number | null
          number_of_heifers: number | null
          number_sheep_loaded: number | null
          owner_name: string
          profile_id: string | null
          reference_id: string | null
          responsible_person_designation: string | null
          responsible_person_name: string | null
          seller_id: string
          signature_data: string | null
          signature_date: string | null
          signed_location: string | null
          status: string
          total_livestock_offered: number
          truck_registration_number: string | null
          updated_at: string
          weaned_duration: string | null
          weighing_location: string
        }
        Insert: {
          additional_r25_per_calf?: boolean | null
          affidavit_file_path?: string | null
          affidavit_required?: boolean | null
          assigned_vet_id?: string | null
          bred_or_bought: string
          breed: string
          breeder_name?: string | null
          created_at?: string
          declaration_livestock_kept_away?: boolean | null
          declaration_livestock_south_africa?: boolean | null
          declaration_no_animal_origin_feed?: boolean | null
          declaration_no_cloven_hooved_animals?: boolean | null
          declaration_no_foot_mouth_disease?: boolean | null
          declaration_no_foot_mouth_disease_farm?: boolean | null
          declaration_no_gene_editing?: boolean | null
          declaration_veterinary_products_registered?: boolean | null
          estimated_average_weight?: number | null
          farm_birth_address?: string | null
          farm_loading_address?: string | null
          grazing_green_feed?: boolean | null
          growth_implant?: boolean | null
          growth_implant_type?: string | null
          id?: string
          invitation_id?: string | null
          invited_vet_email?: string | null
          is_breeder_seller?: boolean | null
          livestock_moved_location?: string | null
          livestock_moved_location_to?: string | null
          livestock_moved_month?: number | null
          livestock_moved_out_of_boundaries?: boolean | null
          livestock_moved_year?: number | null
          livestock_type?: string | null
          loading_points?: Json | null
          location: string
          males_castrated?: boolean | null
          mothers_status?: string | null
          number_cattle_loaded?: number | null
          number_of_heifers?: number | null
          number_sheep_loaded?: number | null
          owner_name: string
          profile_id?: string | null
          reference_id?: string | null
          responsible_person_designation?: string | null
          responsible_person_name?: string | null
          seller_id: string
          signature_data?: string | null
          signature_date?: string | null
          signed_location?: string | null
          status?: string
          total_livestock_offered: number
          truck_registration_number?: string | null
          updated_at?: string
          weaned_duration?: string | null
          weighing_location: string
        }
        Update: {
          additional_r25_per_calf?: boolean | null
          affidavit_file_path?: string | null
          affidavit_required?: boolean | null
          assigned_vet_id?: string | null
          bred_or_bought?: string
          breed?: string
          breeder_name?: string | null
          created_at?: string
          declaration_livestock_kept_away?: boolean | null
          declaration_livestock_south_africa?: boolean | null
          declaration_no_animal_origin_feed?: boolean | null
          declaration_no_cloven_hooved_animals?: boolean | null
          declaration_no_foot_mouth_disease?: boolean | null
          declaration_no_foot_mouth_disease_farm?: boolean | null
          declaration_no_gene_editing?: boolean | null
          declaration_veterinary_products_registered?: boolean | null
          estimated_average_weight?: number | null
          farm_birth_address?: string | null
          farm_loading_address?: string | null
          grazing_green_feed?: boolean | null
          growth_implant?: boolean | null
          growth_implant_type?: string | null
          id?: string
          invitation_id?: string | null
          invited_vet_email?: string | null
          is_breeder_seller?: boolean | null
          livestock_moved_location?: string | null
          livestock_moved_location_to?: string | null
          livestock_moved_month?: number | null
          livestock_moved_out_of_boundaries?: boolean | null
          livestock_moved_year?: number | null
          livestock_type?: string | null
          loading_points?: Json | null
          location?: string
          males_castrated?: boolean | null
          mothers_status?: string | null
          number_cattle_loaded?: number | null
          number_of_heifers?: number | null
          number_sheep_loaded?: number | null
          owner_name?: string
          profile_id?: string | null
          reference_id?: string | null
          responsible_person_designation?: string | null
          responsible_person_name?: string | null
          seller_id?: string
          signature_data?: string | null
          signature_date?: string | null
          signed_location?: string | null
          status?: string
          total_livestock_offered?: number
          truck_registration_number?: string | null
          updated_at?: string
          weaned_duration?: string | null
          weighing_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestock_listings_assigned_vet_id_fkey"
            columns: ["assigned_vet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_listings_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "detailed_listing_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_listings_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "listing_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_listings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock_offers: {
        Row: {
          additional_r25_per_calf: boolean | null
          affidavit_required: boolean | null
          and_from: number
          chalmar_beef_offer: number
          created_at: string
          created_by: string
          id: string
          listing_id: string
          offer_valid_until_date: string
          offer_valid_until_time: string
          penilazation_for_additional_heifers: number
          penilazation_of: number
          percent_heifers_allowed: number
          seller_notes: string | null
          seller_response_date: string | null
          status: string
          then_penilazation_of: number
          to_weight: number
          updated_at: string
        }
        Insert: {
          additional_r25_per_calf?: boolean | null
          affidavit_required?: boolean | null
          and_from: number
          chalmar_beef_offer: number
          created_at?: string
          created_by: string
          id?: string
          listing_id: string
          offer_valid_until_date: string
          offer_valid_until_time: string
          penilazation_for_additional_heifers: number
          penilazation_of: number
          percent_heifers_allowed: number
          seller_notes?: string | null
          seller_response_date?: string | null
          status?: string
          then_penilazation_of: number
          to_weight: number
          updated_at?: string
        }
        Update: {
          additional_r25_per_calf?: boolean | null
          affidavit_required?: boolean | null
          and_from?: number
          chalmar_beef_offer?: number
          created_at?: string
          created_by?: string
          id?: string
          listing_id?: string
          offer_valid_until_date?: string
          offer_valid_until_time?: string
          penilazation_for_additional_heifers?: number
          penilazation_of?: number
          percent_heifers_allowed?: number
          seller_notes?: string | null
          seller_response_date?: string | null
          status?: string
          then_penilazation_of?: number
          to_weight?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestock_offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "livestock_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          agent_agency_represented: string | null
          apac_registration_url: string | null
          appointment_letter_url: string | null
          approved_at: string | null
          approved_by: string | null
          brand_mark_url: string | null
          city: string | null
          company_name: string | null
          created_at: string
          declaration_livestock_kept_away: boolean | null
          declaration_livestock_south_africa: boolean | null
          declaration_no_animal_origin_feed: boolean | null
          declaration_no_cloven_hooved_animals: boolean | null
          declaration_no_foot_mouth_disease: boolean | null
          declaration_no_foot_mouth_disease_farm: boolean | null
          declaration_no_gene_editing: boolean | null
          declaration_responsible_person_definition: boolean | null
          declaration_veterinary_products_registered: boolean | null
          email: string
          first_name: string | null
          id: string
          id_document_url: string | null
          language_preference: Database["public"]["Enums"]["language_preference"]
          last_name: string | null
          phone: string | null
          postal_code: string | null
          practice_letter_head_url: string | null
          profile_completed: boolean
          profile_completed_at: string | null
          province: string | null
          registration_number: string | null
          responsible_person_designation: string | null
          responsible_person_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          seller_entity_name: string | null
          seller_ownership_type: string | null
          seller_responsible_person_title: string | null
          signature_data: string | null
          signature_date: string | null
          signature_url: string | null
          signed_at: string | null
          signed_location: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          agent_agency_represented?: string | null
          apac_registration_url?: string | null
          appointment_letter_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_mark_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          declaration_livestock_kept_away?: boolean | null
          declaration_livestock_south_africa?: boolean | null
          declaration_no_animal_origin_feed?: boolean | null
          declaration_no_cloven_hooved_animals?: boolean | null
          declaration_no_foot_mouth_disease?: boolean | null
          declaration_no_foot_mouth_disease_farm?: boolean | null
          declaration_no_gene_editing?: boolean | null
          declaration_responsible_person_definition?: boolean | null
          declaration_veterinary_products_registered?: boolean | null
          email: string
          first_name?: string | null
          id: string
          id_document_url?: string | null
          language_preference?: Database["public"]["Enums"]["language_preference"]
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          practice_letter_head_url?: string | null
          profile_completed?: boolean
          profile_completed_at?: string | null
          province?: string | null
          registration_number?: string | null
          responsible_person_designation?: string | null
          responsible_person_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          seller_entity_name?: string | null
          seller_ownership_type?: string | null
          seller_responsible_person_title?: string | null
          signature_data?: string | null
          signature_date?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_location?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          agent_agency_represented?: string | null
          apac_registration_url?: string | null
          appointment_letter_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_mark_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          declaration_livestock_kept_away?: boolean | null
          declaration_livestock_south_africa?: boolean | null
          declaration_no_animal_origin_feed?: boolean | null
          declaration_no_cloven_hooved_animals?: boolean | null
          declaration_no_foot_mouth_disease?: boolean | null
          declaration_no_foot_mouth_disease_farm?: boolean | null
          declaration_no_gene_editing?: boolean | null
          declaration_responsible_person_definition?: boolean | null
          declaration_veterinary_products_registered?: boolean | null
          email?: string
          first_name?: string | null
          id?: string
          id_document_url?: string | null
          language_preference?: Database["public"]["Enums"]["language_preference"]
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          practice_letter_head_url?: string | null
          profile_completed?: boolean
          profile_completed_at?: string | null
          province?: string | null
          registration_number?: string | null
          responsible_person_designation?: string | null
          responsible_person_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          seller_entity_name?: string | null
          seller_ownership_type?: string | null
          seller_responsible_person_title?: string | null
          signature_data?: string | null
          signature_date?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_location?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      veterinary_declarations: {
        Row: {
          cattle_mouthed: boolean | null
          cattle_visually_inspected: boolean | null
          created_at: string
          farm_address: string | null
          farm_district: string | null
          farm_name: string | null
          farm_province: string | null
          foot_and_mouth_case_in_10km: boolean | null
          foot_and_mouth_symptoms: boolean | null
          id: number
          lumpy_skin_disease_symptoms: boolean | null
          owner_of_livestock: string | null
          reference_id: string
          rift_valley_fever_case_in_10km: boolean | null
          sheep_mouthed: boolean | null
          sheep_visually_inspected: boolean | null
          veterinarian_name: string | null
          veterinarian_registration_number: string | null
        }
        Insert: {
          cattle_mouthed?: boolean | null
          cattle_visually_inspected?: boolean | null
          created_at?: string
          farm_address?: string | null
          farm_district?: string | null
          farm_name?: string | null
          farm_province?: string | null
          foot_and_mouth_case_in_10km?: boolean | null
          foot_and_mouth_symptoms?: boolean | null
          id?: never
          lumpy_skin_disease_symptoms?: boolean | null
          owner_of_livestock?: string | null
          reference_id: string
          rift_valley_fever_case_in_10km?: boolean | null
          sheep_mouthed?: boolean | null
          sheep_visually_inspected?: boolean | null
          veterinarian_name?: string | null
          veterinarian_registration_number?: string | null
        }
        Update: {
          cattle_mouthed?: boolean | null
          cattle_visually_inspected?: boolean | null
          created_at?: string
          farm_address?: string | null
          farm_district?: string | null
          farm_name?: string | null
          farm_province?: string | null
          foot_and_mouth_case_in_10km?: boolean | null
          foot_and_mouth_symptoms?: boolean | null
          id?: never
          lumpy_skin_disease_symptoms?: boolean | null
          owner_of_livestock?: string | null
          reference_id?: string
          rift_valley_fever_case_in_10km?: boolean | null
          sheep_mouthed?: boolean | null
          sheep_visually_inspected?: boolean | null
          veterinarian_name?: string | null
          veterinarian_registration_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "veterinary_declarations_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "livestock_listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      detailed_listing_invitations: {
        Row: {
          company_name: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          listing_id: string | null
          reference_id: string | null
          seller_email: string | null
          seller_id: string | null
          seller_profile_email: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_invitations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "livestock_listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_current_user_status: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_status"]
      }
    }
    Enums: {
      language_preference: "en" | "af"
      user_role: "super_admin" | "admin" | "seller" | "vet" | "agent" | "driver" | "load_master"
      user_status: "pending" | "approved" | "rejected" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      language_preference: ["en", "af"],
      user_role: ["super_admin", "admin", "seller", "vet", "agent", "driver", "load_master"],
      user_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
