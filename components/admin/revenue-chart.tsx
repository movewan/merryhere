"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyFinance } from "@/lib/supabase/finance";

interface RevenueChartProps {
  data: MonthlyFinance[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    month: `${item.month}월`,
    매출: item.revenue / 1000000, // 백만원 단위
    지출: item.expense / 1000000,
    순수익: item.profit / 1000000,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis label={{ value: "금액 (백만원)", angle: -90, position: "insideLeft" }} />
        <Tooltip
          formatter={(value: number) => `${value.toFixed(1)}M`}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="매출" fill="#10b981" />
        <Bar dataKey="지출" fill="#ef4444" />
        <Bar dataKey="순수익" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
