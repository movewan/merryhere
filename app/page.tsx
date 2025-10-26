import { HeroSection } from "@/components/home/hero-section";
import { SpacesSection } from "@/components/home/spaces-section";
import { MyscSection } from "@/components/home/mysc-section";
import { InquirySection } from "@/components/home/inquiry-section";
import { FloatingButtons } from "@/components/home/floating-buttons";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <SpacesSection />
      <MyscSection />
      <InquirySection />
      <FloatingButtons />
    </main>
  );
}
