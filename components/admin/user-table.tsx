"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Coins } from "lucide-react";
import type { Profile } from "@/lib/supabase/database.types";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { EditUserModal } from "./edit-user-modal";
import { PointsModal } from "./points-modal";

interface UserTableProps {
  users: Profile[];
  onUpdate: () => void;
}

const userTypeLabels = {
  general: "일반",
  tenant: "입주",
};

const roleLabels = {
  admin: "관리자",
  tenant_leader: "팀 리더",
  tenant_manager: "매니저",
  tenant_member: "팀원",
  general: "일반",
};

export function UserTable({ users, onUpdate }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [pointsUser, setPointsUser] = useState<Profile | null>(null);

  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>회원 유형</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>개인 포인트</TableHead>
              <TableHead>팀 포인트</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      user.user_type === "tenant"
                        ? "bg-teal/10 text-teal"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {userTypeLabels[user.user_type]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                  </span>
                </TableCell>
                <TableCell className="font-semibold">
                  {user.personal_points.toLocaleString()}P
                </TableCell>
                <TableCell className="font-semibold">
                  {user.team_points.toLocaleString()}P
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(parseISO(user.created_at), "yyyy.MM.dd", { locale: ko })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPointsUser(user)}
                    >
                      <Coins className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 수정 모달 */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={onUpdate}
        />
      )}

      {/* 포인트 모달 */}
      {pointsUser && (
        <PointsModal
          user={pointsUser}
          onClose={() => setPointsUser(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
