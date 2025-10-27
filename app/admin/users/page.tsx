"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Users, Download } from "lucide-react";
import { getAllUsers } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/supabase/database.types";
import { UserTable } from "@/components/admin/user-table";
import { exportToExcel } from "@/lib/utils/excel";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, userTypeFilter, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // 검색어 필터
    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(search.toLowerCase()) ||
          user.company_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 회원 유형 필터
    if (userTypeFilter !== "all") {
      filtered = filtered.filter((user) => user.user_type === userTypeFilter);
    }

    // 역할 필터
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleExportExcel = () => {
    const excelData = filteredUsers.map((user) => ({
      ID: user.id,
      이름: user.full_name,
      전화번호: user.phone || "",
      회원유형: user.user_type === "tenant" ? "입주 회원" : "일반 회원",
      역할: getRoleLabel(user.role),
      회사명: user.company_name || "",
      대표자명: user.ceo_name || "",
      사무실유형: user.office_type || "",
      사무실호수: user.office_number || "",
      개인포인트: user.personal_points,
      팀포인트: user.team_points,
      리더여부: user.is_leader ? "예" : "아니오",
      매니저여부: user.is_manager ? "예" : "아니오",
      가입일: new Date(user.created_at).toLocaleDateString("ko-KR"),
    }));

    const today = new Date().toISOString().split("T")[0];
    exportToExcel(excelData, `회원관리_${today}`, "회원목록");
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: "관리자",
      tenant_leader: "팀 리더",
      tenant_manager: "매니저",
      tenant_member: "팀원",
      general: "일반 회원",
    };
    return roleLabels[role] || role;
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
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">회원 관리</h1>
            <p className="text-muted-foreground">
              전체 회원 {users.length}명
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                회원 목록
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
            {/* 필터 */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="이름, 이메일, 회사명으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="회원 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  <SelectItem value="general">일반 회원</SelectItem>
                  <SelectItem value="tenant">입주 회원</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 역할</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="tenant_leader">팀 리더</SelectItem>
                  <SelectItem value="tenant_manager">매니저</SelectItem>
                  <SelectItem value="tenant_member">팀원</SelectItem>
                  <SelectItem value="general">일반 회원</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 사용자 테이블 */}
            <UserTable users={filteredUsers} onUpdate={loadUsers} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
