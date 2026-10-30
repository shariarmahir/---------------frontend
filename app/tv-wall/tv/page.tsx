import type { Metadata } from "next";
import { TvScreen } from "@/components/tv-wall/wall";
import { WallProvider } from "@/components/tv-wall/wall-context";
import { getWall } from "@/lib/tv-wall/server";

export const metadata: Metadata = {
  title: "National TV Wall: TV screen",
  description: "The National TV Wall for TVs, OBS and embeds: no site menu, it changes screens by itself.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * The TV-screen wall: no site header or footer, on air from the start. This
 * is the address for Android TV browsers, app WebViews, OBS browser sources
 * and other sites' iframes (it may be framed anywhere).
 */
export default async function TvWallScreen() {
  const wall = await getWall();
  return (
    <main className="w-full bg-black text-white scheme-dark">
      <WallProvider initial={wall}>
        <TvScreen />
      </WallProvider>
    </main>
  );
}
