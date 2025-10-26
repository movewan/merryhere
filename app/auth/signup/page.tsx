"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserType, BusinessType, JobType } from "@/lib/supabase/database.types";

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "development", label: "개발" },
  { value: "design", label: "디자인" },
  { value: "sales", label: "영업" },
  { value: "marketing", label: "마케팅" },
  { value: "branding", label: "브랜딩" },
  { value: "pr", label: "홍보" },
  { value: "production", label: "생산/제조" },
  { value: "planning", label: "기획" },
  { value: "operation", label: "운영" },
  { value: "education", label: "강의/교육" },
  { value: "research", label: "연구/리서치" },
  { value: "hr", label: "인사" },
  { value: "strategy", label: "전략/경영" },
];

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 가입 목적
  const [userType, setUserType] = useState<UserType>("general");

  // 기본 정보
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // 입주회원 정보
  const [companyName, setCompanyName] = useState("");
  const [ceoName, setCeoName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [businessStartDate, setBusinessStartDate] = useState("");

  // 직무 (다중 선택)
  const [selectedJobs, setSelectedJobs] = useState<JobType[]>([]);

  // 대표자/중간관리자
  const [isLeader, setIsLeader] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // 파일
  const [businessRegFile, setBusinessRegFile] = useState<File | null>(null);
  const [businessAccFile, setBusinessAccFile] = useState<File | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);

  // 연락처 자동 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // 직무 토글
  const toggleJob = (job: JobType) => {
    setSelectedJobs((prev) =>
      prev.includes(job) ? prev.filter((j) => j !== job) : [...prev, job]
    );
  };

  // 파일 업로드 함수
  const uploadFile = async (file: File, bucket: string, path: string) => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 비밀번호 확인
      if (password !== confirmPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }

      // 이메일 형식 검증
      if (!email.includes("@")) {
        throw new Error("올바른 이메일 형식을 입력해주세요.");
      }

      // 입주회원 필수 필드 검증
      if (userType === "tenant") {
        if (!companyName) throw new Error("회사명은 필수입니다.");
        if (!ceoName) throw new Error("대표자명은 필수입니다.");
        if (!businessType) throw new Error("사업자유형은 필수입니다.");
        if (!businessRegFile) throw new Error("사업자등록증은 필수입니다.");
        if (!businessAccFile) throw new Error("사업자통장은 필수입니다.");
        if (!companyLogoFile) throw new Error("회사 로고는 필수입니다.");
      }

      const supabase = createClient();

      // 1. 파일 업로드 (입주회원인 경우)
      let businessRegUrl = null;
      let businessAccUrl = null;
      let companyLogoUrl = null;

      if (userType === "tenant") {
        if (businessRegFile) {
          businessRegUrl = await uploadFile(
            businessRegFile,
            "business-documents",
            "registrations"
          );
        }
        if (businessAccFile) {
          businessAccUrl = await uploadFile(
            businessAccFile,
            "business-documents",
            "accounts"
          );
        }
        if (companyLogoFile) {
          companyLogoUrl = await uploadFile(
            companyLogoFile,
            "company-logos",
            "logos"
          );
        }
      }

      // 2. 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 3. 프로필 업데이트
        const profileData: any = {
          user_type: userType,
          phone: phone.replace(/-/g, ""),
        };

        // 입주회원 추가 정보
        if (userType === "tenant") {
          profileData.company_name = companyName;
          profileData.ceo_name = ceoName;
          profileData.business_type = businessType;
          profileData.business_start_date = businessStartDate || null;
          profileData.job_types = selectedJobs.length > 0 ? selectedJobs : null;
          profileData.is_leader = isLeader;
          profileData.is_manager = isManager;
          profileData.business_registration_url = businessRegUrl;
          profileData.business_account_url = businessAccUrl;
          profileData.company_logo_url = companyLogoUrl;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", authData.user.id);

        if (profileError) throw profileError;

        // 4. 이메일 발송
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "signup",
              data: {
                name: userType === "tenant" ? ceoName : "신규 회원",
                email: email,
                phone: phone,
                company: userType === "tenant" ? companyName : null,
                businessNumber: null,
                userType: userType,
              },
            }),
          });
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
          // 이메일 실패해도 회원가입은 성공으로 처리
        }
      }

      // 성공 - 로그인 페이지로 이동
      router.push(
        "/auth/login?message=" + encodeURIComponent("회원가입이 완료되었습니다. 로그인해주세요.")
      );
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const isTenant = userType === "tenant";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold text-teal">MERRY HERE</div>
          </div>
          <CardTitle className="text-2xl text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            메리히어 회원이 되어 다양한 서비스를 이용하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 가입 목적 */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                가입 목적 <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType("general")}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    userType === "general"
                      ? "border-teal bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">일반 회원</div>
                  <div className="text-sm text-gray-600">
                    메리히어 관심 회원으로 온라인 회원 활동
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("tenant")}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    userType === "tenant"
                      ? "border-teal bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">입주 회원</div>
                  <div className="text-sm text-gray-600">
                    메리히어 입주 회원으로 입주기업, 미팅룸 예약 가능
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* 연락처 */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  연락처 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  비밀번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="최소 6자 이상"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 입주회원 전용 필드 */}
            {isTenant && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">입주 회원 정보</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 회사명 */}
                    <div className="space-y-2">
                      <Label htmlFor="company_name">
                        회사명 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    {/* 대표자명 */}
                    <div className="space-y-2">
                      <Label htmlFor="ceo_name">
                        대표자명 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ceo_name"
                        value={ceoName}
                        onChange={(e) => setCeoName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    {/* 사업자유형 */}
                    <div className="space-y-2">
                      <Label htmlFor="business_type">
                        사업자유형 <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={businessType}
                        onValueChange={(value) => setBusinessType(value as BusinessType)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corporation">법인사업자</SelectItem>
                          <SelectItem value="individual">개인사업자</SelectItem>
                          <SelectItem value="freelancer">개인(프리랜서)</SelectItem>
                          <SelectItem value="nonprofit">비영리/단체</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 개업연월일 */}
                    <div className="space-y-2">
                      <Label htmlFor="business_start_date">개업연월일</Label>
                      <Input
                        id="business_start_date"
                        type="date"
                        value={businessStartDate}
                        onChange={(e) => setBusinessStartDate(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* 입주기업 대표자 */}
                  <div className="space-y-2 mt-4">
                    <Label>입주기업 대표자</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_leader"
                          checked={isLeader}
                          onCheckedChange={(checked) => setIsLeader(checked as boolean)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="is_leader"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          대표자
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_manager"
                          checked={isManager}
                          onCheckedChange={(checked) => setIsManager(checked as boolean)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="is_manager"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          중간관리자
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      대표자 또는 중간관리자는 소속 회원을 관리할 수 있습니다.
                    </p>
                  </div>

                  {/* 직무 (다중 선택) */}
                  <div className="space-y-2 mt-4">
                    <Label>직무</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {JOB_TYPES.map((job) => (
                        <div key={job.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`job-${job.value}`}
                            checked={selectedJobs.includes(job.value)}
                            onCheckedChange={() => toggleJob(job.value)}
                            disabled={isLoading}
                          />
                          <label
                            htmlFor={`job-${job.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {job.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 파일 업로드 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* 사업자등록증 */}
                    <div className="space-y-2">
                      <Label htmlFor="business_reg">
                        사업자등록증 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="business_reg"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setBusinessRegFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
                    </div>

                    {/* 사업자통장 */}
                    <div className="space-y-2">
                      <Label htmlFor="business_acc">
                        사업자통장 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="business_acc"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setBusinessAccFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
                    </div>

                    {/* 회사 로고 */}
                    <div className="space-y-2">
                      <Label htmlFor="company_logo">
                        회사 로고 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_logo"
                        type="file"
                        accept=".ai,.psd,.pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setCompanyLogoFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">AI, PSD, PDF, JPG, PNG</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "가입 처리 중..." : "회원가입"}
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground">
              회원가입을 진행하면{" "}
              <Link href="/terms" className="underline hover:text-primary">
                이용약관
              </Link>{" "}
              및{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                개인정보처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/auth/login"
              className="text-teal hover:underline font-medium"
            >
              로그인
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
