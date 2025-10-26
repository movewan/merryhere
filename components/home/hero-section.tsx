"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <Image
          src="/images/exterior/메리히어_외관_정면_낮.jpg"
          alt="MERRYHERE 외관"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 컨텐츠 */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl space-y-8">
            {/* 메인 타이틀 */}
            <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              소셜벤처와 함께
              <br />
              <span className="text-teal">성장하는 공간</span>
            </h1>

            {/* 서브 타이틀 */}
            <p className="text-xl text-white/90 md:text-2xl">
              MERRYHERE는 사회적 가치를 창출하는 소셜벤처들이
              <br className="hidden md:block" />
              함께 모여 성장하는 공유 오피스입니다.
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-teal text-white hover:bg-teal-600"
              >
                <Link href="#inquiry">
                  입주 문의하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-teal text-white hover:bg-teal-600"
              >
                <Link href="/spaces">공간 둘러보기</Link>
              </Button>
            </div>

            {/* 주요 정보 */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="space-y-1">
                <p className="text-sm text-white/70">위치</p>
                <p className="text-lg font-semibold text-white">
                  서울 용산구 한강대로
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/70">면적</p>
                <p className="text-lg font-semibold text-white">약 500평</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/70">운영</p>
                <p className="text-lg font-semibold text-white">
                  MYSC (사회혁신기업)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/70">
          <span className="text-sm">Scroll</span>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
