"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { getFinanceDashboardData, type FinanceDashboardData } from "@/lib/supabase/finance";
import { RevenueChart } from "./revenue-chart";

export function FinanceDashboard() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<FinanceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardData = await getFinanceDashboardData(year);
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  const { finance, vacancy } = data;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">재무 현황</h2>
        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              연간 총 매출
            </div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {(finance.totalRevenue / 1000000).toFixed(0)}
              <span className="text-lg font-normal text-muted-foreground">M</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500" />
              연간 총 지출
            </div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {(finance.totalExpense / 1000000).toFixed(0)}
              <span className="text-lg font-normal text-muted-foreground">M</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 text-blue-500" />
              연간 순수익
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {(finance.totalProfit / 1000000).toFixed(0)}
              <span className="text-lg font-normal text-muted-foreground">M</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">월 평균 수익</div>
            <div className="mt-2 text-2xl font-bold">
              {(finance.averageMonthlyProfit / 1000000).toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground">M</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 공실 현황 */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Building2 className="h-5 w-5" />
            공실 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-orange-600">전체 오피스</div>
              <div className="mt-1 text-2xl font-bold">{vacancy.totalOffices}개</div>
            </div>
            <div>
              <div className="text-sm text-orange-600">현재 공실</div>
              <div className="mt-1 text-2xl font-bold text-orange-500">
                {vacancy.vacantOffices}개
              </div>
            </div>
            <div>
              <div className="text-sm text-orange-600">공실 잠재 매출</div>
              <div className="mt-1 text-2xl font-bold text-orange-500">
                {vacancy.vacantRevenuePotential.toLocaleString()}
                <span className="text-sm font-normal">원/월</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 월별 재무 그래프 */}
      <Card>
        <CardHeader>
          <CardTitle>월별 매출/지출/수익 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={finance.monthlyData} />
        </CardContent>
      </Card>
    </div>
  );
}
