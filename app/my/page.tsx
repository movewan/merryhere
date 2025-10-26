import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/auth/actions";
import { getProfile } from "@/lib/supabase/profile";
import { ProfileCard } from "@/components/my/profile-card";
import { PointsDashboard } from "@/components/my/points-dashboard";
import { ActivityHistory } from "@/components/my/activity-history";
import { ContractStatus } from "@/components/my/contract-status";

export default async function MyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getProfile(user.id);

  // 프로필이 없으면 편집 페이지로 리다이렉트
  if (!profile) {
    redirect("/my/edit");
  }

  // 대표자 또는 매니저 권한 확인
  const canViewContract =
    profile.user_type === "tenant" &&
    (profile.role === "tenant_leader" || profile.role === "tenant_manager");

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">MY PAGE</h1>
          <p className="text-lg text-muted-foreground">
            나의 정보와 활동 내역을 확인하세요.
          </p>
        </div>

        <div className="space-y-8">
          {/* 프로필 정보 */}
          <ProfileCard profile={profile} />

          {/* 계약 현황 (대표자/매니저만 표시) */}
          {canViewContract && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">계약 현황</h2>
              <ContractStatus userId={user.id} />
            </div>
          )}

          {/* 포인트 대시보드 */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">포인트</h2>
            <PointsDashboard userId={user.id} />
          </div>

          {/* 활동 내역 */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">활동 내역</h2>
            <ActivityHistory />
          </div>
        </div>
      </div>
    </main>
  );
}
