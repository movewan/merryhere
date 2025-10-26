"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, ToggleLeft, ToggleRight } from "lucide-react";
import type { MeetingRoom } from "@/lib/supabase/database.types";
import { updateMeetingRoom } from "@/lib/supabase/admin";
import { useToast } from "@/hooks/use-toast";

interface RoomTableProps {
  rooms: MeetingRoom[];
  onEdit: (room: MeetingRoom) => void;
  onUpdate: () => void;
}

export function RoomTable({ rooms, onEdit, onUpdate }: RoomTableProps) {
  const { toast } = useToast();

  const handleToggleActive = async (room: MeetingRoom) => {
    try {
      const result = await updateMeetingRoom(room.id, {
        is_active: !room.is_active,
      });

      if (result.success) {
        toast({
          title: "변경 완료",
          description: `${room.name}이(가) ${!room.is_active ? "활성화" : "비활성화"}되었습니다.`,
        });
        onUpdate();
      } else {
        toast({
          title: "변경 실패",
          description: result.error || "상태 변경 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast({
        title: "변경 실패",
        description: "상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (rooms.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        등록된 회의실이 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회의실명</TableHead>
            <TableHead>수용 인원</TableHead>
            <TableHead>시간당 포인트</TableHead>
            <TableHead>편의시설</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{room.name}</TableCell>
              <TableCell>{room.capacity}명</TableCell>
              <TableCell className="font-semibold">
                {room.points_per_hour.toLocaleString()}P
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {room.amenities?.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities && room.amenities.length > 3 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(room)}
                  className="h-auto p-0"
                >
                  {room.is_active ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <ToggleRight className="h-5 w-5" />
                      활성
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <ToggleLeft className="h-5 w-5" />
                      비활성
                    </span>
                  )}
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(room)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
