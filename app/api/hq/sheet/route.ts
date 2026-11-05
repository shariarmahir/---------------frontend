import { NextResponse } from "next/server";
import { can } from "@/lib/hq/rules";
import { currentSession, fail } from "@/lib/hq/server/session";

const MAX = 5 * 1024 * 1024;

/** A CSV line parser that understands quoted cells. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

/**
 * Reads a Google Sheet that was published to the web as CSV
 * (File → Share → Publish to web → CSV). Only docs.google.com spreadsheet
 * URLs are fetched, with no redirects, a 5 MB cap and a 10 s timeout, so
 * this can't be pointed at anything else.
 */
export async function GET(req: Request) {
  const s = await currentSession();
  if (!s) return fail("Please sign in again.", 401);
  if (!can(s.person, "finance.edit") && !can(s.person, "content.manage")) return fail("You don't have permission to import sheets.", 403);
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fail("That isn't a link.");
  }
  const ok = url.protocol === "https:" && url.hostname === "docs.google.com" && /^\/spreadsheets\/d\/(e\/)?[\w-]+\/(pub|export)$/.test(url.pathname) && (url.searchParams.get("output") === "csv" || url.searchParams.get("format") === "csv");
  if (!ok) return fail("Use a Google Sheet link published as CSV (it ends in output=csv).");
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (res.status >= 300 && res.status < 400) {
      const next = new URL(res.headers.get("location") ?? "", url);
      if (!next.hostname.endsWith(".googleusercontent.com") && next.hostname !== "docs.google.com") return fail("The sheet redirected somewhere unexpected.");
      const again = await fetch(next, { redirect: "error", signal: AbortSignal.timeout(10_000), cache: "no-store" });
      return answer(again);
    }
    return answer(res);
  } catch {
    return fail("The sheet couldn't be read. Is it published to the web?", 502);
  }
}

async function answer(res: Response): Promise<NextResponse> {
  if (!res.ok) return fail("The sheet couldn't be read. Is it published to the web?", 502);
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len > MAX) return fail("The sheet is larger than 5 MB.", 413);
  const text = await res.text();
  if (text.length > MAX) return fail("The sheet is larger than 5 MB.", 413);
  const rows = parseCsv(text);
  const [head = [], ...body] = rows;
  const keys = head.map((h) => h.trim().toLowerCase());
  return NextResponse.json({ rows: body.slice(0, 2000).map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()]))) });
}
