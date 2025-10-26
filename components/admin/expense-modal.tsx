"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import {
  createExpense,
  updateExpense,
  type Expense,
  type ExpenseInsert,
  type ExpenseCategory,
  expenseCategoryLabels,
} from "@/lib/supabase/expenses";

interface ExpenseModalProps {
  expense?: Expense | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function ExpenseModal({ expense, onClose, onUpdate }: ExpenseModalProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState<Partial<ExpenseInsert>>({
    year: expense?.year || currentYear,
    month: expense?.month || currentMonth,
    category: expense?.category || "rent",
    description: expense?.description || "",
    amount: expense?.amount || 0,
    created_by: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.year || !formData.month || !formData.category || !formData.description) {
        setError("모든 필수 항목을 입력해주세요.");
        setLoading(false);
        return;
      }

      if (!formData.amount || formData.amount <= 0) {
        setError("금액은 0보다 커야 합니다.");
        setLoading(false);
        return;
      }

      const expenseData: ExpenseInsert = {
        year: formData.year,
        month: formData.month,
        category: formData.category as ExpenseCategory,
        description: formData.description,
        amount: formData.amount,
        created_by: null,
      };

      let result;
      if (expense) {
        result = await updateExpense(expense.id, expenseData);
      } else {
        result = await createExpense(expenseData);
      }

      if (result.success) {
        onUpdate();
      } else {
        setError(result.error || "저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("Error saving expense:", err);
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {expense ? "지출 수정" : "지출 추가"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 연도 & 월 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year">연도 *</Label>
              <Select
                value={formData.year?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, year: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">월 *</Label>
              <Select
                value={formData.month?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, month: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}월
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as ExpenseCategory })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(expenseCategoryLabels) as [ExpenseCategory, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="지출 내역을 입력하세요"
              rows={3}
            />
          </div>

          {/* 금액 */}
          <div className="space-y-2">
            <Label htmlFor="amount">금액 (원) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              min="0"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal hover:bg-teal-600"
            >
              {loading ? "저장 중..." : expense ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
