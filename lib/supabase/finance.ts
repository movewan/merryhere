import { createClient } from "@/lib/supabase/client";
import { getExpensesByYear, getYearlyExpenseTotal, getMonthlyExpenseTotal } from "./expenses";
import { getActiveContracts } from "./contracts";

/**
 * 월별 재무 데이터
 */
export interface MonthlyFinance {
  month: number;
  revenue: number;    // 매출
  expense: number;    // 지출
  profit: number;     // 순수익 (매출 - 지출)
}

/**
 * 연간 재무 통계
 */
export interface YearlyFinanceStats {
  year: number;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  averageMonthlyProfit: number;
  monthlyData: MonthlyFinance[];
}

/**
 * 공실 현황
 */
export interface VacancyStatus {
  totalOffices: number;
  occupiedOffices: number;
  vacantOffices: number;
  vacantRevenuePotential: number;  // 공실 잠재 매출
}

/**
 * 특정 연도의 월별 재무 데이터 조회
 */
export async function getYearlyFinanceData(year: number): Promise<YearlyFinanceStats> {
  const supabase = createClient();

  try {
    // 1. 활성 계약의 월별 매출 계산
    const { data: contracts } = await supabase
      .from("contracts")
      .select("start_date, end_date, total_monthly_cost, contract_status")
      .eq("contract_status", "active");

    // 2. 연도별 지출 데이터
    const expenses = await getExpensesByYear(year);

    // 3. 월별 데이터 생성 (1월~12월)
    const monthlyData: MonthlyFinance[] = [];

    for (let month = 1; month <= 12; month++) {
      // 해당 월에 활성 상태인 계약의 매출 합계
      const monthRevenue = contracts?.reduce((sum, contract) => {
        const startDate = new Date(contract.start_date);
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        const targetDate = new Date(year, month - 1, 1);

        // 계약 기간 내에 해당 월이 포함되는지 확인
        const isActive =
          startDate <= targetDate &&
          (!endDate || endDate >= targetDate);

        return isActive ? sum + (contract.total_monthly_cost || 0) : sum;
      }, 0) || 0;

      // 해당 월의 지출 합계
      const monthExpense = expenses
        .filter((e) => e.month === month)
        .reduce((sum, e) => sum + e.amount, 0);

      monthlyData.push({
        month,
        revenue: monthRevenue,
        expense: monthExpense,
        profit: monthRevenue - monthExpense,
      });
    }

    // 4. 연간 합계
    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
    const totalProfit = totalRevenue - totalExpense;
    const averageMonthlyProfit = totalProfit / 12;

    return {
      year,
      totalRevenue,
      totalExpense,
      totalProfit,
      averageMonthlyProfit,
      monthlyData,
    };
  } catch (error) {
    console.error("Error fetching yearly finance data:", error);
    return {
      year,
      totalRevenue: 0,
      totalExpense: 0,
      totalProfit: 0,
      averageMonthlyProfit: 0,
      monthlyData: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        revenue: 0,
        expense: 0,
        profit: 0,
      })),
    };
  }
}

/**
 * 공실 현황 조회
 */
export async function getVacancyStatus(): Promise<VacancyStatus> {
  const supabase = createClient();

  try {
    // 1. 오피스 전체 목록 (is_office = true)
    const { data: offices } = await (supabase as any)
      .from("meeting_rooms")
      .select("id, name, base_rent, is_office")
      .eq("is_office", true);

    if (!offices || offices.length === 0) {
      return {
        totalOffices: 0,
        occupiedOffices: 0,
        vacantOffices: 0,
        vacantRevenuePotential: 0,
      };
    }

    // 2. 활성 계약 목록 (room_number로 매칭)
    const { data: contracts } = await supabase
      .from("contracts")
      .select("room_number")
      .eq("contract_status", "active");

    const occupiedRoomNumbers = new Set(
      contracts?.map((c) => c.room_number).filter(Boolean) || []
    );

    // 3. 공실 계산
    const totalOffices = offices.length;
    const occupiedOffices = offices.filter((office: any) =>
      occupiedRoomNumbers.has(office.name)
    ).length;
    const vacantOffices = totalOffices - occupiedOffices;

    // 4. 공실 잠재 매출 계산
    const vacantRevenuePotential = offices
      .filter((office: any) => !occupiedRoomNumbers.has(office.name))
      .reduce((sum: number, office: any) => sum + (office.base_rent || 0), 0);

    return {
      totalOffices,
      occupiedOffices,
      vacantOffices,
      vacantRevenuePotential,
    };
  } catch (error) {
    console.error("Error fetching vacancy status:", error);
    return {
      totalOffices: 0,
      occupiedOffices: 0,
      vacantOffices: 0,
      vacantRevenuePotential: 0,
    };
  }
}

/**
 * 재무 대시보드 전체 데이터
 */
export interface FinanceDashboardData {
  finance: YearlyFinanceStats;
  vacancy: VacancyStatus;
}

export async function getFinanceDashboardData(year: number): Promise<FinanceDashboardData> {
  const [finance, vacancy] = await Promise.all([
    getYearlyFinanceData(year),
    getVacancyStatus(),
  ]);

  return {
    finance,
    vacancy,
  };
}
