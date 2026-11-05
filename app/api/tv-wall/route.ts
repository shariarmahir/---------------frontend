import { NextResponse } from "next/server";
import { getWall } from "@/lib/tv-wall/server";

/**
 * GET /api/tv-wall: the National TV Wall's payload (news wire, city
 * readings, earthquakes, exchange rates, live channels). Public and free:
 * any page, app or TV can poll it. CDNs may hold it for a minute.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const wall = await getWall();
  return NextResponse.json(wall, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=240",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
