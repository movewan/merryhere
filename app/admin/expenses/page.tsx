"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, TrendingDown, Calendar, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllExpenses,
  getExpensesByYear,
  getExpensesByCategory,
  type Expense,
  type ExpenseCategory,
  expenseCategoryLabels,
} from "@/lib/supabase/expenses";
import { ExpenseTable } from "@/components/admin/expense-table";
import { ExpenseModal } from "@/components/admin/expense-modal";
import { exportToExcel } from "@/lib/utils/excel";
import Link from "next/link";

export default function AdminExpensesPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryStats, setCategoryStats] = useState<{
    [key in ExpenseCategory]: number;
  }>({
    rent: 0,
    management: 0,
    supplies: 0,
    utilities: 0,
    maintenance: 0,
    other: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expensesData, categoryData] = await Promise.all([
        getExpensesByYear(year),
        getExpensesByCategory(year),
      ]);

      setExpenses(expensesData);
      setCategoryStats(categoryData);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleUpdate = () => {
    loadData();
    handleCloseModal();
  };

  const handleExportExcel = () => {
    const excelData = expenses.map((expense) => ({
      연도: expense.year,
      월: expense.month,
      카테고리: expenseCategoryLabels[expense.category as ExpenseCategory],
      금액: expense.amount,
      설명: expense.description || "",
      생성일: new Date(expense.created_at).toLocaleDateString("ko-KR"),
    }));

    exportToExcel(excelData, `지출관리_${year}년`, "지출내역");
  };

  const totalExpenses = Object.values(categoryStats).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const monthlyAverage = totalExpenses / 12;

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">지출 관리</h1>
              <p className="text-muted-foreground">
                {year}년 총 {expenses.length}건
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            <Button
              onClick={() => setShowModal(true)}
              className="bg-teal hover:bg-teal-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              지출 추가
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4 text-red-500" />
                연간 총 지출
              </div>
              <div className="mt-2 text-3xl font-bold text-red-600">
                {(totalExpenses / 1000000).toFixed(0)}
                <span className="text-lg font-normal text-muted-foreground">M</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-orange-500" />
                월 평균 지출
              </div>
              <div className="mt-2 text-3xl font-bold text-orange-600">
                {(monthlyAverage / 1000000).toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground">M</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">가장 큰 지출</div>
              <div className="mt-2 text-xl font-bold">
                {Object.entries(categoryStats).reduce((max, [cat, amount]) =>
                  amount > max.amount ? { category: cat, amount } : max,
                  { category: "", amount: 0 }
                ).category &&
                  expenseCategoryLabels[
                    Object.entries(categoryStats).reduce((max, [cat, amount]) =>
                      amount > max.amount ? { category: cat, amount } : max,
                      { category: "", amount: 0 }
                    ).category as ExpenseCategory
                  ]}
              </div>
              <div className="text-sm text-muted-foreground">
                {(
                  Object.entries(categoryStats).reduce((max, [cat, amount]) =>
                    amount > max.amount ? { category: cat, amount } : max,
                    { category: "", amount: 0 }
                  ).amount / 1000000
                ).toFixed(1)}
                M
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">지출 건수</div>
              <div className="mt-2 text-3xl font-bold">
                {expenses.length}
                <span className="text-lg font-normal text-muted-foreground">건</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리별 지출 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>카테고리별 연간 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Object.entries(categoryStats) as [ExpenseCategory, number][])
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage =
                    totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {expenseCategoryLabels[category]}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="font-semibold">
                            {amount.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* 지출 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>지출 내역</CardTitle>
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                엑셀 다운로드
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ExpenseTable
              expenses={expenses}
              onEdit={handleEdit}
              onUpdate={loadData}
            />
          </CardContent>
        </Card>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </main>
  );
}
