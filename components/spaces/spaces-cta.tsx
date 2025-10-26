import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Mail } from "lucide-react";

export function SpacesCTA() {
  return (
    <section className="bg-gradient-to-r from-teal to-teal-600 py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            공간을 직접 경험해보세요
          </h2>
          <p className="mb-12 text-xl text-white/90">
            온라인으로 보는 것보다 직접 방문하여 공간을 체험해보시는 것을
            추천합니다.
            <br className="hidden md:block" />
            무료 공간 투어를 예약하시면 MERRYHERE의 모든 공간을 둘러보실 수
            있습니다.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-teal hover:bg-gray-100"
            >
              <Link href="/#inquiry">
                <Calendar className="mr-2 h-5 w-5" />
                공간 투어 신청
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-teal hover:bg-gray-100"
            >
              <Link href="/rooms">
                <Calendar className="mr-2 h-5 w-5" />
                미팅룸 예약
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-teal hover:bg-gray-100"
            >
              <Link href="mailto:merryhere@mysc.co.kr">
                <Mail className="mr-2 h-5 w-5" />
                문의하기
              </Link>
            </Button>
          </div>

          {/* 추가 정보 */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold">09:00 - 18:00</div>
              <div className="text-white/90">투어 가능 시간</div>
              <div className="mt-2 text-sm text-white/70">평일 한정</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold">30분 ~ 1시간</div>
              <div className="text-white/90">투어 소요 시간</div>
              <div className="mt-2 text-sm text-white/70">상세 설명 포함</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold">무료</div>
              <div className="text-white/90">투어 비용</div>
              <div className="mt-2 text-sm text-white/70">사전 예약 필수</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
