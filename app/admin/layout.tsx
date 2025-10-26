import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";
import { Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check admin permission using server client
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      {/* 관리자 전용 헤더 - 틸 배경 */}
      <header className="sticky top-0 z-50 w-full border-b bg-teal text-white shadow-lg">
        <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
          {/* Logo with Admin Badge */}
          <Link href="/admin" className="flex items-center space-x-3">
            <Shield className="h-6 w-6" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">MERRY HERE</span>
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">
                ADMIN
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/admin"
              className="transition-colors hover:text-white/80"
            >
              대시보드
            </Link>
            <Link
              href="/admin/users"
              className="transition-colors hover:text-white/80"
            >
              회원 관리
            </Link>
            <Link
              href="/admin/contracts"
              className="transition-colors hover:text-white/80"
            >
              계약 관리
            </Link>
            <Link
              href="/admin/expenses"
              className="transition-colors hover:text-white/80"
            >
              지출 관리
            </Link>
            <Link
              href="/admin/rooms"
              className="transition-colors hover:text-white/80"
            >
              회의실 관리
            </Link>
            <Link
              href="/admin/programs"
              className="transition-colors hover:text-white/80"
            >
              프로그램 관리
            </Link>
          </nav>

          {/* User Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden md:flex text-sm hover:text-white/80 transition-colors"
            >
              일반 페이지로
            </Link>
            <UserNav user={user} profile={profile} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}
    </div>
  );
}
