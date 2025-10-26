"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Plus, Minus } from "lucide-react";
import type { Profile } from "@/lib/supabase/database.types";
import { adjustUserPoints } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/app/auth/actions";
import { useToast } from "@/hooks/use-toast";

interface PointsModalProps {
  user: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

export function PointsModal({ user, onClose, onUpdate }: PointsModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [pointType, setPointType] = useState<"personal" | "team">("personal");
  const [action, setAction] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    const pointAmount = parseInt(amount);
    if (isNaN(pointAmount) || pointAmount <= 0) {
      toast({
        title: "입력 오류",
        description: "올바른 포인트 금액을 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "입력 오류",
        description: "사유를 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const finalAmount = action === "add" ? pointAmount : -pointAmount;

      const result = await adjustUserPoints({
        userId: user.id,
        amount: finalAmount,
        isTeamPoints: pointType === "team",
        description: description.trim(),
        adminId: currentUser.id,
      });

      if (result.success) {
        toast({
          title: "처리 완료",
          description: `${pointAmount.toLocaleString()}P가 ${action === "add" ? "적립" : "차감"}되었습니다.`,
        });
        onUpdate();
        onClose();
      } else {
        toast({
          title: "처리 실패",
          description: result.error || "포인트 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Points adjustment error:", error);
      toast({
        title: "처리 실패",
        description: "포인트 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>포인트 관리</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>회원</Label>
            <div className="text-sm font-medium">{user.full_name}</div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">개인 포인트</div>
                <div className="text-lg font-bold text-teal">
                  {user.personal_points.toLocaleString()}P
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">팀 포인트</div>
                <div className="text-lg font-bold text-blue-600">
                  {user.team_points.toLocaleString()}P
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>포인트 유형</Label>
            <RadioGroup value={pointType} onValueChange={(v) => setPointType(v as "personal" | "team")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="cursor-pointer font-normal">
                  개인 포인트
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="cursor-pointer font-normal">
                  팀 포인트
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>작업</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={action === "add" ? "default" : "outline"}
                onClick={() => setAction("add")}
                className={action === "add" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Plus className="mr-2 h-4 w-4" />
                적립
              </Button>
              <Button
                type="button"
                variant={action === "subtract" ? "default" : "outline"}
                onClick={() => setAction("subtract")}
                className={action === "subtract" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Minus className="mr-2 h-4 w-4" />
                차감
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="포인트 금액"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">사유</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="포인트 적립/차감 사유를 입력하세요"
              rows={3}
            />
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
                처리 중...
              </>
            ) : (
              "확인"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
