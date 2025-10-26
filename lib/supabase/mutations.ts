/**
 * Database Mutation Functions
 * Reusable functions for modifying data in Supabase
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  Database,
  ProfileUpdate,
  RoomBookingInsert,
  ProgramRegistrationInsert,
} from "./database.types";

type Client = SupabaseClient<Database>;

// ============================================================================
// PROFILE MUTATIONS
// ============================================================================

export async function updateProfile(
  client: Client,
  userId: string,
  updates: ProfileUpdate
) {
  const { data, error } = await client
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadProfileImage(
  client: Client,
  userId: string,
  file: File
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `profile-images/${fileName}`;

  const { error: uploadError } = await client.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = client.storage.from("avatars").getPublicUrl(filePath);

  // Update profile with new image URL
  return updateProfile(client, userId, { profile_image_url: publicUrl });
}

export async function addTeamMember(
  client: Client,
  leaderUserId: string,
  memberEmail: string
) {
  // First, find the member by email (would need to implement this based on your auth setup)
  // This is a simplified version - you'd need to implement the actual email lookup

  // For now, assuming you have the member's userId
  // const { data, error } = await client
  //   .from("profiles")
  //   .update({ organization_id: leaderUserId })
  //   .eq("email", memberEmail) // Note: email is in auth.users, not profiles
  //   .select()
  //   .single();

  // if (error) throw error;
  // return data;

  throw new Error(
    "addTeamMember needs to be implemented with proper email lookup"
  );
}

export async function removeTeamMember(
  client: Client,
  leaderUserId: string,
  memberId: string
) {
  // Verify the leader owns this member
  const { data: member } = await client
    .from("profiles")
    .select("organization_id")
    .eq("id", memberId)
    .single();

  if (!member || member.organization_id !== leaderUserId) {
    throw new Error("Not authorized to remove this member");
  }

  const { data, error } = await client
    .from("profiles")
    .update({ organization_id: null })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeleteProfile(client: Client, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ROOM BOOKING MUTATIONS
// ============================================================================

export async function createRoomBooking(
  client: Client,
  booking: {
    roomId: string;
    userId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    meetingTitle: string;
    pointsUsed: number;
    useTeamPoints?: boolean;
  }
) {
  // Use the database function to handle the booking with points
  const { data, error } = await client.rpc("process_room_booking", {
    p_room_id: booking.roomId,
    p_user_id: booking.userId,
    p_booking_date: booking.bookingDate,
    p_start_time: booking.startTime,
    p_end_time: booking.endTime,
    p_meeting_title: booking.meetingTitle,
    p_points_used: booking.pointsUsed,
    p_use_team_points: booking.useTeamPoints || false,
  });

  if (error) throw error;
  return data;
}

export async function cancelRoomBooking(
  client: Client,
  bookingId: string,
  userId: string
) {
  // Use the database function to handle cancellation with refund
  const { data, error } = await client.rpc("cancel_room_booking", {
    p_booking_id: bookingId,
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

// ============================================================================
// PROGRAM MUTATIONS
// ============================================================================

export async function registerForProgram(
  client: Client,
  userId: string,
  programId: string
) {
  // Check if program has space
  const { data: program } = await client
    .from("programs")
    .select("current_participants, max_participants")
    .eq("id", programId)
    .single();

  if (!program) {
    throw new Error("Program not found");
  }

  if (program.current_participants >= program.max_participants) {
    throw new Error("Program is full");
  }

  const registration: ProgramRegistrationInsert = {
    program_id: programId,
    user_id: userId,
    status: "registered",
  };

  const { data, error } = await client
    .from("program_registrations")
    .insert(registration)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelProgramRegistration(
  client: Client,
  registrationId: string,
  userId: string
) {
  const { data, error } = await client
    .from("program_registrations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", registrationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ADMIN MUTATIONS
// ============================================================================

export async function adjustUserPoints(
  client: Client,
  targetUserId: string,
  amount: number,
  isTeamPoints: boolean,
  description: string,
  adminUserId: string
) {
  // Get current balance
  const { data: profile } = await client
    .from("profiles")
    .select("personal_points, team_points")
    .eq("id", targetUserId)
    .single();

  if (!profile) {
    throw new Error("User not found");
  }

  const currentBalance = isTeamPoints
    ? profile.team_points
    : profile.personal_points;
  const newBalance = currentBalance + amount;

  if (newBalance < 0) {
    throw new Error("Insufficient points");
  }

  // Update points
  const updateField = isTeamPoints ? "team_points" : "personal_points";
  await client
    .from("profiles")
    .update({ [updateField]: newBalance })
    .eq("id", targetUserId);

  // Record transaction
  const { data, error } = await client
    .from("point_transactions")
    .insert({
      user_id: targetUserId,
      transaction_type: "adjusted",
      amount,
      is_team_points: isTeamPoints,
      balance_after: newBalance,
      description,
      created_by: adminUserId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMeetingRoom(
  client: Client,
  room: {
    name: string;
    floor: number;
    capacity: number;
    description?: string;
    pointsPer30min?: number;
  }
) {
  const { data, error } = await client
    .from("meeting_rooms")
    .insert({
      name: room.name,
      floor: room.floor,
      capacity: room.capacity,
      description: room.description,
      points_per_30min: room.pointsPer30min || 10,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMeetingRoom(
  client: Client,
  roomId: string,
  updates: {
    name?: string;
    floor?: number;
    capacity?: number;
    description?: string;
    pointsPer30min?: number;
    isActive?: boolean;
  }
) {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.floor !== undefined) dbUpdates.floor = updates.floor;
  if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
  if (updates.description !== undefined)
    dbUpdates.description = updates.description;
  if (updates.pointsPer30min !== undefined)
    dbUpdates.points_per_30min = updates.pointsPer30min;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await client
    .from("meeting_rooms")
    .update(dbUpdates)
    .eq("id", roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createProgram(
  client: Client,
  program: {
    title: string;
    description?: string;
    detailedContent?: string;
    startDatetime: string;
    endDatetime: string;
    maxParticipants: number;
    thumbnailUrl?: string;
    registrationDeadline?: string;
  },
  createdBy: string
) {
  const { data, error } = await client
    .from("programs")
    .insert({
      title: program.title,
      description: program.description,
      detailed_content: program.detailedContent,
      start_datetime: program.startDatetime,
      end_datetime: program.endDatetime,
      max_participants: program.maxParticipants,
      thumbnail_url: program.thumbnailUrl,
      registration_deadline: program.registrationDeadline,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgram(
  client: Client,
  programId: string,
  updates: {
    title?: string;
    description?: string;
    detailedContent?: string;
    startDatetime?: string;
    endDatetime?: string;
    maxParticipants?: number;
    thumbnailUrl?: string;
    isActive?: boolean;
  }
) {
  const dbUpdates: any = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined)
    dbUpdates.description = updates.description;
  if (updates.detailedContent !== undefined)
    dbUpdates.detailed_content = updates.detailedContent;
  if (updates.startDatetime !== undefined)
    dbUpdates.start_datetime = updates.startDatetime;
  if (updates.endDatetime !== undefined)
    dbUpdates.end_datetime = updates.endDatetime;
  if (updates.maxParticipants !== undefined)
    dbUpdates.max_participants = updates.maxParticipants;
  if (updates.thumbnailUrl !== undefined)
    dbUpdates.thumbnail_url = updates.thumbnailUrl;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await client
    .from("programs")
    .update(dbUpdates)
    .eq("id", programId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
