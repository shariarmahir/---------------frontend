import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { MissionSection } from "@/components/sections/mission-section";
import { ImpactSection } from "@/components/sections/impact-section";
import { ServicesSection } from "@/components/sections/services-section";
import { TeamSection } from "@/components/sections/team-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { DownloadCtaSection } from "@/components/sections/download-cta-section";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <MissionSection />
      <ImpactSection />
      <ServicesSection />
      <TeamSection />
      <TestimonialsSection />
      <DownloadCtaSection />
      <SiteFooter />
    </main>
  );
}
