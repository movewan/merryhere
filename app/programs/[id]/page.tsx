"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getProgramById,
  checkUserRegistration,
  registerProgram,
  cancelProgramRegistration,
  isProgramAvailable,
} from "@/lib/supabase/programs";
import { getCurrentUser } from "@/app/auth/actions";
import type { Program, ProgramRegistration } from "@/lib/supabase/database.types";
import { format, isPast, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [registration, setRegistration] = useState<ProgramRegistration | null>(
    null
  );
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [programId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const programData = await getProgramById(programId);
      setProgram(programData);

      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        const registrationData = await checkUserRegistration(
          programId,
          user.id
        );
        setRegistration(registrationData);
      }
    } catch (error) {
      console.error("Failed to load program:", error);
      toast({
        title: "오류",
        description: "프로그램 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!userId) {
      toast({
        title: "로그인 필요",
        description: "프로그램 신청을 위해 로그인해주세요.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    if (!confirm("이 프로그램에 신청하시겠습니까?")) {
      return;
    }

    setActionLoading(true);

    try {
      const result = await registerProgram(programId, userId);

      if (result.success) {
        toast({
          title: "신청 완료",
          description: "프로그램 신청이 완료되었습니다.",
        });
        loadData();
      } else {
        toast({
          title: "신청 실패",
          description: result.error || "신청 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "신청 실패",
        description: "신청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("신청을 취소하시겠습니까?")) {
      return;
    }

    setActionLoading(true);

    try {
      const result = await cancelProgramRegistration(programId, userId);

      if (result.success) {
        toast({
          title: "취소 완료",
          description: "신청이 취소되었습니다.",
        });
        loadData();
      } else {
        toast({
          title: "취소 실패",
          description: result.error || "취소 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast({
        title: "취소 실패",
        description: "취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!program) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-lg border bg-gray-50 p-12 text-center">
            <p className="text-lg font-semibold">프로그램을 찾을 수 없습니다</p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const startDate = parseISO(program.start_datetime);
  const endDate = parseISO(program.end_datetime);
  const isProgramPast = isPast(endDate);
  const canRegister = isProgramAvailable(program);
  const isRegistered = registration?.status === "registered";
  const isAttended = registration?.status === "attended";

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* 뒤로가기 */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 왼쪽: 이미지 & 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 썸네일 */}
            <div className="relative h-96 overflow-hidden rounded-2xl">
              {program.thumbnail_url ? (
                <Image
                  src={program.thumbnail_url}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600">
                  <span className="text-9xl text-white/80">📚</span>
                </div>
              )}
            </div>

            {/* 제목 & 설명 */}
            <div>
              <h1 className="mb-4 text-4xl font-bold">{program.title}</h1>
              {program.description && (
                <p className="text-lg text-muted-foreground">
                  {program.description}
                </p>
              )}
            </div>

            {/* 상세 내용 */}
            {program.detailed_content && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-2xl font-bold">프로그램 소개</h2>
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {program.detailed_content}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 추가 이미지 */}
            {program.images && program.images.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-2xl font-bold">갤러리</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {program.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-48 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={image}
                          alt={`${program.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오른쪽: 신청 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                {/* 상태 */}
                {isRegistered && (
                  <div className="flex items-center gap-2 rounded-lg bg-teal/10 p-4 text-teal">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">신청 완료</span>
                  </div>
                )}
                {isAttended && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-4 text-blue-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">참석 완료</span>
                  </div>
                )}
                {isProgramPast && !isAttended && (
                  <div className="flex items-center gap-2 rounded-lg bg-gray-200 p-4 text-gray-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">종료된 프로그램</span>
                  </div>
                )}

                {/* 정보 */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">일시</div>
                      <div className="text-sm text-muted-foreground">
                        {format(startDate, "yyyy년 M월 d일 (E)", { locale: ko })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">시간</div>
                      <div className="text-sm text-muted-foreground">
                        {format(startDate, "HH:mm")} ~ {format(endDate, "HH:mm")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">참가 인원</div>
                      <div className="text-sm text-muted-foreground">
                        {program.current_participants} / {program.max_participants}명
                        {program.current_participants < program.max_participants && (
                          <span className="ml-2 text-teal">
                            ({program.max_participants - program.current_participants}
                            석 남음)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {program.registration_deadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">신청 마감</div>
                        <div className="text-sm text-muted-foreground">
                          {format(
                            parseISO(program.registration_deadline),
                            "yyyy년 M월 d일 HH:mm",
                            { locale: ko }
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 버튼 */}
                {!isProgramPast && (
                  <>
                    {isRegistered ? (
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="w-full text-red-600 hover:bg-red-50"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "처리 중..." : "신청 취소"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleRegister}
                        className="w-full bg-teal hover:bg-teal-600"
                        disabled={!canRegister || actionLoading}
                      >
                        {actionLoading
                          ? "처리 중..."
                          : canRegister
                          ? "신청하기"
                          : "신청 불가"}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
