"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Program } from "@/lib/supabase/database.types";
import { createProgram, updateProgram } from "@/lib/supabase/admin";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface ProgramModalProps {
  program?: Program | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProgramModal({ program, onClose, onUpdate }: ProgramModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");

  useEffect(() => {
    if (program) {
      setTitle(program.title);
      setDescription(program.description || "");
      setStartDatetime(
        format(parseISO(program.start_datetime), "yyyy-MM-dd'T'HH:mm")
      );
      setEndDatetime(
        format(parseISO(program.end_datetime), "yyyy-MM-dd'T'HH:mm")
      );
      setRegistrationDeadline(
        program.registration_deadline
          ? format(parseISO(program.registration_deadline), "yyyy-MM-dd'T'HH:mm")
          : ""
      );
      setMaxParticipants(program.max_participants.toString());
    }
  }, [program]);

  const handleSave = async () => {
    const maxNum = parseInt(maxParticipants);

    if (!title.trim()) {
      toast({
        title: "입력 오류",
        description: "프로그램명을 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    if (!startDatetime || !endDatetime) {
      toast({
        title: "입력 오류",
        description: "시작/종료 일시를 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(maxNum) || maxNum <= 0) {
      toast({
        title: "입력 오류",
        description: "올바른 최대 인원을 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const programData = {
        title: title.trim(),
        description: description.trim() || null,
        detailed_content: null,
        start_datetime: new Date(startDatetime).toISOString(),
        end_datetime: new Date(endDatetime).toISOString(),
        registration_deadline: registrationDeadline
          ? new Date(registrationDeadline).toISOString()
          : null,
        max_participants: maxNum,
        thumbnail_url: null,
        images: null,
        is_active: true,
        created_by: null,
      };

      const result = program
        ? await updateProgram(program.id, programData)
        : await createProgram(programData);

      if (result.success) {
        toast({
          title: "저장 완료",
          description: `프로그램이 ${program ? "수정" : "등록"}되었습니다.`,
        });
        onUpdate();
      } else {
        toast({
          title: "저장 실패",
          description: result.error || "저장 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{program ? "프로그램 수정" : "프로그램 추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">프로그램명 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 창업 멘토링"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로그램에 대한 설명을 입력하세요"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">시작 일시 *</Label>
              <Input
                id="start"
                type="datetime-local"
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">종료 일시 *</Label>
              <Input
                id="end"
                type="datetime-local"
                value={endDatetime}
                onChange={(e) => setEndDatetime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">신청 마감 일시</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">최대 인원 *</Label>
              <Input
                id="max"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="20"
                min="1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
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
