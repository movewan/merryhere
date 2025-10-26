import { createClient } from "@/lib/supabase/client";
import type {
  Program,
  ProgramRegistration,
  ProgramRegistrationInsert,
} from "./database.types";

/**
 * 활성화된 프로그램 목록 가져오기
 */
export async function getPrograms(): Promise<Program[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("start_datetime", { ascending: true });

  if (error) {
    console.error("Error fetching programs:", error);
    throw error;
  }

  return data || [];
}

/**
 * 예정된 프로그램만 가져오기
 */
export async function getUpcomingPrograms(): Promise<Program[]> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .gte("start_datetime", now)
    .order("start_datetime", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming programs:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 프로그램 정보 가져오기
 */
export async function getProgramById(programId: string): Promise<Program | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", programId)
    .single();

  if (error) {
    console.error("Error fetching program:", error);
    return null;
  }

  return data;
}

/**
 * 프로그램 신청 여부 확인
 */
export async function checkUserRegistration(
  programId: string,
  userId: string
): Promise<ProgramRegistration | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("program_registrations")
    .select("*")
    .eq("program_id", programId)
    .eq("user_id", userId)
    .in("status", ["registered", "attended"])
    .maybeSingle();

  if (error) {
    console.error("Error checking registration:", error);
    return null;
  }

  return data;
}

/**
 * 프로그램 신청
 */
export async function registerProgram(
  programId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 이미 신청했는지 확인
    const existing = await checkUserRegistration(programId, userId);
    if (existing) {
      return { success: false, error: "이미 신청한 프로그램입니다." };
    }

    // 프로그램 정보 가져오기
    const program = await getProgramById(programId);
    if (!program) {
      return { success: false, error: "프로그램을 찾을 수 없습니다." };
    }

    // 정원 확인
    if (program.current_participants >= program.max_participants) {
      return { success: false, error: "정원이 마감되었습니다." };
    }

    // 신청 마감일 확인
    if (program.registration_deadline) {
      const deadline = new Date(program.registration_deadline);
      const now = new Date();
      if (now > deadline) {
        return { success: false, error: "신청 기간이 종료되었습니다." };
      }
    }

    // 신청 생성
    const registration: ProgramRegistrationInsert = {
      program_id: programId,
      user_id: userId,
      status: "registered",
    };

    const { error: insertError } = await supabase
      .from("program_registrations")
      .insert(registration);

    if (insertError) {
      console.error("Error registering program:", insertError);
      return { success: false, error: insertError.message };
    }

    // 참가 인원 증가
    const { error: updateError } = await supabase
      .from("programs")
      .update({
        current_participants: program.current_participants + 1,
      })
      .eq("id", programId);

    if (updateError) {
      console.error("Error updating participant count:", updateError);
      // 롤백은 하지 않음 (이미 신청은 완료)
    }

    return { success: true };
  } catch (error) {
    console.error("Error registering program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 프로그램 신청 취소
 */
export async function cancelProgramRegistration(
  programId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 신청 내역 확인
    const registration = await checkUserRegistration(programId, userId);
    if (!registration) {
      return { success: false, error: "신청 내역을 찾을 수 없습니다." };
    }

    // 이미 참석 완료한 경우 취소 불가
    if (registration.status === "attended") {
      return { success: false, error: "이미 참석 완료한 프로그램입니다." };
    }

    // 신청 취소
    const { error: updateError } = await supabase
      .from("program_registrations")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", registration.id);

    if (updateError) {
      console.error("Error cancelling registration:", updateError);
      return { success: false, error: updateError.message };
    }

    // 참가 인원 감소
    const program = await getProgramById(programId);
    if (program && program.current_participants > 0) {
      await supabase
        .from("programs")
        .update({
          current_participants: program.current_participants - 1,
        })
        .eq("id", programId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 사용자의 프로그램 신청 내역 가져오기
 */
export async function getMyRegistrations(
  userId: string
): Promise<ProgramRegistration[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("program_registrations")
    .select("*, programs(*)")
    .eq("user_id", userId)
    .order("registered_at", { ascending: false });

  if (error) {
    console.error("Error fetching my registrations:", error);
    throw error;
  }

  return data || [];
}

/**
 * 프로그램이 신청 가능한지 확인
 */
export async function isProgramAvailable(program: Program): Promise<boolean> {
  // 정원 확인
  if (program.current_participants >= program.max_participants) {
    return false;
  }

  // 신청 마감일 확인
  if (program.registration_deadline) {
    const deadline = new Date(program.registration_deadline);
    const now = new Date();
    if (now > deadline) {
      return false;
    }
  }

  // 시작 시간 확인
  const startTime = new Date(program.start_datetime);
  const now = new Date();
  if (now > startTime) {
    return false;
  }

  return true;
}
