/**
 * Database Query Functions
 * Reusable functions for fetching data from Supabase
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

type Client = SupabaseClient<Database>;

// ============================================================================
// PROFILE QUERIES
// ============================================================================

export async function getProfile(client: Client, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileByEmail(client: Client, email: string) {
  // Note: Email is stored in auth.users, not profiles
  // This would need to query auth.users first, then profiles
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  return getProfile(client, user.id);
}

export async function getOrganizationMembers(
  client: Client,
  organizationId: string
) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================================
// MEETING ROOM QUERIES
// ============================================================================

export async function getAllMeetingRooms(client: Client) {
  const { data, error } = await client
    .from("meeting_rooms")
    .select("*")
    .eq("is_active", true)
    .order("floor", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMeetingRoom(client: Client, roomId: string) {
  const { data, error } = await client
    .from("meeting_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ROOM BOOKING QUERIES
// ============================================================================

export async function getUserBookings(
  client: Client,
  userId: string,
  options?: {
    status?: "confirmed" | "cancelled";
    startDate?: string;
    endDate?: string;
  }
) {
  let query = client
    .from("room_bookings")
    .select(
      `
      *,
      meeting_rooms (
        id,
        name,
        floor
      )
    `
    )
    .eq("user_id", userId);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.startDate) {
    query = query.gte("booking_date", options.startDate);
  }

  if (options?.endDate) {
    query = query.lte("booking_date", options.endDate);
  }

  const { data, error } = await query.order("booking_date", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getRoomBookingsByDate(
  client: Client,
  roomId: string,
  date: string
) {
  const { data, error } = await client
    .from("room_bookings")
    .select("*")
    .eq("room_id", roomId)
    .eq("booking_date", date)
    .eq("status", "confirmed")
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getWeeklyBookings(
  client: Client,
  startDate: string,
  endDate: string
) {
  const { data, error } = await client
    .from("room_bookings")
    .select(
      `
      *,
      meeting_rooms (
        id,
        name
      ),
      profiles (
        id,
        full_name
      )
    `
    )
    .gte("booking_date", startDate)
    .lte("booking_date", endDate)
    .eq("status", "confirmed")
    .order("booking_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function checkBookingConflict(
  client: Client,
  roomId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  const { data, error } = await client
    .from("room_bookings")
    .select("id")
    .eq("room_id", roomId)
    .eq("booking_date", date)
    .eq("status", "confirmed")
    .or(
      `and(start_time.lt.${endTime},end_time.gt.${startTime})`
    );

  if (error) throw error;
  return data && data.length > 0;
}

// ============================================================================
// PROGRAM QUERIES
// ============================================================================

export async function getAllPrograms(client: Client, activeOnly = true) {
  let query = client.from("programs").select("*");

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.order("start_datetime", {
    ascending: true,
  });

  if (error) throw error;
  return data;
}

export async function getProgram(client: Client, programId: string) {
  const { data, error } = await client
    .from("programs")
    .select(
      `
      *,
      program_registrations (
        id,
        user_id,
        status
      )
    `
    )
    .eq("id", programId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProgramRegistrations(
  client: Client,
  userId: string
) {
  const { data, error } = await client
    .from("program_registrations")
    .select(
      `
      *,
      programs (
        id,
        title,
        start_datetime,
        end_datetime,
        thumbnail_url
      )
    `
    )
    .eq("user_id", userId)
    .order("registered_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function checkProgramRegistration(
  client: Client,
  userId: string,
  programId: string
) {
  const { data, error } = await client
    .from("program_registrations")
    .select("*")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data;
}

// ============================================================================
// POINT TRANSACTION QUERIES
// ============================================================================

export async function getUserPointTransactions(
  client: Client,
  userId: string,
  options?: {
    limit?: number;
    isTeamPoints?: boolean;
  }
) {
  let query = client
    .from("point_transactions")
    .select("*")
    .eq("user_id", userId);

  if (options?.isTeamPoints !== undefined) {
    query = query.eq("is_team_points", options.isTeamPoints);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getPointBalance(client: Client, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("personal_points, team_points")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// STATISTICS QUERIES
// ============================================================================

export async function getUserBookingStats(client: Client, userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const [confirmed, cancelled] = await Promise.all([
    client
      .from("room_bookings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .gte("booking_date", thirtyDaysAgoStr),
    client
      .from("room_bookings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "cancelled")
      .gte("booking_date", thirtyDaysAgoStr),
  ]);

  if (confirmed.error) throw confirmed.error;
  if (cancelled.error) throw cancelled.error;

  return {
    confirmedCount: confirmed.count || 0,
    cancelledCount: cancelled.count || 0,
  };
}
