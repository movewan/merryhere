import { createClient } from "@/lib/supabase/client";

export interface Contract {
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
}

export interface ContractInsert extends Omit<Contract, "id" | "created_at" | "updated_at"> {}

/**
 * 모든 계약 조회 (관리자용)
 */
export async function getAllContracts(): Promise<Contract[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 회사의 계약 조회
 */
export async function getCompanyContracts(companyName: string): Promise<Contract[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("company_name", companyName)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching company contracts:", error);
    throw error;
  }

  return data || [];
}

/**
 * 사용자의 계약 조회 (입주 회원용)
 */
export async function getMyContracts(userId: string): Promise<Contract[]> {
  const supabase = createClient();

  // 먼저 사용자의 회사명 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", userId)
    .single();

  if (!profile?.company_name) {
    return [];
  }

  return getCompanyContracts(profile.company_name);
}

/**
 * 활성 계약만 조회
 */
export async function getActiveContracts(): Promise<Contract[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("contract_status", "active")
    .order("company_name");

  if (error) {
    console.error("Error fetching active contracts:", error);
    throw error;
  }

  return data || [];
}

/**
 * 계약 생성
 */
export async function createContract(
  contract: ContractInsert
): Promise<{ success: boolean; contractId?: string; error?: string }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("contracts")
      .insert(contract)
      .select()
      .single();

    if (error) {
      console.error("Error creating contract:", error);
      return { success: false, error: error.message };
    }

    return { success: true, contractId: data.id };
  } catch (error) {
    console.error("Error creating contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 계약 수정
 */
export async function updateContract(
  contractId: string,
  updates: Partial<ContractInsert>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("contracts")
      .update(updates)
      .eq("id", contractId);

    if (error) {
      console.error("Error updating contract:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 계약 삭제
 */
export async function deleteContract(
  contractId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("contracts")
      .delete()
      .eq("id", contractId);

    if (error) {
      console.error("Error deleting contract:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 계약 상태 변경
 */
export async function updateContractStatus(
  contractId: string,
  status: "active" | "pending" | "expired" | "terminated",
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 현재 계약 정보 조회
    const { data: contract } = await supabase
      .from("contracts")
      .select("contract_status")
      .eq("id", contractId)
      .single();

    // 상태 업데이트
    const { error } = await supabase
      .from("contracts")
      .update({ contract_status: status })
      .eq("id", contractId);

    if (error) {
      return { success: false, error: error.message };
    }

    // TODO: 히스토리 기록 (contract_history 테이블 생성 후 활성화)
    // if (contract) {
    //   const user = await supabase.auth.getUser();
    //   await supabase.from("contract_history").insert({
    //     contract_id: contractId,
    //     changed_by: user.data.user?.id,
    //     change_type: "status_change",
    //     previous_value: { status: contract.contract_status },
    //     new_value: { status },
    //     notes: notes || `상태 변경: ${contract.contract_status} → ${status}`,
    //   });
    // }

    return { success: true };
  } catch (error) {
    console.error("Error updating contract status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 곧 만료될 계약 조회 (D-30 이내)
 */
export async function getExpiringContracts(): Promise<Contract[]> {
  const supabase = createClient();

  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("contract_status", "active")
    .not("end_date", "is", null)
    .gte("end_date", today.toISOString().split("T")[0])
    .lte("end_date", thirtyDaysLater.toISOString().split("T")[0])
    .order("end_date");

  if (error) {
    console.error("Error fetching expiring contracts:", error);
    throw error;
  }

  return data || [];
}

/**
 * 계약 통계
 */
export async function getContractStatistics(): Promise<{
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalMonthlyRevenue: number;
  totalDeposit: number;
}> {
  const supabase = createClient();

  try {
    // 전체 계약 수
    const { count: totalContracts } = await supabase
      .from("contracts")
      .select("*", { count: "exact", head: true });

    // 활성 계약 수
    const { count: activeContracts } = await supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .eq("contract_status", "active");

    // 곧 만료될 계약
    const expiringContracts = await getExpiringContracts();

    // 활성 계약의 월 매출 합계
    const { data: activeContractData } = await supabase
      .from("contracts")
      .select("total_monthly_cost, deposit")
      .eq("contract_status", "active");

    const totalMonthlyRevenue = activeContractData?.reduce(
      (sum, contract) => sum + (contract.total_monthly_cost || 0),
      0
    ) || 0;

    const totalDeposit = activeContractData?.reduce(
      (sum, contract) => sum + (contract.deposit || 0),
      0
    ) || 0;

    return {
      totalContracts: totalContracts || 0,
      activeContracts: activeContracts || 0,
      expiringContracts: expiringContracts.length,
      totalMonthlyRevenue,
      totalDeposit,
    };
  } catch (error) {
    console.error("Error fetching contract statistics:", error);
    return {
      totalContracts: 0,
      activeContracts: 0,
      expiringContracts: 0,
      totalMonthlyRevenue: 0,
      totalDeposit: 0,
    };
  }
}
