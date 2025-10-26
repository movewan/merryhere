"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Coins, Clock, Calendar, AlertCircle } from "lucide-react";
import {
  getMeetingRoomById,
  getUserPoints,
  createRoomBooking,
} from "@/lib/supabase/rooms";
import { getCurrentUser } from "@/app/auth/actions";
import type { MeetingRoom } from "@/lib/supabase/database.types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  date: Date;
  startTime: string;
  endTime: string;
  onBookingComplete: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  roomId,
  date,
  startTime,
  endTime,
  onBookingComplete,
}: BookingModalProps) {
  const { toast } = useToast();
  const [room, setRoom] = useState<MeetingRoom | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [personalPoints, setPersonalPoints] = useState(0);
  const [teamPoints, setTeamPoints] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [useTeamPoints, setUseTeamPoints] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && roomId) {
      loadData();
    }
  }, [isOpen, roomId]);

  const loadData = async () => {
    try {
      // 회의실 정보 가져오기
      const roomData = await getMeetingRoomById(roomId);
      setRoom(roomData);

      // 사용자 정보 가져오기
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        const points = await getUserPoints(user.id);
        setPersonalPoints(points.personalPoints);
        setTeamPoints(points.teamPoints);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 예약 시간(분) 계산
  const calculateDuration = (): number => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes - startMinutes;
  };

  // 필요한 포인트 계산
  const calculateRequiredPoints = (): number => {
    if (!room) return 0;
    const duration = calculateDuration();
    const slots = duration / 30; // 30분 단위
    return Math.ceil(slots * room.points_per_30min);
  };

  const requiredPoints = calculateRequiredPoints();
  const availablePoints = useTeamPoints ? teamPoints : personalPoints;
  const hasEnoughPoints = availablePoints >= requiredPoints;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingTitle.trim()) {
      toast({
        title: "입력 오류",
        description: "회의 제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughPoints) {
      toast({
        title: "포인트 부족",
        description: "예약에 필요한 포인트가 부족합니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await createRoomBooking({
        roomId,
        userId,
        bookingDate: format(date, "yyyy-MM-dd"),
        startTime,
        endTime,
        meetingTitle,
        meetingDescription,
        pointsUsed: requiredPoints,
        useTeamPoints,
      });

      if (result.success) {
        toast({
          title: "예약 완료",
          description: "회의실 예약이 완료되었습니다.",
        });
        onBookingComplete();
        handleClose();
      } else {
        toast({
          title: "예약 실패",
          description: result.error || "예약 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "예약 실패",
        description: "예약 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMeetingTitle("");
    setMeetingDescription("");
    setUseTeamPoints(false);
    onClose();
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>회의실 예약</DialogTitle>
          <DialogDescription>
            예약 정보를 입력하고 포인트를 사용하여 예약을 완료하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 예약 정보 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-semibold">예약 정보</h4>
            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(date, "yyyy년 M월 d일 (E)", { locale: ko })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {startTime} ~ {endTime} ({calculateDuration()}분)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-teal">
                  {requiredPoints} 포인트 필요
                </span>
              </div>
            </div>
          </div>

          {/* 회의 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              회의 제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="회의 제목을 입력하세요"
              required
            />
          </div>

          {/* 회의 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">회의 설명 (선택)</Label>
            <Textarea
              id="description"
              value={meetingDescription}
              onChange={(e) => setMeetingDescription(e.target.value)}
              placeholder="회의 내용을 간단히 입력하세요"
              rows={3}
            />
          </div>

          {/* 포인트 선택 */}
          <div className="space-y-3">
            <Label>포인트 사용</Label>
            <RadioGroup
              value={useTeamPoints ? "team" : "personal"}
              onValueChange={(value) => setUseTeamPoints(value === "team")}
            >
              <div
                className={`flex items-center space-x-2 rounded-lg border p-4 ${
                  !useTeamPoints ? "border-teal bg-teal/5" : ""
                }`}
              >
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>개인 포인트</span>
                    <span className="font-semibold">{personalPoints}P</span>
                  </div>
                </Label>
              </div>
              <div
                className={`flex items-center space-x-2 rounded-lg border p-4 ${
                  useTeamPoints ? "border-teal bg-teal/5" : ""
                }`}
              >
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>팀 포인트</span>
                    <span className="font-semibold">{teamPoints}P</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 포인트 부족 경고 */}
          {!hasEnoughPoints && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">포인트가 부족합니다</p>
                <p className="mt-1">
                  예약을 위해서는 {requiredPoints - availablePoints} 포인트가 더
                  필요합니다.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasEnoughPoints}
              className="bg-teal hover:bg-teal-600"
            >
              {loading ? "예약 중..." : "예약하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
