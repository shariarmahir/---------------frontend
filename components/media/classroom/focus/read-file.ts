"use client";

import { legacyText, officeText } from "@/lib/media/office-text";
import { MAX_BYTES, attachKind, type AttachKind, type TutorFile } from "@/lib/media/tutor";

/** Long side of a photo after shrinking: plenty for a page of text, small enough to send. */
const IMAGE_EDGE = 1600;

async function inflate(raw: Uint8Array): Promise<Uint8Array> {
  const out = new Blob([raw as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function base64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function shrink(file: File): Promise<{ media: string; data: string; preview: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const url = canvas.toDataURL("image/jpeg", 0.85);
  return { media: "image/jpeg", data: url.slice(url.indexOf(",") + 1), preview: url };
}

export interface Picked {
  id: string;
  name: string;
  kind: AttachKind;
  /** What goes to the server. */
  file: TutorFile;
  /** A thumbnail for photos. */
  preview?: string;
}

/** Read a picked file for the tutor, or throw a message the student can act on. */
export async function readForTutor(file: File): Promise<Picked> {
  const kind = attachKind(file.name, file.type);
  if (!kind) throw new Error("এই ধরনের ফাইল পড়া যায় না — ছবি, PDF, Word বা PowerPoint দিন।");
  if (file.size > MAX_BYTES[kind]) throw new Error(kind === "pdf" ? "PDF-টা বেশি বড় — দরকারি পাতাগুলো আলাদা PDF করে দিন।" : "ফাইলটা অনেক বড়।");
  const id = `${file.name}-${file.size}-${file.lastModified}`;
  if (kind === "image") {
    const { media, data, preview } = await shrink(file).catch(() => {
      throw new Error("ছবিটা খোলা গেল না — JPG বা PNG দিন।");
    });
    return { id, name: file.name, kind, preview, file: { name: file.name, kind: "image", media, data } };
  }
  if (kind === "pdf") return { id, name: file.name, kind, file: { name: file.name, kind: "pdf", media: "application/pdf", data: base64(await file.arrayBuffer()) } };
  if (kind === "text") return { id, name: file.name, kind, file: { name: file.name, kind: "text", media: "text/plain", data: (await file.text()).slice(0, 40_000) } };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const text = kind === "office" ? await officeText(bytes, inflate).catch(() => null) : legacyText(bytes);
  if (!text) throw new Error(kind === "legacy" ? "পুরোনো .doc/.ppt ফাইলের লেখা পাওয়া গেল না — .docx/.pptx বা PDF করে দিন।" : "ফাইলের ভেতরে লেখা পাওয়া গেল না।");
  return { id, name: file.name, kind, file: { name: file.name, kind: "text", media: "text/plain", data: text } };
}
