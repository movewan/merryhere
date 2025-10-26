"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, DollarSign, Users, AlertCircle } from "lucide-react";
import { getMyContracts, type Contract } from "@/lib/supabase/contracts";
import { getCurrentUser } from "@/app/auth/actions";
import { format, parseISO, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

const spaceTypeLabels = {
  office: "독립 오피스",
  fixed_desk: "고정 좌석",
  flexible_desk: "유연 좌석",
  non_resident: "비상주 오피스",
};

const contractStatusLabels = {
  active: "계약 중",
  pending: "계약 대기",
  expired: "만료",
  terminated: "해지",
};

export function ContractStatus({ userId }: { userId: string }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, [userId]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const data = await getMyContracts(userId);
      setContracts(data);
    } catch (error) {
      console.error("Failed to load contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (endDate: string | null): number | null => {
    if (!endDate) return null;
    const today = new Date();
    const expiry = parseISO(endDate);
    return differenceInDays(expiry, today);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            계약 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            등록된 계약 정보가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {contracts.map((contract) => {
        const daysUntilExpiry = contract.end_date
          ? getDaysUntilExpiry(contract.end_date)
          : null;
        const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30;

        return (
          <Card key={contract.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  계약 정보
                </CardTitle>
                <div className="flex gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      contract.contract_status === "active"
                        ? "bg-teal/10 text-teal"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {contractStatusLabels[contract.contract_status]}
                  </span>
                  {isExpiringSoon && (
                    <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      <AlertCircle className="h-3 w-3" />
                      만료 임박
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">
                      공간 유형
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold">
                        {spaceTypeLabels[contract.space_type]}
                      </div>
                      {contract.room_number && (
                        <div className="text-sm text-muted-foreground">
                          ({contract.room_number})
                        </div>
                      )}
                    </div>
                  </div>

                  {contract.base_capacity && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-muted-foreground">
                        <Users className="inline h-4 w-4" /> 이용 인원
                      </div>
                      <div className="text-lg">
                        기준 {contract.base_capacity}명
                        {contract.max_capacity && ` / 최대 ${contract.max_capacity}명`}
                        {contract.current_capacity && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            (현재 {contract.current_capacity}명)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">
                      <Calendar className="inline h-4 w-4" /> 계약 기간
                    </div>
                    <div className="text-lg">
                      {format(parseISO(contract.start_date), "yyyy.MM.dd", {
                        locale: ko,
                      })}
                      {contract.end_date && (
                        <>
                          {" ~ "}
                          {format(parseISO(contract.end_date), "yyyy.MM.dd", {
                            locale: ko,
                          })}
                        </>
                      )}
                    </div>
                    {contract.contract_duration && (
                      <div className="text-sm text-muted-foreground">
                        ({contract.contract_duration})
                      </div>
                    )}
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                      <div
                        className={`mt-1 text-sm ${
                          isExpiringSoon ? "font-semibold text-orange-600" : "text-muted-foreground"
                        }`}
                      >
                        만료까지 {daysUntilExpiry}일 남음
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 비용 정보 */}
              <div className="rounded-lg bg-gray-50 p-6">
                <h4 className="mb-4 flex items-center gap-2 font-semibold">
                  <DollarSign className="h-5 w-5" />
                  비용 정보
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="mb-1 text-sm text-muted-foreground">월 임대료</div>
                    <div className="text-lg font-bold">
                      {contract.monthly_fee.toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-muted-foreground">
                      월 관리비
                    </div>
                    <div className="text-lg font-bold">
                      {contract.management_fee.toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-muted-foreground">
                      월 총액 (VAT 포함)
                    </div>
                    <div className="text-xl font-bold text-teal">
                      {contract.total_monthly_cost.toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-muted-foreground">보증금</div>
                    <div className="text-lg font-bold">
                      {contract.deposit.toLocaleString()}원
                    </div>
                  </div>
                </div>

                {contract.discount_rate && contract.discount_rate > 0 && (
                  <div className="mt-4 rounded-md bg-teal/10 p-3 text-sm text-teal">
                    💰 할인율: {contract.discount_rate}% 적용 중
                  </div>
                )}
              </div>

              {/* 결제 정보 */}
              <div className="flex gap-4 text-sm">
                {contract.cms_enabled && (
                  <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-blue-700">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    CMS 자동이체
                  </div>
                )}
                {contract.auto_transfer_enabled && (
                  <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-green-700">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    자동이체
                  </div>
                )}
              </div>

              {/* 특이사항 */}
              {(contract.notes || contract.special_notes) && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h5 className="mb-2 font-semibold">특이사항</h5>
                  {contract.notes && (
                    <p className="mb-2 text-sm text-muted-foreground">
                      {contract.notes}
                    </p>
                  )}
                  {contract.special_notes && (
                    <p className="text-sm text-orange-600">{contract.special_notes}</p>
                  )}
                </div>
              )}

              {/* 담당자 정보 */}
              {contract.contact_person && (
                <div className="text-sm text-muted-foreground">
                  담당자: {contract.contact_person}
                  {contract.contact_phone && ` · ${contract.contact_phone}`}
                  {contract.contact_email && ` · ${contract.contact_email}`}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
