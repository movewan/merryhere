"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import {
  getPointStatistics,
  getPointTransactions,
} from "@/lib/supabase/profile";
import type { PointTransaction } from "@/lib/supabase/database.types";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

interface PointsDashboardProps {
  userId: string;
}

const transactionTypeLabels = {
  earned: "적립",
  spent: "사용",
  refunded: "환불",
  adjusted: "조정",
};

export function PointsDashboard({ userId }: PointsDashboardProps) {
  const [statistics, setStatistics] = useState({
    totalEarned: 0,
    totalSpent: 0,
    totalRefunded: 0,
    personalBalance: 0,
    teamBalance: 0,
  });
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, trans] = await Promise.all([
        getPointStatistics(userId),
        getPointTransactions(userId, 10),
      ]);
      setStatistics(stats);
      setTransactions(trans);
    } catch (error) {
      console.error("Failed to load point data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 포인트 잔액 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">개인 포인트</p>
                <p className="mt-2 text-3xl font-bold text-teal">
                  {statistics.personalBalance.toLocaleString()}P
                </p>
              </div>
              <div className="rounded-full bg-teal/10 p-3">
                <Coins className="h-8 w-8 text-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">팀 포인트</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {statistics.teamBalance.toLocaleString()}P
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Coins className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 포인트 통계 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 적립</p>
                <p className="text-lg font-bold">
                  {statistics.totalEarned.toLocaleString()}P
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 사용</p>
                <p className="text-lg font-bold">
                  {statistics.totalSpent.toLocaleString()}P
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 환불</p>
                <p className="text-lg font-bold">
                  {statistics.totalRefunded.toLocaleString()}P
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 포인트 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 포인트 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              포인트 내역이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {transactionTypeLabels[transaction.transaction_type]}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                        {transaction.is_team_points ? "팀" : "개인"}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {transaction.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(
                        parseISO(transaction.created_at),
                        "yyyy.MM.dd HH:mm",
                        { locale: ko }
                      )}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      transaction.transaction_type === "earned" ||
                      transaction.transaction_type === "refunded"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.transaction_type === "earned" ||
                    transaction.transaction_type === "refunded"
                      ? "+"
                      : "-"}
                    {transaction.amount.toLocaleString()}P
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
