import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import type { FileMeta } from "@/lib/hq/types";
import { currentSession, fail } from "@/lib/hq/server/session";
import { DATA_DIR, mutate } from "@/lib/hq/server/store";

const FILES_DIR = path.join(DATA_DIR, "files");
const MAX = 25 * 1024 * 1024;

/**
 * Uploads one file (form field `file`; optional `visibleTo` = JSON array of
 * person ids, default everyone signed in). Answers its FileMeta; attach the
 * id to a task notebook, message, document or story.
 */
export async function POST(req: Request) {
  const s = await currentSession();
  if (!s) return fail("Please sign in again.", 401);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("No file was received.");
  if (file.size === 0) return fail("The file is empty.");
  if (file.size > MAX) return fail("Files can't be larger than 25 MB.", 413);
  let visibleTo: FileMeta["visibleTo"] = "all";
  const raw = form?.get("visibleTo");
  if (typeof raw === "string" && raw) {
    try {
      const ids = JSON.parse(raw) as unknown;
      if (Array.isArray(ids) && ids.every((x) => typeof x === "string")) visibleTo = [...new Set([s.person.id, ...ids])];
    } catch {
      return fail("Who may see the file wasn't understood.");
    }
  }
  const id = `f-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  await fs.mkdir(FILES_DIR, { recursive: true });
  await fs.writeFile(path.join(FILES_DIR, id), Buffer.from(await file.arrayBuffer()));
  const meta: FileMeta = {
    id,
    name: file.name.slice(0, 160) || "file",
    type: file.type.slice(0, 100) || "application/octet-stream",
    size: file.size,
    by: s.person.id,
    at: new Date().toISOString(),
    visibleTo,
  };
  await mutate((d) => {
    d.files.push(meta);
    return null;
  });
  return NextResponse.json({ file: meta });
}
