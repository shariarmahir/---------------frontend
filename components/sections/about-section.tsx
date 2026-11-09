import Link from "next/link";
import { RepairBand } from "@/components/about/blocks";
import { MapRepair } from "@/components/about/map-repair";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { ABOUT_SUMMARY } from "@/data/about";

/**
 * Who Kandari-Lab is, on the home page: the About page's "We repair
 * Bangladesh" band set as a navy card in the content column, the size of
 * the Kandari Profile section, with the map of Bangladesh opening out from
 * under its red pixels when it comes into view (Mahir, 2026-10-24).
 */
export function AboutSection() {
  return (
    <RepairBand
      id="about"
      card
      title={
        <>
          We repair Bangladesh, <span className="text-signal-orange">one pixel at a time.</span>
        </>
      }
      lead={ABOUT_SUMMARY}
      litLead
      art={<MapRepair />}
    >
      <Link href="#kandari-profile" className={btn.gold}>
        Join Kandari Profile
        <Icon name="arrow_forward" className="text-lg" />
      </Link>
      <Link href="/about" className={btn.goldOutline}>
        Read our story
      </Link>
    </RepairBand>
  );
}
