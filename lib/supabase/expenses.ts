import { createClient } from "@/lib/supabase/client";

export type ExpenseCategory = "rent" | "management" | "supplies" | "utilities" | "maintenance" | "other";

export interface Expense {
  id: string;
  year: number;
  month: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert extends Omit<Expense, "id" | "created_at" | "updated_at"> {}

/**
 * 모든 지출 조회 (관리자용)
 */
export async function getAllExpenses(): Promise<Expense[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from("expenses")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 연도의 지출 조회
 */
export async function getExpensesByYear(year: number): Promise<Expense[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from("expenses")
    .select("*")
    .eq("year", year)
    .order("month", { ascending: true });

  if (error) {
    console.error("Error fetching expenses by year:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 연월의 지출 조회
 */
export async function getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from("expenses")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses by month:", error);
    throw error;
  }

  return data || [];
}

/**
 * 지출 생성
 */
export async function createExpense(
  expense: ExpenseInsert
): Promise<{ success: boolean; expenseId?: string; error?: string }> {
  const supabase = createClient();

  try {
    const { data, error } = await (supabase as any)
      .from("expenses")
      .insert(expense)
      .select()
      .single();

    if (error) {
      console.error("Error creating expense:", error);
      return { success: false, error: error.message };
    }

    return { success: true, expenseId: data.id };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 지출 수정
 */
export async function updateExpense(
  expenseId: string,
  updates: Partial<ExpenseInsert>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await (supabase as any)
      .from("expenses")
      .update(updates)
      .eq("id", expenseId);

    if (error) {
      console.error("Error updating expense:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 지출 삭제
 */
export async function deleteExpense(
  expenseId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await (supabase as any)
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (error) {
      console.error("Error deleting expense:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 월별 지출 합계
 */
export async function getMonthlyExpenseTotal(year: number, month: number): Promise<number> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from("expenses")
    .select("amount")
    .eq("year", year)
    .eq("month", month);

  if (error) {
    console.error("Error fetching monthly expense total:", error);
    return 0;
  }

  return data?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
}

/**
 * 연간 지출 합계
 */
export async function getYearlyExpenseTotal(year: number): Promise<number> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from("expenses")
    .select("amount")
    .eq("year", year);

  if (error) {
    console.error("Error fetching yearly expense total:", error);
    return 0;
  }

  return data?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
}

/**
 * 카테고리별 지출 통계 (특정 연도)
 */
export async function getExpensesByCategory(year: number): Promise<{
  [key in ExpenseCategory]: number;
}> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from("expenses")
    .select("category, amount")
    .eq("year", year);

  if (error) {
    console.error("Error fetching expenses by category:", error);
    return {
      rent: 0,
      management: 0,
      supplies: 0,
      utilities: 0,
      maintenance: 0,
      other: 0,
    };
  }

  const categoryTotals: { [key in ExpenseCategory]: number } = {
    rent: 0,
    management: 0,
    supplies: 0,
    utilities: 0,
    maintenance: 0,
    other: 0,
  };

  data?.forEach((expense: any) => {
    categoryTotals[expense.category as ExpenseCategory] += expense.amount;
  });

  return categoryTotals;
}

/**
 * 지출 카테고리 레이블
 */
export const expenseCategoryLabels: { [key in ExpenseCategory]: string } = {
  rent: "임대료",
  management: "관리비",
  supplies: "소모품",
  utilities: "공과금",
  maintenance: "유지보수",
  other: "기타",
};
