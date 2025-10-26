import { createClient } from "@/lib/supabase/client";
import type { Profile, MeetingRoom, Program } from "./database.types";

/**
 * 관리자 권한 확인
 */
export async function checkAdminPermission(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return false;

  return data.role === "admin";
}

/**
 * 대시보드 통계 가져오기
 */
export async function getDashboardStats(): Promise<{
  totalUsers: number;
  totalTenants: number;
  totalRooms: number;
  totalPrograms: number;
  upcomingPrograms: number;
  todayBookings: number;
  totalPoints: number;
}> {
  const supabase = createClient();

  try {
    // 총 사용자 수
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 입주 회원 수
    const { count: totalTenants } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "tenant");

    // 활성 회의실 수
    const { count: totalRooms } = await supabase
      .from("meeting_rooms")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // 총 프로그램 수
    const { count: totalPrograms } = await supabase
      .from("programs")
      .select("*", { count: "exact", head: true });

    // 예정된 프로그램 수
    const now = new Date().toISOString();
    const { count: upcomingPrograms } = await supabase
      .from("programs")
      .select("*", { count: "exact", head: true })
      .gte("start_datetime", now);

    // 오늘 예약 수
    const today = new Date().toISOString().split("T")[0];
    const { count: todayBookings } = await supabase
      .from("room_bookings")
      .select("*", { count: "exact", head: true })
      .eq("booking_date", today)
      .eq("status", "confirmed");

    // 전체 포인트 합계
    const { data: pointsData } = await supabase
      .from("profiles")
      .select("personal_points, team_points");

    const totalPoints = pointsData?.reduce(
      (sum, profile) => sum + profile.personal_points + profile.team_points,
      0
    ) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalTenants: totalTenants || 0,
      totalRooms: totalRooms || 0,
      totalPrograms: totalPrograms || 0,
      upcomingPrograms: upcomingPrograms || 0,
      todayBookings: todayBookings || 0,
      totalPoints,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalUsers: 0,
      totalTenants: 0,
      totalRooms: 0,
      totalPrograms: 0,
      upcomingPrograms: 0,
      todayBookings: 0,
      totalPoints: 0,
    };
  }
}

/**
 * 모든 회원 목록 가져오기
 */
export async function getAllUsers(params?: {
  userType?: "general" | "tenant";
  role?: string;
  search?: string;
}): Promise<Profile[]> {
  const supabase = createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (params?.userType) {
    query = query.eq("user_type", params.userType);
  }

  if (params?.role) {
    query = query.eq("role", params.role as any);
  }

  if (params?.search) {
    query = query.or(
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,company_name.ilike.%${params.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  return data || [];
}

/**
 * 회원 정보 업데이트 (관리자용)
 */
export async function updateUserAsAdmin(
  userId: string,
  updates: {
    // 기본 정보
    full_name?: string;
    phone?: string | null;
    birth_date?: string | null;
    sns_url?: string | null;
    profile_image_url?: string | null;

    // 회원 유형 및 역할
    user_type?: "general" | "tenant";
    role?: string;

    // 회사 정보
    company_name?: string | null;
    ceo_name?: string | null;
    business_type?: string | null;
    business_start_date?: string | null;
    business_registration_number?: string | null;

    // 직무
    job_types?: string[] | null;

    // 파일 URL
    business_registration_url?: string | null;
    business_account_url?: string | null;
    company_logo_url?: string | null;

    // 포인트
    personal_points?: number;
    team_points?: number;

    // 상태
    is_active?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", userId);

    if (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 포인트 적립/차감
 */
export async function adjustUserPoints(params: {
  userId: string;
  amount: number;
  isTeamPoints: boolean;
  description: string;
  adminId: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 프로필에서 현재 포인트 가져오기
    const { data: profile } = await supabase
      .from("profiles")
      .select("personal_points, team_points")
      .eq("id", params.userId)
      .single();

    if (!profile) {
      return { success: false, error: "사용자를 찾을 수 없습니다." };
    }

    const currentPoints = params.isTeamPoints
      ? profile.team_points
      : profile.personal_points;
    const newPoints = currentPoints + params.amount;

    if (newPoints < 0) {
      return { success: false, error: "포인트가 부족합니다." };
    }

    // 포인트 업데이트
    const updateField = params.isTeamPoints ? "team_points" : "personal_points";
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [updateField]: newPoints })
      .eq("id", params.userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 거래 내역 생성
    const { error: transactionError } = await supabase
      .from("point_transactions")
      .insert({
        user_id: params.userId,
        transaction_type: "adjusted",
        amount: Math.abs(params.amount),
        is_team_points: params.isTeamPoints,
        description: params.description,
        balance_after: newPoints,
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adjusting points:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 회의실 생성
 */
export async function createMeetingRoom(
  room: Omit<MeetingRoom, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; roomId?: string; error?: string }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("meeting_rooms")
      .insert(room)
      .select()
      .single();

    if (error) {
      console.error("Error creating room:", error);
      return { success: false, error: error.message };
    }

    return { success: true, roomId: data.id };
  } catch (error) {
    console.error("Error creating room:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 회의실 수정
 */
export async function updateMeetingRoom(
  roomId: string,
  updates: Partial<Omit<MeetingRoom, "id" | "created_at" | "updated_at">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("meeting_rooms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId);

    if (error) {
      console.error("Error updating room:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating room:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 프로그램 생성
 */
export async function createProgram(
  program: Omit<Program, "id" | "created_at" | "updated_at" | "current_participants">
): Promise<{ success: boolean; programId?: string; error?: string }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("programs")
      .insert({
        ...program,
        current_participants: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating program:", error);
      return { success: false, error: error.message };
    }

    return { success: true, programId: data.id };
  } catch (error) {
    console.error("Error creating program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 프로그램 수정
 */
export async function updateProgram(
  programId: string,
  updates: Partial<Omit<Program, "id" | "created_at" | "updated_at" | "current_participants">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("programs")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId);

    if (error) {
      console.error("Error updating program:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 프로그램 삭제
 */
export async function deleteProgram(
  programId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 신청자가 있는지 확인
    const { count } = await supabase
      .from("program_registrations")
      .select("*", { count: "exact", head: true })
      .eq("program_id", programId)
      .eq("status", "registered");

    if (count && count > 0) {
      return {
        success: false,
        error: "신청자가 있는 프로그램은 삭제할 수 없습니다.",
      };
    }

    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", programId);

    if (error) {
      console.error("Error deleting program:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 프로그램 신청자 목록 가져오기
 */
export async function getProgramRegistrations(programId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("program_registrations")
    .select("*, profiles(*)")
    .eq("program_id", programId)
    .order("registered_at", { ascending: false });

  if (error) {
    console.error("Error fetching registrations:", error);
    throw error;
  }

  return data || [];
}

/**
 * 참석 확인 처리
 */
export async function markAttendance(
  registrationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("program_registrations")
      .update({ status: "attended" })
      .eq("id", registrationId);

    if (error) {
      console.error("Error marking attendance:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
