import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileUpdate, PointTransaction } from "./database.types";

/**
 * 사용자 프로필 가져오기
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * 프로필 업데이트
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 프로필 이미지 업로드
 */
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = createClient();

  try {
    // 파일 확장자
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Public URL 가져오기
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ profile_image_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile image:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 포인트 거래 내역 가져오기
 */
export async function getPointTransactions(
  userId: string,
  limit: number = 10
): Promise<PointTransaction[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching point transactions:", error);
    throw error;
  }

  return data || [];
}

/**
 * 최근 포인트 거래 내역 가져오기 (차트용)
 */
export async function getRecentPointTransactions(
  userId: string,
  days: number = 30
): Promise<PointTransaction[]> {
  const supabase = createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching recent transactions:", error);
    throw error;
  }

  return data || [];
}

/**
 * 포인트 통계 가져오기
 */
export async function getPointStatistics(
  userId: string
): Promise<{
  totalEarned: number;
  totalSpent: number;
  totalRefunded: number;
  personalBalance: number;
  teamBalance: number;
}> {
  const supabase = createClient();

  // 프로필에서 현재 잔액 가져오기
  const profile = await getProfile(userId);
  const personalBalance = profile?.personal_points || 0;
  const teamBalance = profile?.team_points || 0;

  // 거래 내역 통계
  const { data: transactions } = await supabase
    .from("point_transactions")
    .select("transaction_type, amount, is_team_points")
    .eq("user_id", userId);

  let totalEarned = 0;
  let totalSpent = 0;
  let totalRefunded = 0;

  transactions?.forEach((transaction) => {
    switch (transaction.transaction_type) {
      case "earned":
        totalEarned += transaction.amount;
        break;
      case "spent":
        totalSpent += transaction.amount;
        break;
      case "refunded":
        totalRefunded += transaction.amount;
        break;
    }
  });

  return {
    totalEarned,
    totalSpent,
    totalRefunded,
    personalBalance,
    teamBalance,
  };
}

/**
 * 비밀번호 변경
 */
export async function changePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error changing password:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
