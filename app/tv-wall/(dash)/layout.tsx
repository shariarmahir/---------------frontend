/*
 * THESIS: the whole country on one dashboard, as it is being reported right
 * now; one segment per page, the way a newsroom's wall is read.
 * OWN-WORLD: the landing page's: a pitch-black ground, panels on navy, ink
 * and cobalt fields with a faint ring, gold titles and actions, the flag's
 * red only for harm (tallies, red zones, the ticker's label).
 * STRUCTURE: a sidebar of segments (Overview, Crime map, Crime &
 * corruption, Live TV, Analysis, Achievements, Economy, Losses &
 * environment, Sources & sharing), one control bar shared by every page,
 * the page beside them. English first; Bangla fields wait in the data.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DashboardShell } from "@/components/tv-wall/dashboard-shell";
import { WallProvider } from "@/components/tv-wall/wall-context";
import { getWall } from "@/lib/tv-wall/server";

export const metadata: Metadata = {
  title: { default: "National TV Wall | Kandari-Lab", template: "%s · National TV Wall | Kandari-Lab" },
  description:
    "Crime, corruption, accidents, achievements, development and the economy across Bangladesh, on a district map, live. Free for everyone; runs on a TV, on YouTube Live and on any site.",
  openGraph: {
    title: "National TV Wall: Bangladesh, live",
    description: "Crime red zones, achievements, the economy, weather and live news channels on one dashboard.",
  },
};

// Rendered per request from the collectors' in-memory cache (news two
// minutes, readings ten); the dashboard then refreshes itself in the browser.
export const dynamic = "force-dynamic";

export default async function TvWallLayout({ children }: { children: ReactNode }) {
  const wall = await getWall();
  return (
    <>
      <SiteHeader />
      <div className="relative w-full bg-black pt-header text-white scheme-dark lg:pt-header-lg">
        <WallProvider initial={wall}>
          <DashboardShell>{children}</DashboardShell>
        </WallProvider>
      </div>
      <SiteFooter />
    </>
  );
}
