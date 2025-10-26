"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, AlertCircle } from "lucide-react";
import type { Contract } from "@/lib/supabase/contracts";
import { format, parseISO, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

interface ContractTableProps {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onUpdate: () => void;
}

const spaceTypeLabels = {
  office: "독립오피스",
  fixed_desk: "지정석",
  flexible_desk: "유연좌석",
  non_resident: "비상주",
};

const statusLabels = {
  active: "계약중",
  pending: "대기",
  expired: "만료",
  terminated: "해지",
};

export function ContractTable({ contracts, onEdit, onUpdate }: ContractTableProps) {
  if (contracts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        등록된 계약이 없습니다.
      </div>
    );
  }

  const getDaysUntilExpiry = (endDate: string | null): number | null => {
    if (!endDate) return null;
    const today = new Date();
    const expiry = parseISO(endDate);
    return differenceInDays(expiry, today);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회사명</TableHead>
            <TableHead>공간</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>계약기간</TableHead>
            <TableHead>월 비용</TableHead>
            <TableHead>보증금</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => {
            const daysUntilExpiry = contract.end_date
              ? getDaysUntilExpiry(contract.end_date)
              : null;
            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

            return (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.company_name}</TableCell>
                <TableCell>
                  {spaceTypeLabels[contract.space_type]}
                  {contract.room_number && ` ${contract.room_number}`}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        contract.contract_status === "active"
                          ? "bg-teal/10 text-teal"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[contract.contract_status]}
                    </span>
                    {isExpiringSoon && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {format(parseISO(contract.start_date), "yy.MM.dd", { locale: ko })}
                  {contract.end_date && (
                    <>
                      {" ~ "}
                      {format(parseISO(contract.end_date), "yy.MM.dd", { locale: ko })}
                    </>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {contract.total_monthly_cost.toLocaleString()}원
                </TableCell>
                <TableCell>{contract.deposit.toLocaleString()}원</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(contract)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
