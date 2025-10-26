"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Contract } from "@/lib/supabase/contracts";
import { createContract, updateContract } from "@/lib/supabase/contracts";

interface ContractModalProps {
  onClose: () => void;
  contract?: Contract | null;
  onUpdate: () => void;
}

export function ContractModal({
  onClose,
  contract,
  onUpdate,
}: ContractModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    space_type: "office" as "office" | "fixed_desk" | "flexible_desk" | "non_resident",
    room_number: "",
    base_capacity: 0,
    max_capacity: 0,
    current_capacity: 0,
    contract_status: "active" as "active" | "pending" | "expired" | "terminated",
    contract_type: "법인" as "법인" | "개인",
    start_date: "",
    end_date: "",
    contract_duration: "",
    monthly_fee: 0,
    management_fee: 0,
    total_monthly_cost: 0,
    deposit: 0,
    discount_rate: 0,
    cms_enabled: false,
    auto_transfer_enabled: false,
    business_number: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    notes: "",
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        company_name: contract.company_name,
        space_type: contract.space_type,
        room_number: contract.room_number || "",
        base_capacity: contract.base_capacity || 0,
        max_capacity: contract.max_capacity || 0,
        current_capacity: contract.current_capacity || 0,
        contract_status: contract.contract_status,
        contract_type: (contract.contract_type === "개인" ? "개인" : "법인") as "법인" | "개인",
        start_date: contract.start_date,
        end_date: contract.end_date || "",
        contract_duration: contract.contract_duration || "",
        monthly_fee: contract.monthly_fee || 0,
        management_fee: contract.management_fee || 0,
        total_monthly_cost: contract.total_monthly_cost || 0,
        deposit: contract.deposit || 0,
        discount_rate: contract.discount_rate || 0,
        cms_enabled: contract.cms_enabled,
        auto_transfer_enabled: contract.auto_transfer_enabled,
        business_number: contract.business_number || "",
        contact_person: contract.contact_person || "",
        contact_phone: contract.contact_phone || "",
        contact_email: contract.contact_email || "",
        notes: contract.notes || "",
      });
    } else {
      // Reset form for new contract
      setFormData({
        company_name: "",
        space_type: "office",
        room_number: "",
        base_capacity: 0,
        max_capacity: 0,
        current_capacity: 0,
        contract_status: "active",
        contract_type: "법인",
        start_date: "",
        end_date: "",
        contract_duration: "",
        monthly_fee: 0,
        management_fee: 0,
        total_monthly_cost: 0,
        deposit: 0,
        discount_rate: 0,
        cms_enabled: false,
        auto_transfer_enabled: false,
        business_number: "",
        contact_person: "",
        contact_phone: "",
        contact_email: "",
        notes: "",
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contractData = {
        ...formData,
        company_id: null,
        non_resident_revenue: formData.space_type === "non_resident" ? formData.total_monthly_cost : null,
        additional_contacts: null,
        special_notes: null,
        room_number: formData.room_number || null,
        end_date: formData.end_date || null,
        business_number: formData.business_number || null,
        notes: formData.notes || null,
      };

      if (contract?.id) {
        await updateContract(contract.id, contractData);
      } else {
        await createContract(contractData);
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving contract:", error);
      alert("계약 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {contract ? "계약 수정" : "새 계약 추가"}
          </DialogTitle>
          <DialogDescription>
            계약 정보를 입력하세요. (*) 표시는 필수 항목입니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">기본 정보</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">회사명 *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="space_type">공간 유형 *</Label>
                <Select
                  value={formData.space_type}
                  onValueChange={(value) => updateField("space_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">독립오피스</SelectItem>
                    <SelectItem value="fixed_desk">지정석</SelectItem>
                    <SelectItem value="flexible_desk">유연좌석</SelectItem>
                    <SelectItem value="non_resident">비상주</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="room_number">호실/좌석번호</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => updateField("room_number", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_type">계약 유형 *</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value) => updateField("contract_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="법인">법인</SelectItem>
                    <SelectItem value="개인">개인</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="base_capacity">기본 인원</Label>
                <Input
                  id="base_capacity"
                  type="number"
                  value={formData.base_capacity}
                  onChange={(e) => updateField("base_capacity", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_capacity">최대 인원</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) => updateField("max_capacity", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_capacity">현재 인원</Label>
                <Input
                  id="current_capacity"
                  type="number"
                  value={formData.current_capacity}
                  onChange={(e) => updateField("current_capacity", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* 계약 기간 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">계약 기간</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="start_date">계약 시작일 *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">계약 종료일</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_duration">계약 기간</Label>
                <Input
                  id="contract_duration"
                  value={formData.contract_duration}
                  onChange={(e) => updateField("contract_duration", e.target.value)}
                  placeholder="예: 12개월"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_status">계약 상태 *</Label>
              <Select
                value={formData.contract_status}
                onValueChange={(value) => updateField("contract_status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">계약중</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="expired">만료</SelectItem>
                  <SelectItem value="terminated">해지</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 비용 정보 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">비용 정보</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthly_fee">월 임대료</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  value={formData.monthly_fee}
                  onChange={(e) => updateField("monthly_fee", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="management_fee">관리비</Label>
                <Input
                  id="management_fee"
                  type="number"
                  value={formData.management_fee}
                  onChange={(e) => updateField("management_fee", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_monthly_cost">총 월 비용 *</Label>
                <Input
                  id="total_monthly_cost"
                  type="number"
                  value={formData.total_monthly_cost}
                  onChange={(e) => updateField("total_monthly_cost", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">보증금</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => updateField("deposit", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_rate">할인율 (%)</Label>
              <Input
                id="discount_rate"
                type="number"
                value={formData.discount_rate}
                onChange={(e) => updateField("discount_rate", parseInt(e.target.value) || 0)}
                min="0"
                max="100"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cms_enabled"
                  checked={formData.cms_enabled}
                  onChange={(e) => updateField("cms_enabled", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="cms_enabled" className="cursor-pointer">CMS 자동이체</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_transfer_enabled"
                  checked={formData.auto_transfer_enabled}
                  onChange={(e) => updateField("auto_transfer_enabled", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="auto_transfer_enabled" className="cursor-pointer">자동이체</Label>
              </div>
            </div>
          </div>

          {/* 담당자 정보 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">담당자 정보</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_person">담당자명 *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => updateField("contact_person", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">연락처 *</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => updateField("contact_phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_email">이메일 *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => updateField("contact_email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_number">사업자번호</Label>
                <Input
                  id="business_number"
                  value={formData.business_number}
                  onChange={(e) => updateField("business_number", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 비고 */}
          <div className="space-y-2">
            <Label htmlFor="notes">비고</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : contract ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
