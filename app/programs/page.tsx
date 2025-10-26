"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramList } from "@/components/programs/program-list";
import { MyRegistrations } from "@/components/programs/my-registrations";
import { Calendar, List } from "lucide-react";

export default function ProgramsPage() {
  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">프로그램</h1>
          <p className="text-lg text-muted-foreground">
            MERRYHERE에서 진행하는 다양한 프로그램에 참여해보세요.
          </p>
        </div>

        {/* 탭 */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              프로그램 목록
            </TabsTrigger>
            <TabsTrigger value="my-registrations" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              내 신청 내역
            </TabsTrigger>
          </TabsList>

          {/* 프로그램 목록 탭 */}
          <TabsContent value="list">
            <ProgramList />
          </TabsContent>

          {/* 내 신청 내역 탭 */}
          <TabsContent value="my-registrations">
            <MyRegistrations />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
