import Link from "next/link";
import { ImageGallery } from "./image-gallery";
import { Button } from "@/components/ui/button";
import {
  Presentation,
  Mic2,
  Music,
  Video,
  Users,
  Calendar,
  Mail,
  ArrowRight,
} from "lucide-react";

const merryHallImages = [
  "/images/merry-hall/메리홀1.jpg",
  "/images/merry-hall/메리홀2.jpg",
  "/images/merry-hall/메리홀3.jpg",
  "/images/merry-hall/KakaoTalk_20230614_163527167_01.jpg",
  "/images/merry-hall/KakaoTalk_20230614_163527167_02.jpg",
  "/images/merry-hall/KakaoTalk_20230614_163527167_03.jpg",
];

const features = [
  {
    icon: Presentation,
    title: "대형 프로젝터",
    description: "Full HD 프로젝터 & 초대형 스크린",
  },
  {
    icon: Mic2,
    title: "음향 시설",
    description: "프로페셔널 음향 & 무선 마이크",
  },
  {
    icon: Video,
    title: "영상 촬영",
    description: "방송 카메라 & 조명 장비",
  },
  {
    icon: Music,
    title: "이벤트 장비",
    description: "스테이지 & 무대 조명",
  },
];

const eventTypes = [
  {
    title: "세미나 & 컨퍼런스",
    description: "대규모 세미나, 컨퍼런스, 심포지엄",
    icon: Presentation,
  },
  {
    title: "워크샵 & 교육",
    description: "팀 빌딩, 교육 프로그램, 트레이닝",
    icon: Users,
  },
  {
    title: "네트워킹 행사",
    description: "데모데이, 피칭, 네트워킹 파티",
    icon: Users,
  },
  {
    title: "공연 & 상영회",
    description: "소규모 공연, 영화 상영회, 전시",
    icon: Music,
  },
];

const amenities = [
  "Full HD 프로젝터 & 초대형 스크린",
  "무선 마이크 4개 (핸드+핀)",
  "프로페셔널 음향 시스템",
  "무대 조명",
  "의자 100석",
  "이동식 테이블",
  "화이트보드 & 플립차트",
  "Wi-Fi",
];

const layoutOptions = [
  { name: "세미나형", capacity: "100명", description: "강연 및 발표 형식" },
  { name: "극장형", capacity: "120명", description: "공연 및 상영회" },
  { name: "연회형", capacity: "80명", description: "테이블 배치 행사" },
  { name: "스탠딩", capacity: "150명", description: "네트워킹 파티" },
];

const usageInfo = [
  {
    icon: Calendar,
    title: "예약 방법",
    content: "최소 2주 전 사전 예약 필수",
  },
  {
    icon: Users,
    title: "이용 대상",
    content: "입주사 우선, 외부 대관 가능",
  },
  {
    icon: Mail,
    title: "문의",
    content: "hello@merryhere.kr",
  },
];

export function MerryHallSection() {
  return (
    <section
      id="merry-hall"
      className="scroll-mt-20 bg-gradient-to-b from-white to-gray-50 py-20 md:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-16">
          <div className="mb-4 inline-block rounded-full bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-600">
            MERRY HALL
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">메리홀</h2>
          <p className="max-w-3xl text-xl text-muted-foreground">
            최대 150명을 수용할 수 있는 다목적 이벤트 홀입니다. 세미나,
            컨퍼런스, 워크샵, 네트워킹 행사, 소규모 공연까지 다양한 대규모
            행사를 개최할 수 있습니다.
          </p>
        </div>

        {/* 이미지 갤러리 */}
        <div className="mb-20">
          <ImageGallery images={merryHallImages} alt="메리홀" />
        </div>

        {/* 주요 특징 */}
        <div className="mb-20">
          <h3 className="mb-8 text-2xl font-bold">주요 특징</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-white p-6"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-orange-500/10 p-3">
                    <Icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="mb-2 font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 행사 유형 */}
        <div className="mb-20">
          <h3 className="mb-8 text-2xl font-bold">가능한 행사 유형</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {eventTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className="rounded-2xl border bg-white p-6 text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-orange-500/10 p-4">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <h4 className="mb-2 font-bold">{type.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 레이아웃 옵션 */}
        <div className="mb-20">
          <h3 className="mb-8 text-2xl font-bold">레이아웃 옵션</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {layoutOptions.map((layout) => (
              <div
                key={layout.name}
                className="rounded-xl border bg-white p-6 text-center"
              >
                <h4 className="mb-2 text-lg font-bold">{layout.name}</h4>
                <div className="mb-3 text-2xl font-bold text-orange-600">
                  {layout.capacity}
                </div>
                <p className="text-sm text-muted-foreground">
                  {layout.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-orange-500/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              ℹ️ 행사 목적에 맞게 자유롭게 배치 가능합니다. 레이아웃 변경 시
              추가 비용이 발생할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 시설 정보 & 이용 안내 */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* 시설 정보 */}
          <div>
            <h3 className="mb-6 text-2xl font-bold">시설 정보</h3>
            <div className="rounded-xl border bg-white p-8">
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 이용 안내 */}
          <div>
            <h3 className="mb-6 text-2xl font-bold">이용 안내</h3>
            <div className="space-y-4">
              {usageInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <div
                    key={info.title}
                    className="flex items-start gap-4 rounded-xl border bg-white p-6"
                  >
                    <div className="rounded-lg bg-orange-500/10 p-3">
                      <Icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="mb-1 font-semibold">{info.title}</div>
                      <div className="whitespace-pre-line text-sm text-muted-foreground">
                        {info.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-xl border bg-gray-50 p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  ℹ️ 메리홀 대관은 별도 문의가 필요합니다.
                  <br />
                  행사 일정, 규모, 필요 장비 등을 상세히 알려주시면 맞춤 견적을
                  제공해드립니다.
                </p>
                <Button
                  asChild
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Link href="/#inquiry">
                    대관 문의하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
