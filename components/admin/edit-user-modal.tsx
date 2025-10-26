"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/database.types";
import { updateUserAsAdmin } from "@/lib/supabase/admin";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPhoneNumber, unformatPhoneNumber } from "@/lib/utils/phone";

interface EditUserModalProps {
  user: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

const businessTypeLabels = {
  corporation: "법인사업자",
  individual: "개인사업자",
  freelancer: "개인(프리랜서)",
  nonprofit: "비영리/단체",
};

const jobTypeLabels = {
  development: "개발",
  design: "디자인",
  sales: "영업",
  marketing: "마케팅",
  branding: "브랜딩",
  pr: "홍보",
  production: "생산/제조",
  planning: "기획",
  operation: "운영",
  education: "강의/교육",
  research: "연구/리서치",
  hr: "인사",
  strategy: "전략/경영",
};

export function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // 기본 정보 (전화번호는 포맷팅하여 표시)
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone ? formatPhoneNumber(user.phone) : "");
  const [birthDate, setBirthDate] = useState(user.birth_date || "");
  const [snsUrl, setSnsUrl] = useState(user.sns_url || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user.profile_image_url || "");

  // 회원 유형 및 역할
  const [userType, setUserType] = useState<"general" | "tenant">(user.user_type);
  const [role, setRole] = useState(user.role);

  // 회사 정보
  const [companyName, setCompanyName] = useState(user.company_name || "");
  const [ceoName, setCeoName] = useState(user.ceo_name || "");
  const [businessType, setBusinessType] = useState(user.business_type || "");
  const [businessStartDate, setBusinessStartDate] = useState(user.business_start_date || "");
  const [businessNumber, setBusinessNumber] = useState(user.business_registration_number || "");

  // 직무
  const [jobTypes, setJobTypes] = useState<string[]>(user.job_types || []);

  // 파일 URL
  const [businessRegUrl, setBusinessRegUrl] = useState(user.business_registration_url || "");
  const [businessAccountUrl, setBusinessAccountUrl] = useState(user.business_account_url || "");
  const [companyLogoUrl, setCompanyLogoUrl] = useState(user.company_logo_url || "");

  const handleJobTypeToggle = (jobType: string) => {
    setJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(j => j !== jobType)
        : [...prev, jobType]
    );
  };

  const handleSave = async () => {
    // 입주회원 필수 필드 검증
    if (userType === "tenant") {
      if (!companyName || !ceoName || !phone || !businessType ||
          !businessRegUrl || !businessAccountUrl || !companyLogoUrl) {
        toast({
          title: "필수 항목 누락",
          description: "입주회원은 모든 필수 항목을 입력해야 합니다.",
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const result = await updateUserAsAdmin(user.id, {
        // 기본 정보 (전화번호는 하이픈 제거 후 저장)
        full_name: fullName,
        phone: phone ? unformatPhoneNumber(phone) : null,
        birth_date: birthDate || null,
        sns_url: snsUrl || null,
        profile_image_url: profileImageUrl || null,

        // 회원 유형 및 역할
        user_type: userType,
        role,

        // 회사 정보
        company_name: companyName || null,
        ceo_name: ceoName || null,
        business_type: businessType || null,
        business_start_date: businessStartDate || null,
        business_registration_number: businessNumber || null,

        // 직무
        job_types: jobTypes.length > 0 ? jobTypes : null,

        // 파일 URL
        business_registration_url: businessRegUrl || null,
        business_account_url: businessAccountUrl || null,
        company_logo_url: companyLogoUrl || null,
      });

      if (result.success) {
        toast({
          title: "저장 완료",
          description: "회원 정보가 업데이트되었습니다.",
        });
        onUpdate();
        onClose();
      } else {
        toast({
          title: "저장 실패",
          description: result.error || "업데이트 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "저장 실패",
        description: "업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isRequired = (field: string) => {
    if (userType === "tenant") {
      return ["companyName", "ceoName", "phone", "businessType", "businessRegUrl", "businessAccountUrl", "companyLogoUrl"].includes(field);
    }
    return false;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>회원 정보 수정</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="company">회사 정보</TabsTrigger>
            <TabsTrigger value="files">파일 URL</TabsTrigger>
            <TabsTrigger value="system">시스템</TabsTrigger>
          </TabsList>

          {/* 기본 정보 탭 */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">이름 <span className="text-red-500">*</span></Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                연락처
                {isRequired("phone") && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                maxLength={13}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth-date">생년월일</Label>
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sns-url">SNS URL</Label>
              <Input
                id="sns-url"
                type="url"
                placeholder="https://..."
                value={snsUrl}
                onChange={(e) => setSnsUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-image">프로필 사진 URL</Label>
              <Input
                id="profile-image"
                type="url"
                placeholder="https://..."
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* 회사 정보 탭 */}
          <TabsContent value="company" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">
                회사명
                {isRequired("companyName") && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="company-name"
                placeholder="회사명을 입력하세요"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceo-name">
                대표자명
                {isRequired("ceoName") && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="ceo-name"
                placeholder="대표자명을 입력하세요"
                value={ceoName}
                onChange={(e) => setCeoName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">
                사업자 유형
                {isRequired("businessType") && <span className="text-red-500"> *</span>}
              </Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger id="business-type">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(businessTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-start">개업연월일</Label>
              <Input
                id="business-start"
                type="date"
                value={businessStartDate}
                onChange={(e) => setBusinessStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-number">사업자등록번호 (10자리)</Label>
              <Input
                id="business-number"
                placeholder="1234567890"
                maxLength={10}
                value={businessNumber}
                onChange={(e) => setBusinessNumber(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="space-y-2">
              <Label>직무 (다중 선택 가능)</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(jobTypeLabels).map(([value, label]) => (
                  <label key={value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobTypes.includes(value)}
                      onChange={() => handleJobTypeToggle(value)}
                      className="rounded"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 파일 URL 탭 */}
          <TabsContent value="files" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-reg-url">
                사업자등록증 URL
                {isRequired("businessRegUrl") && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="business-reg-url"
                type="url"
                placeholder="https://..."
                value={businessRegUrl}
                onChange={(e) => setBusinessRegUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supabase Storage 또는 외부 스토리지의 파일 URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-account-url">
                사업자통장 URL
                {isRequired("businessAccountUrl") && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="business-account-url"
                type="url"
                placeholder="https://..."
                value={businessAccountUrl}
                onChange={(e) => setBusinessAccountUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supabase Storage 또는 외부 스토리지의 파일 URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-logo-url">
                회사 로고 URL
                {isRequired("companyLogoUrl") && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                id="company-logo-url"
                type="url"
                placeholder="https://..."
                value={companyLogoUrl}
                onChange={(e) => setCompanyLogoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supabase Storage 또는 외부 스토리지의 파일 URL
              </p>
            </div>
          </TabsContent>

          {/* 시스템 탭 */}
          <TabsContent value="system" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-type">회원 유형 <span className="text-red-500">*</span></Label>
              <Select value={userType} onValueChange={(v) => setUserType(v as "general" | "tenant")}>
                <SelectTrigger id="user-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반 회원</SelectItem>
                  <SelectItem value="tenant">입주 회원</SelectItem>
                </SelectContent>
              </Select>
              {userType === "tenant" && (
                <p className="text-sm text-orange-600">
                  ⚠️ 입주 회원으로 변경 시 회사 정보와 파일 URL이 모두 필수입니다.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">역할 <span className="text-red-500">*</span></Label>
              <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="tenant_leader">팀 리더</SelectItem>
                  <SelectItem value="tenant_manager">매니저</SelectItem>
                  <SelectItem value="tenant_member">팀원</SelectItem>
                  <SelectItem value="general">일반 회원</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-2 font-semibold">시스템 정보</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>개인 포인트: {user.personal_points}P</p>
                <p>팀 포인트: {user.team_points}P</p>
                <p>가입일: {new Date(user.created_at).toLocaleDateString("ko-KR")}</p>
                <p>수정일: {new Date(user.updated_at).toLocaleDateString("ko-KR")}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !fullName}
            className="bg-teal hover:bg-teal-600"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
