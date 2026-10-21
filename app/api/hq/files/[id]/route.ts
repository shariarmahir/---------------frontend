import { promises as fs } from "node:fs";
import path from "node:path";
import { currentSession, fail } from "@/lib/hq/server/session";
import { DATA_DIR } from "@/lib/hq/server/store";

/** Images, PDFs, audio and video open in the browser; anything else (HTML, SVG…) only downloads, so it can't run as this site. */
const INLINE = /^(image\/(png|jpe?g|webp|gif|avif)|application\/pdf|video\/(mp4|webm)|audio\/(mpeg|ogg|wav|webm))$/;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await currentSession();
  if (!s) return fail("Please sign in again.", 401);
  const { id } = await params;
  if (!/^f-[a-z0-9]+$/.test(id)) return fail("File not found.", 404);
  const meta = s.db.files.find((f) => f.id === id);
  if (!meta) return fail("File not found.", 404);
  if (meta.visibleTo !== "all" && !meta.visibleTo.includes(s.person.id) && s.person.level !== "prime") return fail("You don't have access to this file.", 403);
  const data = await fs.readFile(path.join(DATA_DIR, "files", id)).catch(() => null);
  if (!data) return fail("File not found.", 404);
  const inline = INLINE.test(meta.type) && !new URL(req.url).searchParams.has("download");
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": inline ? meta.type : "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(meta.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
