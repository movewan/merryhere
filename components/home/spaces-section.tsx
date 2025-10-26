"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, Briefcase, Users, Presentation } from "lucide-react";

const spaces = [
  {
    id: "lounge",
    title: "LOUNGE",
    subtitle: "라운지",
    description: "자유로운 소통과 네트워킹을 위한 편안한 공간",
    icon: Coffee,
    image: "/images/lounge/라운지1.jpg",
    features: ["무료 커피/차", "편안한 소파", "자유로운 분위기", "네트워킹"],
    href: "/spaces#lounge",
  },
  {
    id: "office",
    title: "OFFICE",
    subtitle: "오피스",
    description: "집중력을 높이는 프라이빗 업무 공간",
    icon: Briefcase,
    image: "/images/office/오피스1.jpg",
    features: ["독립 오피스", "고정 좌석", "프라이버시", "업무 집중"],
    href: "/spaces#office",
  },
  {
    id: "meeting-room",
    title: "MEETING ROOM",
    subtitle: "미팅룸",
    description: "효율적인 회의를 위한 전문 미팅 공간",
    icon: Users,
    image: "/images/meeting-room/미팅룸1.jpg",
    features: ["예약 시스템", "빔 프로젝터", "화이트보드", "포인트 이용"],
    href: "/rooms",
  },
  {
    id: "merry-hall",
    title: "MERRY HALL",
    subtitle: "메리홀",
    description: "대규모 행사와 세미나를 위한 다목적 홀",
    icon: Presentation,
    image: "/images/merry-hall/메리홀1.jpg",
    features: ["대규모 공간", "행사 개최", "음향 시설", "유연한 배치"],
    href: "/spaces#merry-hall",
  },
];

export function SpacesSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* 섹션 헤더 */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            다양한 공간, 무한한 가능성
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            MERRYHERE는 여러분의 비즈니스 성장을 위한 다양한 공간을 제공합니다.
            <br />
            필요에 맞는 공간을 선택하고, 효율적으로 업무를 진행하세요.
          </p>
        </div>

        {/* 공간 카드 그리드 */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {spaces.map((space, index) => {
            const Icon = space.icon;
            return (
              <Card
                key={space.id}
                className="group overflow-hidden transition-all hover:shadow-xl"
              >
                <CardContent className="p-0">
                  {/* 이미지 */}
                  <div className="relative h-64 overflow-hidden md:h-80">
                    <Image
                      src={space.image}
                      alt={space.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* 아이콘 */}
                    <div className="absolute right-6 top-6 rounded-full bg-white/90 p-3 backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-teal" />
                    </div>

                    {/* 타이틀 (이미지 위) */}
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="mb-1 text-3xl font-bold">{space.title}</h3>
                      <p className="text-lg text-white/90">{space.subtitle}</p>
                    </div>
                  </div>

                  {/* 설명 */}
                  <div className="p-6 md:p-8">
                    <p className="mb-6 text-base text-muted-foreground">
                      {space.description}
                    </p>

                    {/* 특징 */}
                    <div className="mb-6 grid grid-cols-2 gap-3">
                      {space.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-teal" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* 더보기 버튼 */}
                    <Button
                      asChild
                      variant="ghost"
                      className="group/btn w-full justify-between text-teal hover:bg-teal/5 hover:text-teal"
                    >
                      <Link href={space.href}>
                        자세히 보기
                        <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button asChild size="lg" className="bg-teal hover:bg-teal-600">
            <Link href="/spaces">
              모든 공간 둘러보기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
