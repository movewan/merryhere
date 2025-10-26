import { ImageGallery } from "./image-gallery";
import { Coffee, Wifi, Tv, Users2, Clock, MapPin } from "lucide-react";

const loungeImages = [
  "/images/lounge/라운지1.jpg",
  "/images/lounge/라운지2.jpg",
  "/images/lounge/라운지3.jpg",
  "/images/lounge/라운지4.jpg",
  "/images/lounge/라운지5.jpg",
  "/images/lounge/라운지6.jpg",
  "/images/lounge/라운지7.jpg",
  "/images/lounge/라운지8.jpg",
];

const features = [
  {
    icon: Coffee,
    title: "무료 커피 & 차",
    description: "다양한 커피와 차를 무제한 제공",
  },
  {
    icon: Wifi,
    title: "초고속 Wi-Fi",
    description: "기가 인터넷으로 빠른 업무 환경",
  },
  {
    icon: Tv,
    title: "대형 스크린",
    description: "캐주얼 미팅 및 프레젠테이션 가능",
  },
  {
    icon: Users2,
    title: "네트워킹",
    description: "소셜벤처 간 자유로운 교류",
  },
];

const amenities = [
  "편안한 소파 & 의자",
  "스탠딩 테이블",
  "개인 작업 공간",
  "충전 콘센트",
  "냉장고 & 전자레인지",
  "정수기",
  "프린터 & 복합기",
  "락커 (유료)",
];

const usageInfo = [
  {
    icon: Clock,
    title: "이용 시간",
    content: "평일 09:00 - 22:00",
  },
  {
    icon: MapPin,
    title: "위치",
    content: "1층 (입구 바로 옆)",
  },
  {
    icon: Users2,
    title: "수용 인원",
    content: "최대 50명",
  },
];

export function LoungeSection() {
  return (
    <section id="lounge" className="scroll-mt-20 py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-16">
          <div className="mb-4 inline-block rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">
            LOUNGE
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">라운지</h2>
          <p className="max-w-3xl text-xl text-muted-foreground">
            자유롭고 편안한 분위기에서 업무와 네트워킹을 동시에 즐길 수 있는
            공간입니다. 무료 커피와 차를 마시며 다른 입주사 멤버들과 소통하고,
            아이디어를 교환해보세요.
          </p>
        </div>

        {/* 이미지 갤러리 */}
        <div className="mb-20">
          <ImageGallery images={loungeImages} alt="라운지" />
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
                  <div className="mb-4 inline-flex rounded-lg bg-teal/10 p-3">
                    <Icon className="h-6 w-6 text-teal" />
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

        {/* 시설 정보 & 이용 안내 */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* 시설 정보 */}
          <div>
            <h3 className="mb-6 text-2xl font-bold">시설 정보</h3>
            <div className="rounded-xl border bg-white p-8">
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal" />
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
                    <div className="rounded-lg bg-teal/10 p-3">
                      <Icon className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <div className="mb-1 font-semibold">{info.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {info.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-xl border bg-gray-50 p-6">
                <p className="text-sm text-muted-foreground">
                  ℹ️ 라운지는 입주 회원 및 방문객 모두 이용 가능합니다.
                  <br />단, 혼잡 시 입주 회원 우선 이용 원칙이 적용됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
