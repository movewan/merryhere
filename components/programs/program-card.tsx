import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import type { Program } from "@/lib/supabase/database.types";
import { format, isPast, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const startDate = parseISO(program.start_datetime);
  const endDate = parseISO(program.end_datetime);
  const isProgramPast = isPast(endDate);
  const isFull = program.current_participants >= program.max_participants;
  const isDeadlinePassed = program.registration_deadline
    ? isPast(parseISO(program.registration_deadline))
    : false;

  const canRegister = !isProgramPast && !isFull && !isDeadlinePassed;
  const remainingSeats = program.max_participants - program.current_participants;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl">
      <CardContent className="p-0">
        {/* 썸네일 이미지 */}
        <div className="relative h-48 overflow-hidden">
          {program.thumbnail_url ? (
            <Image
              src={program.thumbnail_url}
              alt={program.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600">
              <span className="text-4xl text-white/80">📚</span>
            </div>
          )}

          {/* 상태 배지 */}
          <div className="absolute right-3 top-3">
            {isProgramPast ? (
              <span className="rounded-full bg-gray-800/90 px-3 py-1 text-xs font-semibold text-white">
                종료
              </span>
            ) : isFull ? (
              <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">
                마감
              </span>
            ) : isDeadlinePassed ? (
              <span className="rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white">
                신청 마감
              </span>
            ) : remainingSeats <= 5 ? (
              <span className="rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white">
                {remainingSeats}석 남음
              </span>
            ) : (
              <span className="rounded-full bg-teal/90 px-3 py-1 text-xs font-semibold text-white">
                신청 가능
              </span>
            )}
          </div>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <h3 className="mb-3 line-clamp-2 text-xl font-bold">
            {program.title}
          </h3>

          {program.description && (
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {program.description}
            </p>
          )}

          {/* 정보 */}
          <div className="mb-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(startDate, "M월 d일 (E)", { locale: ko })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(startDate, "HH:mm")} ~ {format(endDate, "HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {program.current_participants} / {program.max_participants}명
              </span>
            </div>
          </div>

          {/* 버튼 */}
          <Button
            asChild
            className={`w-full ${
              canRegister
                ? "bg-teal hover:bg-teal-600"
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            <Link href={`/programs/${program.id}`}>
              {canRegister ? "자세히 보기" : "상세 정보"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
