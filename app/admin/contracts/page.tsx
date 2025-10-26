"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FileText, AlertCircle } from "lucide-react";
import {
  getAllContracts,
  getContractStatistics,
  getExpiringContracts,
  type Contract,
} from "@/lib/supabase/contracts";
import { ContractTable } from "@/components/admin/contract-table";
import { ContractModal } from "@/components/admin/contract-modal";
import { FinanceDashboard } from "@/components/admin/finance-dashboard";
import Link from "next/link";

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    expiringContracts: 0,
    totalMonthlyRevenue: 0,
    totalDeposit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsData, expiringData, statsData] = await Promise.all([
        getAllContracts(),
        getExpiringContracts(),
        getContractStatistics(),
      ]);

      setContracts(contractsData);
      setExpiringContracts(expiringData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContract(null);
  };

  const handleUpdate = () => {
    loadData();
    handleCloseModal();
  };

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
              <h1 className="text-3xl font-bold">계약 관리</h1>
              <p className="text-muted-foreground">
                전체 계약 {contracts.length}건
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-teal hover:bg-teal-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            계약 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">전체 계약</div>
              <div className="mt-2 text-3xl font-bold">
                {stats.totalContracts}
                <span className="text-lg font-normal text-muted-foreground">건</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">활성 계약</div>
              <div className="mt-2 text-3xl font-bold text-teal">
                {stats.activeContracts}
                <span className="text-lg font-normal text-muted-foreground">건</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                만료 예정
              </div>
              <div className="mt-2 text-3xl font-bold text-orange-500">
                {stats.expiringContracts}
                <span className="text-lg font-normal text-muted-foreground">건</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">월 매출</div>
              <div className="mt-2 text-2xl font-bold">
                {stats.totalMonthlyRevenue.toLocaleString()}
                <span className="text-lg font-normal text-muted-foreground">원</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">총 보증금</div>
              <div className="mt-2 text-2xl font-bold">
                {stats.totalDeposit.toLocaleString()}
                <span className="text-lg font-normal text-muted-foreground">원</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 만료 예정 알림 (개선된 버전) */}
        {expiringContracts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                계약 만료 알림
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 서포트 메시지 */}
              <div className="rounded-lg bg-white p-4 border-l-4 border-orange-400">
                <p className="font-semibold text-orange-800">
                  💡 3개월 후 {expiringContracts.length}팀 계약 종료 예정입니다.
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  미리 계약 연장 여부 확인해보세요.
                </p>
              </div>

              {/* 계약 목록 */}
              <div className="space-y-2">
                {expiringContracts.map((contract) => {
                  const endDate = new Date(contract.end_date || "");
                  const today = new Date();
                  const daysLeft = Math.ceil(
                    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysLeft <= 30;

                  return (
                    <div
                      key={contract.id}
                      className={`flex items-center justify-between rounded-lg p-3 ${
                        isUrgent ? "bg-red-100 border border-red-300" : "bg-white"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{contract.company_name}</span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isUrgent
                                ? "bg-red-500 text-white"
                                : "bg-orange-500 text-white"
                            }`}
                          >
                            D-{daysLeft}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {contract.room_number} · {contract.end_date}까지 · 담당자:{" "}
                          {contract.contact_person || "-"} ({contract.contact_phone || "-"})
                        </div>
                      </div>
                      <Button
                        variant={isUrgent ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleEdit(contract)}
                        className={isUrgent ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        상세보기
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 재무 대시보드 */}
        <div className="mb-6">
          <FinanceDashboard />
        </div>

        {/* 계약 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              계약 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContractTable
              contracts={contracts}
              onEdit={handleEdit}
              onUpdate={loadData}
            />
          </CardContent>
        </Card>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <ContractModal
          contract={editingContract}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </main>
  );
}
