"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, EyeOff, ImagePlus, ShieldAlert, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import { districts } from "@/data/media/districts";
import { fileTooBig } from "@/lib/media/classroom";
import { CRIME_KINDS, pixelBox, privacyIssues, type CrimeKind, type CrimeMedia, type CrimePost } from "@/lib/media/crime";
import { newId, updateMedia } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { toNoteFile } from "../classroom/note-files";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";

const PLEDGES = ["যা লিখছি তা নিজে দেখেছি বা নিশ্চিতভাবে জানি", "কারো নাম, ফোন নম্বর বা বাসার ঠিকানা দিইনি", "ভুক্তভোগী বা শিশুর মুখ দেখা যাচ্ছে না"];
const WITNESS_HINT = "আশপাশের মানুষ 'আমিও দেখেছি' দিলে পোস্টটি নিশ্চিত হবে।";
const ISSUE_BN = { phone: "ফোন নম্বর", id: "পরিচয়পত্রের নম্বর", email: "ইমেইল" };

type Draft = CrimeMedia & { original?: string };

const readDataUrl = (f: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });

/** Pixelate a square around a tap (fx, fy in 0–1) — for faces and number plates. */
async function coverAt(src: string, fx: number, fy: number): Promise<string> {
  const bmp = await createImageBitmap(await (await fetch(src)).blob());
  const c = Object.assign(document.createElement("canvas"), { width: bmp.width, height: bmp.height });
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  const box = pixelBox(fx * bmp.width, fy * bmp.height, bmp.width, bmp.height, 0.16);
  const tiny = Object.assign(document.createElement("canvas"), { width: 8, height: 8 });
  tiny.getContext("2d")!.drawImage(c, box.x, box.y, box.size, box.size, 0, 0, 8, 8);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tiny, 0, 0, 8, 8, box.x, box.y, box.size, box.size);
  bmp.close();
  return c.toDataURL("image/jpeg", 0.8);
}

export function CrimeComposer({ open, onOpenChange, me }: { open: boolean; onOpenChange: (v: boolean) => void; me: string }) {
  const [kind, setKind] = useState<CrimeKind>("nuisance");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [area, setArea] = useState("");
  const [district, setDistrict] = useState("ঢাকা");
  const [media, setMedia] = useState<Draft[]>([]);
  const [anonymous, setAnonymous] = useState(true);
  const [sensitive, setSensitive] = useState(false);
  const [reported, setReported] = useState(false);
  const [pledged, setPledged] = useState<boolean[]>([false, false, false]);
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);

  const issues = privacyIssues(`${title} ${body}`);
  const ready = title.trim().length >= 8 && area.trim().length >= 2 && pledged.every(Boolean) && issues.length === 0;
  const line = CRIME_KINDS[kind].line;

  async function add(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])].slice(0, 4 - media.length);
    e.target.value = "";
    setBusy(true);
    for (const f of files) {
      try {
        if (f.type.startsWith("video/")) {
          if (fileTooBig(f.size)) throw new Error("ভিডিও ১.৫ MB-এর বেশি। সার্ভার চালু হওয়ার আগে শুধু ছোট ক্লিপ রাখা যায় — ১০–১৫ সেকেন্ডের ক্লিপ দিন।");
          const src = await readDataUrl(f);
          setMedia((m) => [...m, { kind: "video", label: f.name, src }]);
        } else {
          const n = await toNoteFile(f, false);
          setMedia((m) => [...m, { kind: "image", label: f.name, src: n.data, original: n.data }]);
        }
      } catch (err) {
        toast.error("ফাইল যোগ হলো না", { description: err instanceof Error ? err.message : undefined });
      }
    }
    setBusy(false);
  }

  async function cover(i: number, e: React.MouseEvent<HTMLButtonElement>) {
    const m = media[i];
    if (m.kind !== "image" || !m.src) return;
    const r = e.currentTarget.getBoundingClientRect();
    const src = await coverAt(m.src, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    setMedia((all) => all.map((x, k) => (k === i ? { ...x, src } : x)));
  }

  function publish(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!ready) return;
    const post: CrimePost = {
      id: newId("cr"),
      kind,
      title: title.trim(),
      body: body.trim(),
      area: area.trim(),
      district,
      at: new Date().toISOString(),
      by: anonymous ? null : me,
      media: media.map(({ kind: k, label, src }) => ({ kind: k, label, src })),
      sensitive: sensitive || undefined,
      witnesses: 0,
      flags: 0,
      reportedTo: reported ? line.tel : undefined,
    };
    const saved = updateMedia((s) => ({ ...s, crimePosts: [post, ...s.crimePosts] }));
    onOpenChange(false);
    setTitle("");
    setBody("");
    setArea("");
    setMedia([]);
    setPledged([false, false, false]);
    setTried(false);
    if (saved) toast.success("পোস্ট হলো", { description: `${WITNESS_HINT} জরুরি হলে ${line.tel}-এ ফোন করুন।` });
    else toast.error("ব্রাউজারে জায়গা শেষ", { description: "পোস্টটি এই ভিজিটে আছে, কিন্তু পরে থাকবে না। ছবি কমিয়ে আবার দিন।" });
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-2xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-white">ঘটনা পোস্ট করুন</DialogTitle>
          <DialogDescription>কী দেখেছেন, কোথায়, কখন — প্রমাণসহ। মানুষ নয়, ঘটনাকে দেখান।</DialogDescription>
        </DialogHeader>

        <form onSubmit={publish} noValidate className="space-y-5">
          <fieldset>
            <legend className={label}>কী ধরনের ঘটনা</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CRIME_KINDS) as CrimeKind[]).map((k) => (
                <label key={k} className={choiceClass(kind === k)}>
                  <input type="radio" name="crime-kind" className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                  {CRIME_KINDS[k].bn}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-white/65">{CRIME_KINDS[kind].hint}</p>
          </fieldset>

          <label className="block">
            <span className={label}>শিরোনাম — এক লাইনে</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="যেমন: বাজারে প্রতি দোকান থেকে সাপ্তাহিক চাঁদা" aria-invalid={tried && title.trim().length < 8} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>এলাকা বা জায়গা</span>
              <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="মোড়, বাজার, রুট — বাসার ঠিকানা নয়" aria-invalid={tried && area.trim().length < 2} />
            </label>
            <label className="block">
              <span className={label}>জেলা</span>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectClass}>
                {districts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className={label}>কী হয়েছে</span>
            <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="সময়, কী দেখেছেন, কতবার ঘটে, কারা ক্ষতিগ্রস্ত — অনুমান নয়, যা দেখেছেন" />
          </label>
          {issues.length > 0 && (
            <p role="alert" className="live-in flex gap-2 rounded-xl bg-national-crimson px-3 py-2 text-sm font-semibold text-white">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {issues.map((i) => ISSUE_BN[i]).join(", ")} সরান — কারো ব্যক্তিগত তথ্য পোস্টে দেওয়া যায় না।
            </p>
          )}

          <div>
            <span className={label}>ছবি ও ভিডিও (সর্বোচ্চ ৪টি)</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {media.map((m, i) => (
                <div key={i} className="live-in relative aspect-square overflow-hidden rounded-xl bg-black ring-1 ring-white/12">
                  {m.kind === "video" ? (
                    <video src={m.src} muted playsInline className="size-full object-cover" />
                  ) : (
                    <button type="button" onClick={(e) => cover(i, e)} className="relative block size-full cursor-crosshair" title="যেখানে চাপবেন সেখানটা ঢেকে যাবে">
                      <Image src={m.src!} alt="" fill unoptimized sizes="200px" className="object-cover" />
                    </button>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {m.kind === "image" && m.src !== m.original && (
                      <button type="button" onClick={() => setMedia((all) => all.map((x, k) => (k === i ? { ...x, src: x.original } : x)))} className="flex size-7 items-center justify-center rounded-lg bg-black/70 text-white" aria-label="ঢাকা সরান">
                        <Undo2 className="size-4" aria-hidden />
                      </button>
                    )}
                    <button type="button" onClick={() => setMedia((all) => all.filter((_, k) => k !== i))} className="flex size-7 items-center justify-center rounded-lg bg-black/70 text-white" aria-label="সরান">
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
              {media.length < 4 && (
                <>
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl bg-signal-orange text-sm font-bold text-text-primary transition-[scale] duration-200 active:scale-95 has-focus-visible:ring-2 has-focus-visible:ring-white">
                    <input type="file" accept="image/*,video/*" capture="environment" className="sr-only" onChange={add} disabled={busy} />
                    <Camera className="size-6" aria-hidden /> তুলুন
                  </label>
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl text-sm font-bold text-white ring-1 ring-white/20 transition-[background-color,scale] duration-200 hover:bg-white/10 active:scale-95 has-focus-visible:ring-2 has-focus-visible:ring-signal-orange">
                    <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={add} disabled={busy} />
                    <ImagePlus className="size-6" aria-hidden /> গ্যালারি
                  </label>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-white/60">{busy ? "ছবি ঠিক করা হচ্ছে…" : "মুখ বা নম্বরপ্লেট ঢাকতে ছবির সেই জায়গায় চাপুন। ভিডিও সর্বোচ্চ ১.৫ MB।"}</p>
          </div>

          <div className="grid gap-2 text-sm text-white/85 sm:grid-cols-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="size-4 accent-signal-orange" /> নাম গোপন রাখুন</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} className="size-4 accent-signal-orange" /> <EyeOff className="size-4" aria-hidden /> সংবেদনশীল ছবি</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={reported} onChange={(e) => setReported(e.target.checked)} className="size-4 accent-signal-orange" /> <Num value={line.tel} />-এ জানিয়েছি</label>
          </div>

          <fieldset className="space-y-2 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10">
            <legend className="sr-only">অঙ্গীকার</legend>
            {PLEDGES.map((p, i) => (
              <label key={p} className="flex items-start gap-2 text-sm text-white/85">
                <input type="checkbox" checked={pledged[i]} onChange={(e) => setPledged((all) => all.map((v, k) => (k === i ? e.target.checked : v)))} className="mt-0.5 size-4 shrink-0 accent-signal-orange" />
                {p}
              </label>
            ))}
            {tried && !pledged.every(Boolean) && <p className="text-xs font-semibold text-crimson-bright">পোস্ট করতে তিনটিতেই টিক দিন।</p>}
          </fieldset>

          <button type="submit" disabled={busy} className={mediaButton({ variant: "primary", size: "lg", className: cn("w-full", !ready && "opacity-80") })}>
            পোস্ট করুন
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
