"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Target,
  Users2,
  TrendingUp,
  Award,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    icon: Users2,
    value: "100+",
    label: "입주 기업",
    description: "사회적 가치를 만드는 기업들",
  },
  {
    icon: Target,
    value: "15년",
    label: "운영 경험",
    description: "소셜벤처 생태계 조성",
  },
  {
    icon: TrendingUp,
    value: "500+",
    label: "지원 프로그램",
    description: "성장을 위한 다양한 지원",
  },
  {
    icon: Award,
    value: "50+",
    label: "성공 사례",
    description: "입주 기업의 성장 스토리",
  },
];

const features = [
  {
    title: "사회혁신 네트워크",
    description:
      "MYSC와 함께하는 100개 이상의 소셜벤처 네트워크에 참여하여 협업의 기회를 만들어보세요.",
  },
  {
    title: "전문 컨설팅",
    description:
      "비즈니스 모델부터 투자 유치까지, MYSC의 전문가들이 여러분의 성장을 함께합니다.",
  },
  {
    title: "프로그램 & 이벤트",
    description:
      "정기적인 교육 프로그램, 네트워킹 행사, 워크샵을 통해 지속적으로 성장하세요.",
  },
];

export function MyscSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* 섹션 헤더 */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">
            운영사 소개
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            MYSC와 함께하는
            <br />
            <span className="text-teal">소셜벤처 생태계</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            MYSC는 2011년부터 사회혁신을 위해 노력해온 소셜벤처 전문 기업입니다.
            <br />
            MERRYHERE를 통해 더 많은 소셜벤처의 성장을 지원합니다.
          </p>
        </div>

        {/* 통계 */}
        <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group rounded-2xl border bg-white p-6 text-center transition-all hover:border-teal hover:shadow-lg"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-teal/10 p-3 transition-colors group-hover:bg-teal/20">
                    <Icon className="h-6 w-6 text-teal" />
                  </div>
                </div>
                <div className="mb-2 text-3xl font-bold text-teal">
                  {stat.value}
                </div>
                <div className="mb-1 font-semibold">{stat.label}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* 특징 */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border bg-white p-8 transition-all hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal/10">
                <div className="text-xl font-bold text-teal">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA 배너 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal to-teal-600 p-12 text-white">
          <div className="relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                MYSC와 함께 성장할 준비가 되셨나요?
              </h3>
              <p className="mb-8 text-lg text-white/90">
                MERRYHERE는 단순한 공유 오피스가 아닙니다.
                <br className="hidden md:block" />
                사회적 가치를 만들어가는 여러분의 든든한 동료입니다.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white text-teal hover:bg-gray-100"
                >
                  <Link href="#inquiry">
                    입주 문의하기
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white text-teal hover:bg-gray-100"
                >
                  <Link
                    href="https://mysc.co.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MYSC 자세히 보기
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* 배경 장식 */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10" />
        </div>
      </div>
    </section>
  );
}
