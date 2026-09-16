import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/sections/hero-section";
import { MissionSection } from "@/components/sections/mission-section";
import { ImpactSection } from "@/components/sections/impact-section";
import { ServicesSection } from "@/components/sections/services-section";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <MissionSection />
      <ImpactSection />
      <ServicesSection />
    </main>
  );
}
