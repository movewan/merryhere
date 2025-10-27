"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, DoorOpen, Download } from "lucide-react";
import { getMeetingRooms } from "@/lib/supabase/rooms";
import type { MeetingRoom } from "@/lib/supabase/database.types";
import { RoomTable } from "@/components/admin/room-table";
import { RoomModal } from "@/components/admin/room-modal";
import { exportToExcel } from "@/lib/utils/excel";
import Link from "next/link";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await getMeetingRooms();
      setRooms(data);
    } catch (error) {
      console.error("Failed to load rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: MeetingRoom) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  const handleUpdate = () => {
    loadRooms();
    handleCloseModal();
  };

  const handleExportExcel = () => {
    const excelData = rooms.map((room) => ({
      회의실명: room.name,
      설명: room.description || "",
      수용인원: room.capacity,
      "포인트(30분당)": room.points_per_30min,
      최소예약시간: room.min_booking_duration,
      최대예약시간: room.max_booking_duration,
      편의시설: room.amenities?.join(", ") || "",
      상태: room.is_active ? "활성" : "비활성",
      생성일: new Date(room.created_at).toLocaleDateString("ko-KR"),
    }));

    const today = new Date().toISOString().split("T")[0];
    exportToExcel(excelData, `회의실관리_${today}`, "회의실목록");
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">회의실 관리</h1>
              <p className="text-muted-foreground">전체 회의실 {rooms.length}개</p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-teal hover:bg-teal-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            회의실 추가
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" />
                회의실 목록
              </CardTitle>
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                엑셀 다운로드
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RoomTable rooms={rooms} onEdit={handleEdit} onUpdate={loadRooms} />
          </CardContent>
        </Card>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <RoomModal
          room={editingRoom}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </main>
  );
}
