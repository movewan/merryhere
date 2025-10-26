"use client";

import { useState, useEffect } from "react";
import { ProgramCard } from "./program-card";
import { getUpcomingPrograms } from "@/lib/supabase/programs";
import type { Program } from "@/lib/supabase/database.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock } from "lucide-react";

export function ProgramList() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await getUpcomingPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Failed to load programs:", error);
    } finally {
      setLoading(false);
    }
  };

  // 오늘부터 7일 이내 프로그램
  const upcomingSoon = programs.filter((p) => {
    const startDate = new Date(p.start_datetime);
    const now = new Date();
    const diffDays = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 7;
  });

  // 7일 이후 프로그램
  const upcomingLater = programs.filter((p) => {
    const startDate = new Date(p.start_datetime);
    const now = new Date();
    const diffDays = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 7;
  });

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="rounded-lg border bg-gray-50 p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-semibold">예정된 프로그램이 없습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">
          새로운 프로그램이 등록되면 알려드리겠습니다
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList>
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          전체 ({programs.length})
        </TabsTrigger>
        <TabsTrigger value="soon" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          이번 주 ({upcomingSoon.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        {programs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-gray-50 p-12 text-center">
            <p className="text-muted-foreground">프로그램이 없습니다</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="soon">
        {upcomingSoon.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSoon.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>

            {upcomingLater.length > 0 && (
              <div className="mt-12">
                <h3 className="mb-6 text-xl font-bold">다음 프로그램</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingLater.slice(0, 3).map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border bg-gray-50 p-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-semibold">
              이번 주 예정된 프로그램이 없습니다
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              다음 주 프로그램을 확인해보세요
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
