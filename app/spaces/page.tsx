import { SpacesHero } from "@/components/spaces/spaces-hero";
import { LoungeSection } from "@/components/spaces/lounge-section";
import { OfficeSection } from "@/components/spaces/office-section";
import { MeetingRoomSection } from "@/components/spaces/meeting-room-section";
import { MerryHallSection } from "@/components/spaces/merry-hall-section";
import { SpacesCTA } from "@/components/spaces/spaces-cta";

export const metadata = {
  title: "공간 소개 | MERRYHERE",
  description: "라운지, 오피스, 미팅룸, 메리홀 - MERRYHERE의 다양한 공간을 만나보세요.",
};

export default function SpacesPage() {
  return (
    <main className="min-h-screen">
      <SpacesHero />
      <LoungeSection />
      <OfficeSection />
      <MeetingRoomSection />
      <MerryHallSection />
      <SpacesCTA />
    </main>
  );
}
