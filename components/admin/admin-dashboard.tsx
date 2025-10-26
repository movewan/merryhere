"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  DoorOpen,
  Calendar,
  CalendarCheck,
  Coins,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { FinanceDashboard } from "./finance-dashboard";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalTenants: number;
    totalRooms: number;
    totalPrograms: number;
    upcomingPrograms: number;
    todayBookings: number;
    totalPoints: number;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const statCards = [
    {
      title: "전체 회원",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "입주 회원",
      value: stats.totalTenants,
      icon: UserCheck,
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      title: "활성 회의실",
      value: stats.totalRooms,
      icon: DoorOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "전체 프로그램",
      value: stats.totalPrograms,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "예정된 프로그램",
      value: stats.upcomingPrograms,
      icon: CalendarCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "오늘 예약",
      value: stats.todayBookings,
      icon: DoorOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "전체 포인트",
      value: `${stats.totalPoints.toLocaleString()}P`,
      icon: Coins,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const menuItems = [
    {
      title: "회원 관리",
      description: "회원 목록 조회 및 권한 관리",
      href: "/admin/users",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "계약 관리",
      description: "입주 계약 현황 및 관리",
      href: "/admin/contracts",
      icon: Users,
      color: "text-teal",
      bgColor: "bg-teal-50",
    },
    {
      title: "회의실 관리",
      description: "회의실 등록 및 수정",
      href: "/admin/rooms",
      icon: DoorOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "프로그램 관리",
      description: "프로그램 등록 및 신청자 관리",
      href: "/admin/programs",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 통계 카드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </p>
                </div>
                <div className={`rounded-full ${stat.bgColor} p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 관리 메뉴 */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">관리 메뉴</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className={`${item.bgColor} border-none transition-all hover:shadow-lg`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`rounded-full bg-white p-3 shadow-sm`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                </div>
                <CardTitle className="mt-4">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <Button asChild variant="ghost" className="w-full justify-between">
                  <Link href={item.href}>
                    바로가기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 재무 현황 */}
      <div>
        <FinanceDashboard />
      </div>
    </div>
  );
}
