"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Coins, Clock } from "lucide-react";
import { getMeetingRooms } from "@/lib/supabase/rooms";
import type { MeetingRoom } from "@/lib/supabase/database.types";

interface RoomListProps {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function RoomList({ selectedRoomId, onSelectRoom }: RoomListProps) {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await getMeetingRooms();
      setRooms(data);
      // 첫 번째 방을 기본 선택
      if (data.length > 0 && !selectedRoomId) {
        onSelectRoom(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">회의실 선택</h3>
      {rooms.map((room) => (
        <Card
          key={room.id}
          className={`cursor-pointer transition-all ${
            selectedRoomId === room.id
              ? "border-2 border-teal shadow-lg"
              : "hover:border-teal/50"
          }`}
          onClick={() => onSelectRoom(room.id)}
        >
          <CardContent className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold">{room.name}</h4>
                {room.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {room.description}
                  </p>
                )}
              </div>
              {selectedRoomId === room.id && (
                <div className="rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white">
                  선택됨
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>최대 {room.capacity}인</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span>{room.points_per_30min} 포인트/30분</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {room.min_booking_duration}분 ~ {room.max_booking_duration}분
                </span>
              </div>
            </div>

            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {room.amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                  >
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 3 && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    +{room.amenities.length - 3}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
