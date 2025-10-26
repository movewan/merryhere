"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Building2, Edit } from "lucide-react";
import type { Profile } from "@/lib/supabase/database.types";
import Link from "next/link";

interface ProfileCardProps {
  profile: Profile;
}

const userTypeLabels = {
  general: "일반 회원",
  tenant: "입주 회원",
};

const roleLabels = {
  admin: "관리자",
  tenant_leader: "팀 리더",
  tenant_manager: "매니저",
  tenant_member: "팀원",
  general: "일반 회원",
};

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* 프로필 이미지 */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.profile_image_url || undefined} />
            <AvatarFallback className="bg-teal/10 text-2xl text-teal">
              {profile.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* 정보 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row">
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <div className="flex gap-2">
                <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                  {userTypeLabels[profile.user_type]}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {roleLabels[profile.role]}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {profile.phone && (
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.company_name && (
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Building2 className="h-4 w-4" />
                  <span>{profile.company_name}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/my/edit">
                  <Edit className="mr-2 h-4 w-4" />
                  프로필 수정
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
