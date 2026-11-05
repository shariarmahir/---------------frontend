"use client";

import Image from "next/image";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { docTone, fileTooBig, fitWithin, noteFileName, type ClassNote, type NoteFile } from "@/lib/media/classroom";
import { mediaButton } from "../ui/button-styles";

export const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;
const isPdf = (f: NoteFile) => f.type === "application/pdf";

function readDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/**
 * A photo or PDF ready to keep with a note. Photos are shrunk to 1600px and
 * saved as JPEG; `scan` also turns the page into a clean black-on-white copy.
 * Throws with a message for the reader when the file cannot be kept.
 */
export async function toNoteFile(file: File, scan: boolean): Promise<NoteFile> {
  if (file.type === "application/pdf") {
    if (fileTooBig(file.size)) throw new Error("পিডিএফ ১.৫ MB-এর বেশি — ছোট ফাইল দিন বা পাতাগুলো স্ক্যান করুন।");
    return { name: file.name, type: file.type, size: file.size, data: await readDataUrl(file) };
  }
  if (!file.type.startsWith("image/")) throw new Error("শুধু ছবি বা পিডিএফ দেওয়া যাবে।");

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = fitWithin(bitmap.width, bitmap.height, 1600);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  if (scan) {
    const img = ctx.getImageData(0, 0, width, height);
    const px = img.data;
    for (let i = 0; i < px.length; i += 4) {
      const v = docTone(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
      px[i] = px[i + 1] = px[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
  }
  const data = canvas.toDataURL("image/jpeg", scan ? 0.7 : 0.78);
  const size = Math.round((data.length - data.indexOf(",") - 1) * 0.75);
  if (fileTooBig(size)) throw new Error("ছবিটা অনেক বড় — আরেকটু কাছ থেকে তুলুন।");
  const base = file.name.replace(/\.[^.]+$/, "") || "scan";
  return { name: `${scan ? "scan-" : ""}${base}.jpg`, type: "image/jpeg", size, data };
}

const blobOf = async (data: string) => (await fetch(data)).blob();

/** A blob URL for the PDF reader (browsers will not frame a data: PDF). */
export async function readerUrl(note: ClassNote): Promise<string | undefined> {
  return note.file && isPdf(note.file) ? URL.createObjectURL(await blobOf(note.file.data)) : undefined;
}

/** Save the attachment, or the note itself as a text file. */
export async function downloadNote(note: ClassNote) {
  const blob = note.file
    ? await blobOf(note.file.data)
    : new Blob([`﻿${note.title}\n\n${note.text}\n`], { type: "text/plain;charset=utf-8" });
  const ext = note.file ? (isPdf(note.file) ? "pdf" : "jpg") : "txt";
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: noteFileName(note.title, ext) });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The attachment as it sits on a card: a page preview or a PDF tile. */
export function FilePreview({ file, onOpen }: { file: NoteFile; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group mt-3 block w-full overflow-hidden rounded-xl bg-white/65 text-left ring-1 ring-m-ink/9 transition-[box-shadow] hover:ring-m-blue/60">
      {isPdf(file) ? (
        <span className="flex items-center gap-3 p-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-m-red text-m-on"><FileText className="size-5" aria-hidden /></span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-m-ink">{file.name}</span>
            <span className="text-xs text-m-ink/60">পিডিএফ · {kb(file.size)}</span>
          </span>
        </span>
      ) : (
        <span className="relative block h-44">
          <Image src={file.data} alt="" fill unoptimized sizes="600px" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
        </span>
      )}
    </button>
  );
}

/** Full-height reader: the page or PDF, then the details. */
export function NoteReader({ note, url, author, onClose }: { note: ClassNote | null; url?: string; author: string; onClose: () => void }) {
  return (
    <Dialog open={Boolean(note)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[94dvh] w-[calc(100vw-1.5rem)] flex-col gap-4 overflow-hidden rounded-3xl p-0 font-sans sm:max-w-4xl">
        {note && (
          <>
            <DialogHeader className="border-b border-m-ink/9 px-5 pt-5 pb-4 pr-12">
              <DialogTitle className="text-xl leading-snug font-bold text-m-ink">{note.title}</DialogTitle>
              <DialogDescription>{author}{note.file ? ` · ${note.file.name} · ${kb(note.file.size)}` : ""}</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-2">
              {note.file &&
                (url ? (
                  <iframe src={url} title={note.title} className="h-[65dvh] w-full rounded-xl bg-white" />
                ) : (
                  // A note page is read top to bottom, so it keeps its own width.
                  <Image src={note.file.data} alt={note.title} width={1600} height={2200} unoptimized className="h-auto w-full rounded-xl bg-white" />
                ))}
              {note.text && <p className="text-[17px] leading-loose whitespace-pre-line text-m-ink/90">{note.text}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-m-ink/9 px-5 py-4">
              <button type="button" onClick={() => downloadNote(note)} className={mediaButton({ variant: "primary" })}>
                <Download aria-hidden /> ডাউনলোড
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
