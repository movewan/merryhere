import { createClient } from "@/lib/supabase/client";
import type {
  MeetingRoom,
  RoomBooking,
  RoomBookingInsert,
} from "./database.types";

/**
 * 모든 회의실 가져오기 (관리자용)
 */
export async function getMeetingRooms(): Promise<MeetingRoom[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("meeting_rooms")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching meeting rooms:", error);
    throw error;
  }

  return data || [];
}

/**
 * 활성화된 회의실만 가져오기 (사용자용)
 */
export async function getActiveMeetingRooms(): Promise<MeetingRoom[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("meeting_rooms")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching active meeting rooms:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 회의실 정보 가져오기
 */
export async function getMeetingRoomById(
  roomId: string
): Promise<MeetingRoom | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("meeting_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Error fetching meeting room:", error);
    return null;
  }

  return data;
}

/**
 * 특정 날짜의 회의실 예약 내역 가져오기
 */
export async function getRoomBookingsByDate(
  roomId: string,
  date: string
): Promise<RoomBooking[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("room_bookings")
    .select("*")
    .eq("room_id", roomId)
    .eq("booking_date", date)
    .eq("status", "confirmed")
    .order("start_time");

  if (error) {
    console.error("Error fetching room bookings:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 날짜 범위의 모든 예약 내역 가져오기 (캘린더용)
 */
export async function getRoomBookingsByDateRange(
  startDate: string,
  endDate: string
): Promise<RoomBooking[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("room_bookings")
    .select("*, meeting_rooms(*)")
    .gte("booking_date", startDate)
    .lte("booking_date", endDate)
    .eq("status", "confirmed")
    .order("booking_date")
    .order("start_time");

  if (error) {
    console.error("Error fetching room bookings by date range:", error);
    throw error;
  }

  return data || [];
}

/**
 * 사용자의 예약 내역 가져오기
 */
export async function getMyBookings(userId: string): Promise<RoomBooking[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("room_bookings")
    .select("*, meeting_rooms(*)")
    .eq("user_id", userId)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    console.error("Error fetching my bookings:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 시간대에 예약 가능한지 확인
 */
export async function checkAvailability(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("room_bookings")
    .select("id")
    .eq("room_id", roomId)
    .eq("booking_date", date)
    .eq("status", "confirmed")
    .or(
      `and(start_time.lt.${endTime},end_time.gt.${startTime})`
    );

  if (error) {
    console.error("Error checking availability:", error);
    return false;
  }

  return data.length === 0;
}

/**
 * 회의실 예약 생성 (Supabase 함수 호출)
 */
export async function createRoomBooking(params: {
  roomId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  meetingTitle: string;
  meetingDescription?: string;
  pointsUsed: number;
  useTeamPoints?: boolean;
}): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const supabase = createClient();

  try {
    // Supabase 함수 호출 (트랜잭션으로 예약 + 포인트 차감)
    const { data, error } = await supabase.rpc("process_room_booking", {
      p_room_id: params.roomId,
      p_user_id: params.userId,
      p_booking_date: params.bookingDate,
      p_start_time: params.startTime,
      p_end_time: params.endTime,
      p_meeting_title: params.meetingTitle,
      p_points_used: params.pointsUsed,
      p_use_team_points: params.useTeamPoints || false,
    });

    if (error) {
      console.error("Error creating booking:", error);
      return { success: false, error: error.message };
    }

    // 설명 업데이트 (별도 쿼리)
    if (params.meetingDescription && data) {
      await supabase
        .from("room_bookings")
        .update({ meeting_description: params.meetingDescription })
        .eq("id", data);
    }

    return { success: true, bookingId: data };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 예약 취소
 */
export async function cancelRoomBooking(
  bookingId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("cancel_room_booking", {
      p_booking_id: bookingId,
      p_user_id: userId,
    });

    if (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, error: error.message };
    }

    return { success: data };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 사용자의 포인트 잔액 가져오기
 */
export async function getUserPoints(userId: string): Promise<{
  personalPoints: number;
  teamPoints: number;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("personal_points, team_points")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user points:", error);
    return { personalPoints: 0, teamPoints: 0 };
  }

  return {
    personalPoints: data.personal_points,
    teamPoints: data.team_points,
  };
}
