"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, X, CheckCircle2 } from "lucide-react";
import { getMyBookings, cancelRoomBooking } from "@/lib/supabase/rooms";
import { getCurrentUser } from "@/app/auth/actions";
import type { RoomBooking } from "@/lib/supabase/database.types";
import { format, isPast, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export function MyBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        const data = await getMyBookings(user.id);
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast({
        title: "오류",
        description: "예약 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("정말 이 예약을 취소하시겠습니까?\n포인트는 환불됩니다.")) {
      return;
    }

    setCancellingId(bookingId);

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const result = await cancelRoomBooking(bookingId, user.id);

      if (result.success) {
        toast({
          title: "취소 완료",
          description: "예약이 취소되었습니다. 포인트가 환불되었습니다.",
        });
        loadBookings();
      } else {
        toast({
          title: "취소 실패",
          description: result.error || "예약 취소 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast({
        title: "취소 실패",
        description: "예약 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  // 예약 시간이 지났는지 확인
  const isBookingPast = (booking: RoomBooking): boolean => {
    try {
      const bookingDateTime = parseISO(
        `${booking.booking_date}T${booking.end_time}`
      );
      return isPast(bookingDateTime);
    } catch {
      return false;
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && !isBookingPast(b)
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "confirmed" && isBookingPast(b)
  );
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-muted-foreground">예약 내역이 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  const BookingCard = ({ booking }: { booking: RoomBooking }) => {
    const room = booking.meeting_rooms;
    const past = isBookingPast(booking);

    return (
      <Card
        className={booking.status === "cancelled" ? "opacity-60" : ""}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h4 className="font-bold">{booking.meeting_title}</h4>
                {booking.status === "cancelled" && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    취소됨
                  </span>
                )}
                {past && booking.status === "confirmed" && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    완료
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(parseISO(booking.booking_date), "yyyy년 M월 d일 (E)", {
                      locale: ko,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {booking.start_time} ~ {booking.end_time}
                  </span>
                </div>
                {room && (
                  <div className="mt-2">
                    <span className="rounded-full bg-teal/10 px-2 py-1 text-xs text-teal">
                      {room.name}
                    </span>
                  </div>
                )}
              </div>

              {booking.meeting_description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {booking.meeting_description}
                </p>
              )}
            </div>

            {/* 취소 버튼 (예정된 예약만) */}
            {!past && booking.status === "confirmed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelBooking(booking.id)}
                disabled={cancellingId === booking.id}
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
      {/* 예정된 예약 */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal" />
              예정된 예약 ({upcomingBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* 지난 예약 */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              지난 예약 ({pastBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastBookings.slice(0, 5).map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {pastBookings.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                그 외 {pastBookings.length - 5}개
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 취소된 예약 */}
      {cancelledBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <X className="h-5 w-5" />
              취소된 예약 ({cancelledBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cancelledBookings.slice(0, 3).map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {cancelledBookings.length > 3 && (
              <p className="text-center text-sm text-muted-foreground">
                그 외 {cancelledBookings.length - 3}개
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
