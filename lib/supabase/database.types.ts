/**
 * TypeScript types for Supabase Database
 * Auto-generated types based on database schema
 * Updated: 2025-10-26 (회원가입 요구사항 반영)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "admin"
  | "tenant_leader"
  | "tenant_manager"
  | "tenant_member"
  | "general";

export type OfficeType = "independent" | "fixed_desk" | "non_resident";

export type BookingStatus = "confirmed" | "cancelled";

export type TransactionType = "earned" | "spent" | "refunded" | "adjusted";

export type ProgramRegistrationStatus =
  | "registered"
  | "attended"
  | "cancelled"
  | "no_show";

// 새로운 타입 정의
export type UserType = "general" | "tenant";

export type BusinessType =
  | "corporation"      // 법인사업자
  | "individual"       // 개인사업자
  | "freelancer"       // 개인(프리랜서)
  | "nonprofit";       // 비영리/단체

export type JobType =
  | "development"      // 개발
  | "design"           // 디자인
  | "sales"            // 영업
  | "marketing"        // 마케팅
  | "branding"         // 브랜딩
  | "pr"               // 홍보
  | "production"       // 생산/제조
  | "planning"         // 기획
  | "operation"        // 운영
  | "education"        // 강의/교육
  | "research"         // 연구/리서치
  | "hr"               // 인사
  | "strategy";        // 전략/경영

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          birth_date: string | null;
          sns_url: string | null;
          profile_image_url: string | null;
          role: UserRole;
          office_type: OfficeType | null;
          office_number: string | null;
          organization_id: string | null;
          is_leader: boolean;
          is_manager: boolean;
          personal_points: number;
          team_points: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          // 새로 추가된 필드
          user_type: UserType;
          company_name: string | null;
          ceo_name: string | null;
          business_type: BusinessType | null;
          business_start_date: string | null;
          job_types: JobType[] | null;
          business_registration_url: string | null;
          business_account_url: string | null;
          company_logo_url: string | null;
          business_registration_number: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          birth_date?: string | null;
          sns_url?: string | null;
          profile_image_url?: string | null;
          role?: UserRole;
          office_type?: OfficeType | null;
          office_number?: string | null;
          organization_id?: string | null;
          is_leader?: boolean;
          is_manager?: boolean;
          personal_points?: number;
          team_points?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          // 새로 추가된 필드
          user_type?: UserType;
          company_name?: string | null;
          ceo_name?: string | null;
          business_type?: BusinessType | null;
          business_start_date?: string | null;
          job_types?: JobType[] | null;
          business_registration_url?: string | null;
          business_account_url?: string | null;
          company_logo_url?: string | null;
          business_registration_number?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          birth_date?: string | null;
          sns_url?: string | null;
          profile_image_url?: string | null;
          role?: UserRole;
          office_type?: OfficeType | null;
          office_number?: string | null;
          organization_id?: string | null;
          is_leader?: boolean;
          is_manager?: boolean;
          personal_points?: number;
          team_points?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          // 새로 추가된 필드
          user_type?: UserType;
          company_name?: string | null;
          ceo_name?: string | null;
          business_type?: BusinessType | null;
          business_start_date?: string | null;
          job_types?: JobType[] | null;
          business_registration_url?: string | null;
          business_account_url?: string | null;
          company_logo_url?: string | null;
          business_registration_number?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contracts: {
        Row: {
          id: string;
          company_id: string | null;
          company_name: string;
          space_type: "office" | "fixed_desk" | "flexible_desk" | "non_resident";
          room_number: string | null;
          base_capacity: number | null;
          max_capacity: number | null;
          current_capacity: number | null;
          contract_status: "active" | "pending" | "expired" | "terminated";
          contract_type: string | null;
          start_date: string;
          end_date: string | null;
          contract_duration: string | null;
          monthly_fee: number;
          management_fee: number;
          total_monthly_cost: number;
          deposit: number;
          non_resident_revenue: number | null;
          discount_rate: number | null;
          cms_enabled: boolean;
          auto_transfer_enabled: boolean;
          business_number: string | null;
          contact_person: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          additional_contacts: any;
          notes: string | null;
          special_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          company_name: string;
          space_type: "office" | "fixed_desk" | "flexible_desk" | "non_resident";
          room_number?: string | null;
          base_capacity?: number | null;
          max_capacity?: number | null;
          current_capacity?: number | null;
          contract_status?: "active" | "pending" | "expired" | "terminated";
          contract_type?: string | null;
          start_date: string;
          end_date?: string | null;
          contract_duration?: string | null;
          monthly_fee: number;
          management_fee: number;
          total_monthly_cost: number;
          deposit: number;
          non_resident_revenue?: number | null;
          discount_rate?: number | null;
          cms_enabled?: boolean;
          auto_transfer_enabled?: boolean;
          business_number?: string | null;
          contact_person?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          additional_contacts?: any;
          notes?: string | null;
          special_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          company_name?: string;
          space_type?: "office" | "fixed_desk" | "flexible_desk" | "non_resident";
          room_number?: string | null;
          base_capacity?: number | null;
          max_capacity?: number | null;
          current_capacity?: number | null;
          contract_status?: "active" | "pending" | "expired" | "terminated";
          contract_type?: string | null;
          start_date?: string;
          end_date?: string | null;
          contract_duration?: string | null;
          monthly_fee?: number;
          management_fee?: number;
          total_monthly_cost?: number;
          deposit?: number;
          non_resident_revenue?: number | null;
          discount_rate?: number | null;
          cms_enabled?: boolean;
          auto_transfer_enabled?: boolean;
          business_number?: string | null;
          contact_person?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          additional_contacts?: any;
          notes?: string | null;
          special_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meeting_rooms: {
        Row: {
          id: string;
          name: string;
          floor: number;
          capacity: number;
          description: string | null;
          amenities: string[] | null;
          image_url: string | null;
          points_per_30min: number;
          min_booking_duration: number;
          max_booking_duration: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          floor: number;
          capacity: number;
          description?: string | null;
          amenities?: string[] | null;
          image_url?: string | null;
          points_per_30min?: number;
          min_booking_duration?: number;
          max_booking_duration?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          floor?: number;
          capacity?: number;
          description?: string | null;
          amenities?: string[] | null;
          image_url?: string | null;
          points_per_30min?: number;
          min_booking_duration?: number;
          max_booking_duration?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_bookings: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          meeting_title: string;
          meeting_description: string | null;
          points_used: number;
          status: BookingStatus;
          created_at: string;
          updated_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          meeting_title: string;
          meeting_description?: string | null;
          points_used: number;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          meeting_title?: string;
          meeting_description?: string | null;
          points_used?: number;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "room_bookings_room_id_fkey";
            columns: ["room_id"];
            referencedRelation: "meeting_rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_bookings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      programs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          detailed_content: string | null;
          start_datetime: string;
          end_datetime: string;
          max_participants: number;
          current_participants: number;
          thumbnail_url: string | null;
          images: string[] | null;
          is_active: boolean;
          registration_deadline: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          detailed_content?: string | null;
          start_datetime: string;
          end_datetime: string;
          max_participants: number;
          current_participants?: number;
          thumbnail_url?: string | null;
          images?: string[] | null;
          is_active?: boolean;
          registration_deadline?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          detailed_content?: string | null;
          start_datetime?: string;
          end_datetime?: string;
          max_participants?: number;
          current_participants?: number;
          thumbnail_url?: string | null;
          images?: string[] | null;
          is_active?: boolean;
          registration_deadline?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      program_registrations: {
        Row: {
          id: string;
          program_id: string;
          user_id: string;
          status: ProgramRegistrationStatus;
          registered_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          program_id: string;
          user_id: string;
          status?: ProgramRegistrationStatus;
          registered_at?: string;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          program_id?: string;
          user_id?: string;
          status?: ProgramRegistrationStatus;
          registered_at?: string;
          cancelled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "program_registrations_program_id_fkey";
            columns: ["program_id"];
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "program_registrations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      point_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: TransactionType;
          amount: number;
          is_team_points: boolean;
          balance_after: number;
          reference_type: string | null;
          reference_id: string | null;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: TransactionType;
          amount: number;
          is_team_points?: boolean;
          balance_after: number;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_type?: TransactionType;
          amount?: number;
          is_team_points?: boolean;
          balance_after?: number;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "point_transactions_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      is_tenant_leader_or_manager: {
        Args: { user_id: string };
        Returns: boolean;
      };
      same_organization: {
        Args: { user_id: string; target_user_id: string };
        Returns: boolean;
      };
      process_room_booking: {
        Args: {
          p_room_id: string;
          p_user_id: string;
          p_booking_date: string;
          p_start_time: string;
          p_end_time: string;
          p_meeting_title: string;
          p_points_used: number;
          p_use_team_points?: boolean;
        };
        Returns: string;
      };
      cancel_room_booking: {
        Args: {
          p_booking_id: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      office_type: OfficeType;
      booking_status: BookingStatus;
      transaction_type: TransactionType;
      user_type_enum: UserType;
      business_type_enum: BusinessType;
      job_type_enum: JobType;
    };
  };
}

// Helper types for common queries
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type MeetingRoom = Database["public"]["Tables"]["meeting_rooms"]["Row"];
export type MeetingRoomInsert =
  Database["public"]["Tables"]["meeting_rooms"]["Insert"];
export type MeetingRoomUpdate =
  Database["public"]["Tables"]["meeting_rooms"]["Update"];

export type RoomBooking = Database["public"]["Tables"]["room_bookings"]["Row"];
export type RoomBookingInsert =
  Database["public"]["Tables"]["room_bookings"]["Insert"];
export type RoomBookingUpdate =
  Database["public"]["Tables"]["room_bookings"]["Update"];

export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type ProgramInsert = Database["public"]["Tables"]["programs"]["Insert"];
export type ProgramUpdate = Database["public"]["Tables"]["programs"]["Update"];

export type ProgramRegistration =
  Database["public"]["Tables"]["program_registrations"]["Row"];
export type ProgramRegistrationInsert =
  Database["public"]["Tables"]["program_registrations"]["Insert"];
export type ProgramRegistrationUpdate =
  Database["public"]["Tables"]["program_registrations"]["Update"];

export type PointTransaction =
  Database["public"]["Tables"]["point_transactions"]["Row"];
export type PointTransactionInsert =
  Database["public"]["Tables"]["point_transactions"]["Insert"];
export type PointTransactionUpdate =
  Database["public"]["Tables"]["point_transactions"]["Update"];
