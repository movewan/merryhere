import Link from "next/link";
import { ImageGallery } from "./image-gallery";
import { Button } from "@/components/ui/button";
import {
  Presentation,
  Wifi,
  Video,
  Clipboard,
  Clock,
  Users2,
  Coins,
  ArrowRight,
} from "lucide-react";

const meetingRoomImages = [
  "/images/meeting-room/미팅룸1.jpg",
  "/images/meeting-room/미팅룸2.jpg",
  "/images/meeting-room/미팅룸3.jpg",
  "/images/meeting-room/미팅룸4.jpg",
  "/images/meeting-room/DSC_2877-2.jpg",
  "/images/meeting-room/DSC_2905-2.jpg",
  "/images/meeting-room/DSC_2906-2.jpg",
  "/images/meeting-room/DSC_2953.jpg",
];

const features = [
  {
    icon: Presentation,
    title: "빔 프로젝터",
    description: "Full HD 프로젝터 & 대형 스크린",
  },
  {
    icon: Video,
    title: "화상회의 장비",
    description: "고화질 웹캠 & 스피커폰",
  },
  {
    icon: Clipboard,
    title: "화이트보드",
    description: "대형 화이트보드 & 마커 제공",
  },
  {
    icon: Wifi,
    title: "초고속 Wi-Fi",
    description: "안정적인 네트워크 환경",
  },
];

const rooms = [
  {
    name: "미팅룸 A",
    capacity: "4인",
    features: ["빔 프로젝터", "화이트보드", "TV 모니터"],
    pointsPer30min: 2,
  },
  {
    name: "미팅룸 B",
    capacity: "6인",
    features: ["빔 프로젝터", "화이트보드", "화상회의 장비"],
    pointsPer30min: 3,
  },
  {
    name: "미팅룸 C",
    capacity: "8인",
    features: ["빔 프로젝터", "화이트보드", "TV 모니터", "소파"],
    pointsPer30min: 4,
  },
  {
    name: "미팅룸 D",
    capacity: "10인",
    features: ["빔 프로젝터", "화이트보드", "화상회의 장비", "대형 테이블"],
    pointsPer30min: 5,
  },
];

const amenities = [
  "Full HD 빔 프로젝터",
  "화상회의 장비",
  "대형 화이트보드",
  "TV 모니터 (일부)",
  "책상 & 의자",
  "무료 커피 & 차",
  "문서 캐비닛",
  "조명 조절",
];

const usageInfo = [
  {
    icon: Clock,
    title: "예약 시간",
    content: "최소 30분 ~ 최대 4시간",
  },
  {
    icon: Users2,
    title: "이용 대상",
    content: "입주 회원 전용",
  },
  {
    icon: Coins,
    title: "포인트 제도",
    content: "30분당 2~5 포인트",
  },
];

export function MeetingRoomSection() {
  return (
    <section id="meeting-room" className="scroll-mt-20 py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-16">
          <div className="mb-4 inline-block rounded-full bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-600">
            MEETING ROOM
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">미팅룸</h2>
          <p className="max-w-3xl text-xl text-muted-foreground">
            프로젝터, 화상회의 장비, 화이트보드 등 전문 장비가 갖춰진 미팅 공간입니다.
            내부 회의부터 고객 미팅, 워크샵까지 다양한 용도로 활용할 수 있습니다.
          </p>
        </div>

        {/* 이미지 갤러리 */}
        <div className="mb-20">
          <ImageGallery images={meetingRoomImages} alt="미팅룸" />
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
                  <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3">
                    <Icon className="h-6 w-6 text-purple-600" />
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

        {/* 미팅룸 종류 */}
        <div className="mb-20">
          <h3 className="mb-8 text-2xl font-bold">미팅룸 종류</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room) => (
              <div
                key={room.name}
                className="rounded-2xl border bg-white p-6 shadow-lg"
              >
                <h4 className="mb-2 text-xl font-bold">{room.name}</h4>
                <div className="mb-4 inline-block rounded-full bg-purple-500/10 px-3 py-1 text-sm font-semibold text-purple-600">
                  수용: {room.capacity}
                </div>
                <ul className="mb-4 space-y-2">
                  {room.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-purple-500/5 p-3 text-center">
                  <div className="text-xs text-muted-foreground">30분당</div>
                  <div className="text-lg font-bold text-purple-600">
                    {room.pointsPer30min} 포인트
                  </div>
                </div>
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
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
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
                    <div className="rounded-lg bg-purple-500/10 p-3">
                      <Icon className="h-5 w-5 text-purple-600" />
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
                  ℹ️ 미팅룸은 웹사이트에서 실시간 예약이 가능합니다.
                  <br />
                  입주 회원은 개인/팀 포인트로 예약할 수 있습니다.
                </p>
                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Link href="/rooms">
                    미팅룸 예약하기
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
