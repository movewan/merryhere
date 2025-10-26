"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { getPrograms } from "@/lib/supabase/programs";
import type { Program } from "@/lib/supabase/database.types";
import { ProgramTable } from "@/components/admin/program-table";
import { ProgramModal } from "@/components/admin/program-modal";
import Link from "next/link";

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Failed to load programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProgram(null);
  };

  const handleUpdate = () => {
    loadPrograms();
    handleCloseModal();
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">프로그램 관리</h1>
              <p className="text-muted-foreground">전체 프로그램 {programs.length}개</p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-teal hover:bg-teal-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            프로그램 추가
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              프로그램 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgramTable
              programs={programs}
              onEdit={handleEdit}
              onUpdate={loadPrograms}
            />
          </CardContent>
        </Card>
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <ProgramModal
          program={editingProgram}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </main>
  );
}
