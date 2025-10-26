"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import {
  deleteExpense,
  type Expense,
  expenseCategoryLabels,
} from "@/lib/supabase/expenses";

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onUpdate: () => void;
}

export function ExpenseTable({ expenses, onEdit, onUpdate }: ExpenseTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (expense: Expense) => {
    if (!confirm(`${expense.description} 지출 내역을 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(expense.id);
    try {
      const result = await deleteExpense(expense.id);
      if (result.success) {
        onUpdate();
      } else {
        alert(`삭제 실패: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        지출 내역이 없습니다.
      </div>
    );
  }

  // 월별로 그룹화
  const groupedByMonth = expenses.reduce((acc, expense) => {
    const key = `${expense.year}-${expense.month.toString().padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedByMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([monthKey, monthExpenses]) => {
          const [year, month] = monthKey.split("-");
          const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

          return (
            <div key={monthKey} className="space-y-4">
              {/* 월별 헤더 */}
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold">
                  {year}년 {parseInt(month)}월
                </h3>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">월 합계</div>
                  <div className="text-xl font-bold">
                    {monthTotal.toLocaleString()}원
                  </div>
                </div>
              </div>

              {/* 테이블 */}
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>카테고리</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                      <TableHead className="text-center">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                            {expenseCategoryLabels[expense.category]}
                          </span>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {expense.amount.toLocaleString()}원
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense)}
                              disabled={deletingId === expense.id}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
    </div>
  );
}
