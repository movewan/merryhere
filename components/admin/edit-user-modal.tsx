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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/database.types";
import { updateUserAsAdmin } from "@/lib/supabase/admin";
import { useToast } from "@/hooks/use-toast";

interface EditUserModalProps {
  user: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<"general" | "tenant">(user.user_type);
  const [role, setRole] = useState(user.role);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateUserAsAdmin(user.id, {
        user_type: userType,
        role,
      });

      if (result.success) {
        toast({
          title: "저장 완료",
          description: "회원 정보가 업데이트되었습니다.",
        });
        onUpdate();
        onClose();
      } else {
        toast({
          title: "저장 실패",
          description: result.error || "업데이트 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "저장 실패",
        description: "업데이트 중 오류가 발생했습니다.",
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
          <DialogTitle>회원 정보 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>이름</Label>
            <div className="text-sm font-medium">{user.full_name}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-type">회원 유형</Label>
            <Select value={userType} onValueChange={(v) => setUserType(v as "general" | "tenant")}>
              <SelectTrigger id="user-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">일반 회원</SelectItem>
                <SelectItem value="tenant">입주 회원</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">역할</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="tenant_leader">팀 리더</SelectItem>
                <SelectItem value="tenant_manager">매니저</SelectItem>
                <SelectItem value="tenant_member">팀원</SelectItem>
                <SelectItem value="general">일반 회원</SelectItem>
              </SelectContent>
            </Select>
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
