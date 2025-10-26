import Link from "next/link";
import { ImageGallery } from "./image-gallery";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Wifi,
  Monitor,
  Archive,
  Clock,
  MapPin,
  Users2,
  ArrowRight,
} from "lucide-react";

const officeImages = [
  "/images/office/오피스1.jpg",
  "/images/office/오피스2.jpg",
  "/images/office/오피스3.jpg",
  "/images/office/오피스4.jpg",
  "/images/office/DSC_2939-4.jpg",
  "/images/office/DSC_2952-5.jpg",
  "/images/office/DSC00463.jpg",
];

const features = [
  {
    icon: Lock,
    title: "프라이빗 공간",
    description: "독립된 업무 공간으로 집중력 극대화",
  },
  {
    icon: Wifi,
    title: "전용 인터넷",
    description: "안정적이고 빠른 네트워크 환경",
  },
  {
    icon: Monitor,
    title: "업무 환경",
    description: "책상, 의자, 수납장 등 완비",
  },
  {
    icon: Archive,
    title: "수납 공간",
    description: "개인 락커 및 서류 보관 가능",
  },
];

const officeTypes = [
  {
    title: "독립 오피스",
    description: "팀 단위로 사용하는 완전 독립 공간",
    capacity: "2~10인",
    features: ["독립 출입문", "팀 사인 부착", "가구 배치 자유", "24시간 이용"],
  },
  {
    title: "고정 좌석",
    description: "개인 전용 책상이 배정되는 좌석",
    capacity: "1인",
    features: ["전용 책상", "개인 락커", "모니터 거치", "평일 09:00-22:00"],
  },
];

const amenities = [
  "에르고노믹 의자",
  "높이 조절 책상 (선택)",
  "개인 수납함",
  "무료 커피 & 차",
  "공용 냉장고",
  "프린터 & 복합기",
  "라운지 이용",
  "미팅룸 예약 (포인트)",
];

const usageInfo = [
  {
    icon: Clock,
    title: "이용 시간",
    content: "독립 오피스: 24시간\n고정 좌석: 평일 09:00-22:00",
  },
  {
    icon: MapPin,
    title: "위치",
    content: "2층 ~ 4층",
  },
  {
    icon: Users2,
    title: "계약",
    content: "최소 3개월 ~ 장기 계약",
  },
];

export function OfficeSection() {
  return (
    <section
      id="office"
      className="scroll-mt-20 bg-gradient-to-b from-white to-gray-50 py-20 md:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-16">
          <div className="mb-4 inline-block rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600">
            OFFICE
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">오피스</h2>
          <p className="max-w-3xl text-xl text-muted-foreground">
            집중력과 프라이버시가 필요한 업무를 위한 전용 공간입니다. 독립
            오피스와 고정 좌석 중 선택하여, 여러분의 업무 스타일에 맞는 환경을
            만들어보세요.
          </p>
        </div>

        {/* 이미지 갤러리 */}
        <div className="mb-20">
          <ImageGallery images={officeImages} alt="오피스" />
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
                  <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3">
                    <Icon className="h-6 w-6 text-blue-600" />
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

        {/* 오피스 타입 */}
        <div className="mb-20">
          <h3 className="mb-8 text-2xl font-bold">오피스 타입</h3>
          <div className="grid gap-8 md:grid-cols-2">
            {officeTypes.map((type) => (
              <div
                key={type.title}
                className="rounded-2xl border bg-white p-8 shadow-lg"
              >
                <h4 className="mb-2 text-2xl font-bold">{type.title}</h4>
                <p className="mb-4 text-muted-foreground">{type.description}</p>
                <div className="mb-6 inline-block rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600">
                  수용 인원: {type.capacity}
                </div>
                <ul className="space-y-3">
                  {type.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
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
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <Icon className="h-5 w-5 text-blue-600" />
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
                  ℹ️ 오피스는 입주 회원 전용 공간입니다.
                  <br />
                  견적 및 계약 문의는 아래 버튼을 통해 신청해주세요.
                </p>
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/#inquiry">
                    입주 문의하기
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
