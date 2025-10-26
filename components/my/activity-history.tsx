"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Activity } from "lucide-react";
import { getMyBookings } from "@/lib/supabase/rooms";
import { getMyRegistrations } from "@/lib/supabase/programs";
import { getCurrentUser } from "@/app/auth/actions";
import type { RoomBooking, ProgramRegistration } from "@/lib/supabase/database.types";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

type ActivityItem = {
  id: string;
  type: "room" | "program";
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  status: string;
  detailUrl: string;
  data: RoomBooking | ProgramRegistration;
};

export function ActivityHistory() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "room" | "program">("all");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const [roomBookings, programRegistrations] = await Promise.all([
        getMyBookings(user.id),
        getMyRegistrations(user.id),
      ]);

      const roomActivities: ActivityItem[] = roomBookings.map((booking) => ({
        id: booking.id,
        type: "room",
        title: booking.meeting_title || "회의실 예약",
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        location: booking.meeting_rooms?.name || "",
        status: booking.status,
        detailUrl: "/rooms",
        data: booking,
      }));

      const programActivities: ActivityItem[] = programRegistrations
        .filter((reg) => reg.programs)
        .map((registration) => ({
          id: registration.id,
          type: "program",
          title: registration.programs!.title,
          date: registration.programs!.start_datetime.split("T")[0],
          startTime: format(parseISO(registration.programs!.start_datetime), "HH:mm"),
          endTime: format(parseISO(registration.programs!.end_datetime), "HH:mm"),
          status: registration.status,
          detailUrl: `/programs/${registration.programs!.id}`,
          data: registration,
        }));

      const allActivities = [...roomActivities, ...programActivities].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setActivities(allActivities);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.type === filter;
  });

  const getStatusBadge = (activity: ActivityItem) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      confirmed: { label: "예약 완료", className: "bg-teal/10 text-teal" },
      registered: { label: "신청 완료", className: "bg-teal/10 text-teal" },
      cancelled: { label: "취소됨", className: "bg-red-100 text-red-700" },
      attended: { label: "참석 완료", className: "bg-blue-100 text-blue-700" },
      completed: { label: "이용 완료", className: "bg-blue-100 text-blue-700" },
    };

    const config = statusConfig[activity.status] || {
      label: activity.status,
      className: "bg-gray-100 text-gray-700",
    };

    return (
      <span className={`rounded-full px-2 py-0.5 text-xs ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-muted-foreground">활동 내역이 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>활동 내역</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                filter === "all"
                  ? "bg-teal text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("room")}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                filter === "room"
                  ? "bg-teal text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              회의실
            </button>
            <button
              onClick={() => setFilter("program")}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                filter === "program"
                  ? "bg-teal text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              프로그램
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            해당하는 활동 내역이 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-start justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        activity.type === "room"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {activity.type === "room" ? "회의실" : "프로그램"}
                    </span>
                    {getStatusBadge(activity)}
                  </div>

                  <h4 className="font-semibold">{activity.title}</h4>

                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(parseISO(activity.date), "yyyy년 M월 d일 (E)", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    {activity.startTime && activity.endTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {activity.startTime} ~ {activity.endTime}
                        </span>
                      </div>
                    )}
                    {activity.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <Link
                      href={activity.detailUrl}
                      className="text-sm text-teal hover:underline"
                    >
                      상세 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
