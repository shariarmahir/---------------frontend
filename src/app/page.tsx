import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/sections/hero-section";
import { MissionSection } from "@/components/sections/mission-section";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <MissionSection />
    </main>
  );
}
