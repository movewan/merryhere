"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Users } from "lucide-react";
import type { Program } from "@/lib/supabase/database.types";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { deleteProgram } from "@/lib/supabase/admin";
import { useToast } from "@/hooks/use-toast";
import { RegistrationsModal } from "./registrations-modal";

interface ProgramTableProps {
  programs: Program[];
  onEdit: (program: Program) => void;
  onUpdate: () => void;
}

export function ProgramTable({ programs, onEdit, onUpdate }: ProgramTableProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<Program | null>(null);

  const handleDelete = async (program: Program) => {
    if (!confirm(`"${program.title}" 프로그램을 삭제하시겠습니까?`)) {
      return;
    }

    setDeleting(program.id);
    try {
      const result = await deleteProgram(program.id);

      if (result.success) {
        toast({
          title: "삭제 완료",
          description: "프로그램이 삭제되었습니다.",
        });
        onUpdate();
      } else {
        toast({
          title: "삭제 실패",
          description: result.error || "삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (programs.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        등록된 프로그램이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>프로그램명</TableHead>
              <TableHead>일시</TableHead>
              <TableHead>신청 현황</TableHead>
              <TableHead>신청 마감</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => {
              const startDate = parseISO(program.start_datetime);
              const registrationDeadline = program.registration_deadline
                ? parseISO(program.registration_deadline)
                : null;

              return (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.title}</TableCell>
                  <TableCell className="text-sm">
                    {format(startDate, "yyyy.MM.dd (E) HH:mm", { locale: ko })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingRegistrations(program)}
                      className="h-auto p-0 font-semibold"
                    >
                      {program.current_participants} / {program.max_participants}명
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {registrationDeadline
                      ? format(registrationDeadline, "MM.dd HH:mm", { locale: ko })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(program)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingRegistrations(program)}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(program)}
                        disabled={deleting === program.id}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 신청자 목록 모달 */}
      {viewingRegistrations && (
        <RegistrationsModal
          program={viewingRegistrations}
          onClose={() => setViewingRegistrations(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
