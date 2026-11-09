/*
 * MOTHERLAND: Bangladesh's country profile for the world (Mahir,
 * 2026-11-01), laid out after visittheusa.com and told in Bangladesh's own
 * colours. It has its own header and footer in place of the site's and no
 * issues at all: the National Index and the four civic chapters live under
 * নাগরিক দায়িত্ব (/nagorik). The sections follow Mahir's order: About
 * Bangladesh, History & Society, Science & Tech, Biographies, Animals &
 * Nature, Geography & Travel, Arts & Culture, Pro & Con, Taka, Videos,
 * Capability & Resources, Business & Investment, the three pages with no
 * section of their own, then the call to join. Copy and media: data/motherland.ts.
 */
import type { Metadata } from "next";
import { About } from "@/components/motherland/about";
import { Biographies } from "@/components/motherland/biographies";
import { Culture } from "@/components/motherland/culture";
import { Essentials } from "@/components/motherland/essentials";
import { mlFonts } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { MotherlandHeader } from "@/components/motherland/header";
import { Hero } from "@/components/motherland/hero";
import { History } from "@/components/motherland/history";
import { Invest } from "@/components/motherland/invest";
import { Join } from "@/components/motherland/join";
import { Nature } from "@/components/motherland/nature";
import { ProCon } from "@/components/motherland/procon";
import { Resources } from "@/components/motherland/resources";
import { Science } from "@/components/motherland/science";
import { SideTab } from "@/components/motherland/side-tab";
import { Taka } from "@/components/motherland/taka";
import { Travel } from "@/components/motherland/travel";
import { Videos } from "@/components/motherland/videos";
import { WelcomePopup } from "@/components/motherland/welcome-popup";
import { cn } from "@/lib/utils";
import "./motherland.css";

export const metadata: Metadata = {
  title: "MOTHERLAND | Bangladesh, the country profile",
  alternates: { canonical: "/bangladesh" },
  description:
    "Discover Bangladesh: its history and society, science and technology, the people who shaped it, its wildlife and places, its arts and culture, its money, its films, its resources and where to invest.",
  openGraph: {
    title: "MOTHERLAND | Bangladesh, the country profile",
    description: "A young nation on an ancient delta. Discover Bangladesh's story, people, places and culture.",
    images: ["/motherland/photos/flag-mural.jpg"],
  },
};

export default function BangladeshPage() {
  return (
    <div className={cn(mlFonts, "ml ml-light w-full bg-ml-ground font-ml-sans text-ml-ink")}>
      {/* Without scripts the titles never get their cue to rise, so they start in place. */}
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; } .ml-reveal { opacity: 1 !important; translate: none !important; } .ml-reveal .ml-wipe { clip-path: none !important; } .ml-reveal .ml-settle { transform: none !important; } .ml-film-title { opacity: 1 !important; translate: none !important; filter: none !important; } .ml-collage .ml-shape { opacity: 1 !important; transform: none !important; } .ml-collage .ml-collage-photo, .ml-collage .ml-credit { clip-path: none !important; } .ml-collage .ml-collage-photo img { filter: none !important; }"}</style>
      </noscript>
      <MotherlandHeader />
      <main id="main">
        {/* The welcome bar sits on the hero's bottom edge, so the two share a box. */}
        <div className="relative">
          <Hero />
          <WelcomePopup />
        </div>
        <About />
        <History />
        <Science />
        <Biographies />
        <Nature />
        <Travel />
        <Culture />
        <ProCon />
        <Taka />
        <Videos />
        <Resources />
        <Invest />
        <Essentials />
        <Join />
      </main>
      <SideTab />
      <MotherlandFooter />
    </div>
  );
}
