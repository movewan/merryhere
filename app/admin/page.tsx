import { getDashboardStats } from "@/lib/supabase/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const stats = await getDashboardStats();

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">관리자 페이지</h1>
          <p className="text-lg text-muted-foreground">
            시스템 전반을 관리하고 모니터링합니다.
          </p>
        </div>

        <AdminDashboard stats={stats} />
      </div>
    </main>
  );
}
