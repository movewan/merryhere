"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, CheckCircle2, X, XCircle } from "lucide-react";
import { getMyRegistrations, cancelProgramRegistration } from "@/lib/supabase/programs";
import { getCurrentUser } from "@/app/auth/actions";
import type { ProgramRegistration } from "@/lib/supabase/database.types";
import { format, isPast, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export function MyRegistrations() {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<ProgramRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        const data = await getMyRegistrations(user.id);
        setRegistrations(data);
      }
    } catch (error) {
      console.error("Failed to load registrations:", error);
      toast({
        title: "오류",
        description: "신청 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (programId: string, registrationId: string) => {
    if (!confirm("정말 신청을 취소하시겠습니까?")) {
      return;
    }

    setCancellingId(registrationId);

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const result = await cancelProgramRegistration(programId, user.id);

      if (result.success) {
        toast({
          title: "취소 완료",
          description: "신청이 취소되었습니다.",
        });
        loadRegistrations();
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
      setCancellingId(null);
    }
  };

  const isProgramPast = (registration: ProgramRegistration): boolean => {
    if (!registration.programs) return false;
    try {
      const endDate = parseISO(registration.programs.end_datetime);
      return isPast(endDate);
    } catch {
      return false;
    }
  };

  const upcomingRegistrations = registrations.filter(
    (r) => r.status === "registered" && !isProgramPast(r)
  );
  const pastRegistrations = registrations.filter(
    (r) =>
      (r.status === "registered" && isProgramPast(r)) ||
      r.status === "attended"
  );
  const cancelledRegistrations = registrations.filter(
    (r) => r.status === "cancelled"
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-muted-foreground">신청 내역이 없습니다</p>
          <Button asChild className="mt-4 bg-teal hover:bg-teal-600">
            <Link href="/programs">프로그램 둘러보기</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const RegistrationCard = ({ registration }: { registration: ProgramRegistration }) => {
    const program = registration.programs;
    if (!program) return null;

    const startDate = parseISO(program.start_datetime);
    const endDate = parseISO(program.end_datetime);
    const past = isProgramPast(registration);
    const canCancel = !past && registration.status === "registered";

    return (
      <Card className={registration.status === "cancelled" ? "opacity-60" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h4 className="font-bold">{program.title}</h4>
                {registration.status === "cancelled" && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    취소됨
                  </span>
                )}
                {registration.status === "attended" && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    참석 완료
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(startDate, "yyyy년 M월 d일 (E)", { locale: ko })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(startDate, "HH:mm")} ~ {format(endDate, "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {program.current_participants} / {program.max_participants}명
                  </span>
                </div>
              </div>

              {program.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {program.description}
                </p>
              )}

              <div className="mt-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-teal hover:bg-teal/10"
                >
                  <Link href={`/programs/${program.id}`}>상세 보기 →</Link>
                </Button>
              </div>
            </div>

            {/* 취소 버튼 */}
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(program.id, registration.id)}
                disabled={cancellingId === registration.id}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 예정된 신청 */}
      {upcomingRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal" />
              예정된 프로그램 ({upcomingRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingRegistrations.map((registration) => (
              <RegistrationCard key={registration.id} registration={registration} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* 지난 신청 */}
      {pastRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              지난 프로그램 ({pastRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastRegistrations.slice(0, 5).map((registration) => (
              <RegistrationCard key={registration.id} registration={registration} />
            ))}
            {pastRegistrations.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                그 외 {pastRegistrations.length - 5}개
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 취소된 신청 */}
      {cancelledRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-5 w-5" />
              취소된 신청 ({cancelledRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cancelledRegistrations.slice(0, 3).map((registration) => (
              <RegistrationCard key={registration.id} registration={registration} />
            ))}
            {cancelledRegistrations.length > 3 && (
              <p className="text-center text-sm text-muted-foreground">
                그 외 {cancelledRegistrations.length - 3}개
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
