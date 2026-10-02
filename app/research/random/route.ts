import { NextResponse } from "next/server";
import { libraryArticles } from "@/data/research/library";

/** এলোমেলো নিবন্ধ: a different published article on every visit. */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const pool = libraryArticles.filter((a) => a.status === "published");
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return NextResponse.redirect(new URL(`/research/${encodeURIComponent(pick.slug)}`, request.url), 307);
}
