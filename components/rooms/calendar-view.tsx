"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getRoomBookingsByDate } from "@/lib/supabase/rooms";
import type { RoomBooking } from "@/lib/supabase/database.types";
import { format, addDays, subDays, isSameDay, isToday, isPast, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";

interface CalendarViewProps {
  roomId: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
}

// 영업 시간: 09:00 ~ 22:00 (30분 단위)
const START_HOUR = 9;
const END_HOUR = 22;
const SLOT_DURATION = 30; // 분

// 시간 슬롯 생성
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < END_HOUR) {
      slots.push(`${String(hour).padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function CalendarView({
  roomId,
  selectedDate,
  onDateChange,
  onTimeSlotSelect,
}: CalendarViewProps) {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStartSlot, setSelectedStartSlot] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (roomId) {
      loadBookings();
    }
  }, [roomId, selectedDate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const data = await getRoomBookingsByDate(roomId, dateStr);
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
    setSelectedStartSlot(null);
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
    setSelectedStartSlot(null);
  };

  const goToToday = () => {
    onDateChange(new Date());
    setSelectedStartSlot(null);
  };

  // 특정 시간대가 예약되어 있는지 확인
  const isSlotBooked = (time: string): boolean => {
    return bookings.some((booking) => {
      return time >= booking.start_time && time < booking.end_time;
    });
  };

  // 시간대가 과거인지 확인
  const isSlotPast = (time: string): boolean => {
    if (!isToday(selectedDate)) {
      return isPast(startOfDay(selectedDate));
    }
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
  };

  // 시간대 클릭 핸들러
  const handleSlotClick = (time: string) => {
    if (isSlotBooked(time) || isSlotPast(time)) {
      return;
    }

    if (!selectedStartSlot) {
      // 시작 시간 선택
      setSelectedStartSlot(time);
    } else {
      // 종료 시간 선택
      const startIndex = TIME_SLOTS.indexOf(selectedStartSlot);
      const endIndex = TIME_SLOTS.indexOf(time);

      if (endIndex <= startIndex) {
        // 시작 시간보다 이전이면 다시 선택
        setSelectedStartSlot(time);
        return;
      }

      // 중간에 예약된 시간대가 있는지 확인
      const hasBookingBetween = TIME_SLOTS.slice(
        startIndex,
        endIndex
      ).some((slot) => isSlotBooked(slot));

      if (hasBookingBetween) {
        // 중간에 예약이 있으면 다시 선택
        setSelectedStartSlot(time);
        return;
      }

      // 예약 모달 열기
      onTimeSlotSelect(selectedStartSlot, time);
      setSelectedStartSlot(null);
    }
  };

  // 시간대가 선택 범위에 포함되는지 확인
  const isSlotInSelectedRange = (time: string): boolean => {
    if (!selectedStartSlot) return false;
    const startIndex = TIME_SLOTS.indexOf(selectedStartSlot);
    const currentIndex = TIME_SLOTS.indexOf(time);
    return currentIndex >= startIndex && currentIndex < TIME_SLOTS.length;
  };

  return (
    <div className="space-y-4">
      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className="text-lg font-bold">
            {format(selectedDate, "yyyy년 M월 d일 (E)", { locale: ko })}
          </div>
          {!isToday(selectedDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="mt-1 text-xs"
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              오늘로 이동
            </Button>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={goToNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 안내 메시지 */}
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
        {selectedStartSlot
          ? `📍 시작: ${selectedStartSlot} → 종료 시간을 선택해주세요`
          : "💡 예약 가능한 시간대를 클릭하여 시작 시간과 종료 시간을 선택해주세요"}
      </div>

      {/* 시간 그리드 */}
      {loading ? (
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      ) : (
        <div className="grid max-h-[600px] grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {TIME_SLOTS.map((time) => {
            const booked = isSlotBooked(time);
            const past = isSlotPast(time);
            const selected = selectedStartSlot === time;
            const inRange = isSlotInSelectedRange(time);

            return (
              <button
                key={time}
                onClick={() => handleSlotClick(time)}
                disabled={booked || past}
                className={`rounded-lg border p-3 text-sm font-medium transition-all ${
                  booked
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : past
                    ? "cursor-not-allowed bg-gray-100 text-gray-300"
                    : selected
                    ? "border-teal-500 bg-teal-500 text-white shadow-lg"
                    : inRange
                    ? "border-teal-300 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-gray-200 bg-white" />
          <span>예약 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-200" />
          <span>예약됨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-teal-500" />
          <span>선택됨</span>
        </div>
      </div>
    </div>
  );
}
