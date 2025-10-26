"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, Building2, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const officeTypes = [
  { value: "independent", label: "독립 오피스" },
  { value: "fixed_desk", label: "고정 좌석" },
  { value: "flexible", label: "유연 좌석" },
  { value: "meeting_only", label: "미팅룸만 이용" },
  { value: "undecided", label: "아직 미정" },
];

export function InquirySection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    officeType: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, officeType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 이메일 발송 API 호출
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "inquiry",
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.companyName,
            inquiryType: formData.officeType || "tenant",
            message: formData.message || "문의 내용 없음",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "문의가 접수되었습니다!",
          description: "담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.",
        });

        // 폼 초기화
        setFormData({
          name: "",
          email: "",
          phone: "",
          companyName: "",
          officeType: "",
          message: "",
        });
      } else {
        throw new Error(result.error || "이메일 발송 실패");
      }
    } catch (error) {
      console.error("Inquiry submission error:", error);
      toast({
        title: "오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section id="inquiry" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* 왼쪽: 정보 */}
            <div className="space-y-8">
              <div>
                <div className="mb-4 inline-block rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">
                  입주 문의
                </div>
                <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                  함께 성장할
                  <br />
                  <span className="text-teal">여러분을 기다립니다</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  MERRYHERE는 소셜벤처의 성장을 지원하는 공유 오피스입니다.
                  <br />
                  입주 문의를 남겨주시면 담당자가 빠르게 연락드리겠습니다.
                </p>
              </div>

              {/* 연락처 정보 */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="rounded-lg bg-teal/10 p-3">
                    <Phone className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">전화 문의</div>
                    <a
                      href="tel:02-2123-4567"
                      className="text-muted-foreground hover:text-teal"
                    >
                      02-2123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="rounded-lg bg-teal/10 p-3">
                    <Mail className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">이메일 문의</div>
                    <a
                      href="mailto:merryhere@mysc.co.kr"
                      className="text-muted-foreground hover:text-teal"
                    >
                      merryhere@mysc.co.kr
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="rounded-lg bg-teal/10 p-3">
                    <Building2 className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">방문 상담</div>
                    <p className="text-muted-foreground">
                      서울시 성동구 성수동2가
                      <br />
                      평일 10:00 - 18:00 (사전 예약 필수)
                    </p>
                  </div>
                </div>
              </div>

              {/* 참고 사항 */}
              <div className="rounded-lg bg-gray-50 p-6">
                <h4 className="mb-3 font-semibold">📌 참고사항</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-teal">•</span>
                    <span>입주 문의 접수 후 1-2 영업일 내 연락드립니다</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal">•</span>
                    <span>공간 투어는 사전 예약제로 운영됩니다</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal">•</span>
                    <span>계약 전 무료 체험 데이 이용 가능합니다</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 오른쪽: 폼 */}
            <div className="rounded-2xl border bg-white p-8 shadow-lg lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* 이메일 */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="hello@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* 전화번호 */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    전화번호 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* 회사명 */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명 / 단체명</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="(주)메리히어"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>

                {/* 희망 공간 타입 */}
                <div className="space-y-2">
                  <Label htmlFor="officeType">희망 공간 타입</Label>
                  <Select value={formData.officeType} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {officeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 문의 내용 */}
                <div className="space-y-2">
                  <Label htmlFor="message">문의 내용</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="궁금하신 사항을 자유롭게 작성해주세요."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                {/* 제출 버튼 */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-teal hover:bg-teal-600"
                  disabled={isSubmitting || isSubmitted}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      제출 완료
                    </>
                  ) : isSubmitting ? (
                    "제출 중..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      문의하기
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
