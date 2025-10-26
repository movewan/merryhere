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
import { Loader2, X } from "lucide-react";
import type { MeetingRoom } from "@/lib/supabase/database.types";
import { createMeetingRoom, updateMeetingRoom } from "@/lib/supabase/admin";
import { useToast } from "@/hooks/use-toast";

interface RoomModalProps {
  room?: MeetingRoom | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function RoomModal({ room, onClose, onUpdate }: RoomModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pointsPer30Min, setPointsPer30Min] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");

  useEffect(() => {
    if (room) {
      setName(room.name);
      setCapacity(room.capacity.toString());
      setPointsPer30Min(room.points_per_30min.toString());
      setDescription(room.description || "");
      setAmenities(room.amenities || []);
    }
  }, [room]);

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const capacityNum = parseInt(capacity);
    const pointsNum = parseInt(pointsPer30Min);

    if (!name.trim()) {
      toast({
        title: "입력 오류",
        description: "회의실명을 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast({
        title: "입력 오류",
        description: "올바른 수용 인원을 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(pointsNum) || pointsNum < 0) {
      toast({
        title: "입력 오류",
        description: "올바른 포인트를 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const roomData = {
        name: name.trim(),
        floor: 1,
        capacity: capacityNum,
        points_per_30min: pointsNum,
        min_booking_duration: 30,
        max_booking_duration: 480,
        description: description.trim() || null,
        amenities: amenities.length > 0 ? amenities : null,
        image_url: null,
        is_active: true,
      };

      const result = room
        ? await updateMeetingRoom(room.id, roomData)
        : await createMeetingRoom(roomData);

      if (result.success) {
        toast({
          title: "저장 완료",
          description: `회의실이 ${room ? "수정" : "등록"}되었습니다.`,
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
          <DialogTitle>{room ? "회의실 수정" : "회의실 추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">회의실명 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 소회의실 A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">수용 인원 *</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="4"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">30분당 포인트 *</Label>
              <Input
                id="points"
                type="number"
                value={pointsPer30Min}
                onChange={(e) => setPointsPer30Min(e.target.value)}
                placeholder="1000"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="회의실에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>편의시설</Label>
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
                placeholder="예: 빔 프로젝터"
              />
              <Button type="button" onClick={handleAddAmenity} variant="outline">
                추가
              </Button>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-3 py-1 text-sm text-teal"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="hover:text-teal-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
