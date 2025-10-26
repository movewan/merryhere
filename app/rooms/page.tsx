"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomList } from "@/components/rooms/room-list";
import { CalendarView } from "@/components/rooms/calendar-view";
import { BookingModal } from "@/components/rooms/booking-modal";
import { MyBookings } from "@/components/rooms/my-bookings";
import { Calendar, List } from "lucide-react";

export default function RoomsPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    setSelectedTimeSlot({ startTime, endTime });
    setBookingModalOpen(true);
  };

  const handleBookingComplete = () => {
    // 예약 완료 후 갱신
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">회의실 예약</h1>
          <p className="text-lg text-muted-foreground">
            원하는 날짜와 시간에 회의실을 예약하고 포인트로 결제하세요.
          </p>
        </div>

        {/* 탭 */}
        <Tabs defaultValue="booking" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              예약하기
            </TabsTrigger>
            <TabsTrigger value="my-bookings" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              내 예약
            </TabsTrigger>
          </TabsList>

          {/* 예약하기 탭 */}
          <TabsContent value="booking" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* 왼쪽: 회의실 목록 */}
              <div className="lg:col-span-1">
                <RoomList
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                />
              </div>

              {/* 오른쪽: 캘린더 뷰 */}
              <div className="lg:col-span-2">
                {selectedRoomId ? (
                  <div key={refreshKey}>
                    <CalendarView
                      roomId={selectedRoomId}
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      onTimeSlotSelect={handleTimeSlotSelect}
                    />
                  </div>
                ) : (
                  <div className="flex h-96 items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground">
                      왼쪽에서 회의실을 선택해주세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 내 예약 탭 */}
          <TabsContent value="my-bookings" className="space-y-6">
            <MyBookings key={refreshKey} />
          </TabsContent>
        </Tabs>

        {/* 예약 모달 */}
        {selectedRoomId && selectedTimeSlot && (
          <BookingModal
            isOpen={bookingModalOpen}
            onClose={() => {
              setBookingModalOpen(false);
              setSelectedTimeSlot(null);
            }}
            roomId={selectedRoomId}
            date={selectedDate}
            startTime={selectedTimeSlot.startTime}
            endTime={selectedTimeSlot.endTime}
            onBookingComplete={handleBookingComplete}
          />
        )}
      </div>
    </main>
  );
}
