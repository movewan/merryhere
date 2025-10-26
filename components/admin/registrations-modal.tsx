"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Program } from "@/lib/supabase/database.types";
import { getProgramRegistrations, markAttendance } from "@/lib/supabase/admin";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface RegistrationsModalProps {
  program: Program;
  onClose: () => void;
  onUpdate: () => void;
}

interface Registration {
  id: string;
  user_id: string;
  program_id: string;
  status: string;
  registered_at: string;
  profiles: {
    full_name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
  } | null;
}

export function RegistrationsModal({ program, onClose, onUpdate }: RegistrationsModalProps) {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, [program.id]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await getProgramRegistrations(program.id);
      setRegistrations(data as Registration[]);
    } catch (error) {
      console.error("Failed to load registrations:", error);
      toast({
        title: "오류",
        description: "신청자 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (registrationId: string) => {
    setMarking(registrationId);
    try {
      const result = await markAttendance(registrationId);

      if (result.success) {
        toast({
          title: "처리 완료",
          description: "참석 확인 처리되었습니다.",
        });
        await loadRegistrations();
        onUpdate();
      } else {
        toast({
          title: "처리 실패",
          description: result.error || "처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Mark attendance error:", error);
      toast({
        title: "처리 실패",
        description: "처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setMarking(null);
    }
  };

  const statusLabels: Record<string, string> = {
    registered: "신청",
    attended: "참석",
    cancelled: "취소",
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {program.title} - 신청자 목록 ({registrations.length}명)
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              신청자가 없습니다.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>회사명</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">
                        {reg.profiles?.full_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reg.profiles?.email || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {reg.profiles?.phone || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {reg.profiles?.company_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(parseISO(reg.registered_at), "yyyy.MM.dd HH:mm", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            reg.status === "attended"
                              ? "bg-blue-100 text-blue-700"
                              : reg.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-teal/10 text-teal"
                          }`}
                        >
                          {statusLabels[reg.status] || reg.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {reg.status === "registered" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAttendance(reg.id)}
                            disabled={marking === reg.id}
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          >
                            {marking === reg.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                참석 확인
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
