"use client";

import { Button } from "@/components/ui/button";
import { Coffee, Briefcase, Users, Presentation } from "lucide-react";

const spaces = [
  {
    id: "lounge",
    icon: Coffee,
    label: "라운지",
    color: "bg-teal/10 text-teal hover:bg-teal/20",
  },
  {
    id: "office",
    icon: Briefcase,
    label: "오피스",
    color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
  },
  {
    id: "meeting-room",
    icon: Users,
    label: "미팅룸",
    color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
  },
  {
    id: "merry-hall",
    icon: Presentation,
    label: "메리홀",
    color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
  },
];

export function SpacesHero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // 헤더 높이만큼 오프셋
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* 타이틀 */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl lg:text-7xl">
            다양한 공간,
            <br />
            <span className="text-teal">무한한 가능성</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            MERRYHERE는 여러분의 니즈에 맞는 다양한 공간을 제공합니다.
            <br />
            라운지부터 독립 오피스, 미팅룸, 대형 홀까지 모두 갖춰져 있습니다.
          </p>
        </div>

        {/* 공간 네비게이션 카드 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {spaces.map((space) => {
            const Icon = space.icon;
            return (
              <button
                key={space.id}
                onClick={() => scrollToSection(space.id)}
                className="group relative overflow-hidden rounded-2xl border bg-white p-8 text-center transition-all hover:shadow-xl"
              >
                <div className="mb-4 flex justify-center">
                  <div
                    className={`rounded-full p-4 transition-all ${space.color}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">{space.label}</h3>
                <div className="mt-4 text-sm text-muted-foreground">
                  자세히 보기 →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
