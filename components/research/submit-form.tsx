"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { sourcePoints } from "@/data/amar-bangladesh";
import { ROADMAP_KINDS } from "@/data/research/roadmap";
import { useAuth } from "@/lib/auth/client";
import { authorNames, buildArticle, draftProblems, nextTracking, FIELDS, KINDS, LEVELS, LIMITS, SCOPES, SECTION_TEMPLATES, type Article, type Draft, type DraftProblems, type FieldId, type Level, type ResearchKind, type Scope } from "@/lib/research/core";
import { problemCode } from "@/lib/research/tracks";
import { updateResearch, useLibrary } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { articleHref, BTN, BTN_GOLD, BTN_SOLID, FIELD, fmtNum, H2, ICON_BTN, PANEL, TITLE } from "./kit";

const START: Draft["sections"] = SECTION_TEMPLATES.paper.map((heading) => ({ heading, body: "" }));

const field = cn(FIELD, "py-3 aria-invalid:ring-2 aria-invalid:ring-national-crimson");
const label = "mb-2 block text-sm font-semibold text-white";
const hint = "font-normal text-white/65";
const legend = cn(TITLE, "mb-4 w-full border-b border-white/12 pb-3 text-xl sm:text-2xl");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Longest edge and largest encoded size (data URL characters) after scaling down. */
const THUMB = { edge: 1200, budget: 320_000 };
const PHOTO = { edge: 1280, budget: 280_000 };

/**
 * Scale a photo down in the browser and re-encode it as a JPEG, so the
 * library keeps a light copy and never the original file (which may carry
 * GPS and camera details). Quality steps down until it fits the budget.
 */
async function shrinkImage(file: File, { edge, budget }: { edge: number; budget: number }): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let quality = 0.85;
    let out = canvas.toDataURL("image/jpeg", quality);
    while (out.length > budget && quality > 0.45) {
      quality -= 0.1;
      out = canvas.toDataURL("image/jpeg", quality);
    }
    if (out.length > budget) throw new Error("Too large");
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Why a picked file cannot be used, or null when it can. */
function imageTrouble(f: File): string | null {
  if (!IMAGE_TYPES.includes(f.type)) return `${f.name} is not a JPEG, PNG or WebP photo`;
  if (f.size > LIMITS.imageBytes) return `${f.name} is larger than 12 MB`;
  return null;
}

function Err({ show, msg }: { show: boolean; msg?: string }) {
  return show && msg ? <span role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-white"><Icon name="error" filled className="text-lg text-national-crimson" />{msg}</span> : null;
}

/** A dashed drop area that is also a button: click to pick, or drop files on it. */
function DropZone({ onFiles, multiple, invalid, children, className }: { onFiles: (files: File[]) => void; multiple?: boolean; invalid?: boolean; children: React.ReactNode; className?: string }) {
  const pick = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => pick.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFiles([...e.dataTransfer.files].slice(0, multiple ? LIMITS.gallery : 1));
        }}
        data-invalid={invalid || undefined}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
          over ? "border-signal-orange text-signal-orange" : "border-white/30 text-white hover:border-signal-orange hover:text-signal-orange",
          invalid && "border-national-crimson",
          className,
        )}
      >
        {children}
      </button>
      <input
        ref={pick}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          onFiles(files);
        }}
      />
    </>
  );
}

/** Upload a thesis, paper, innovation, project or idea: it waits for review, then joins the library. */
export function SubmitForm() {
  const router = useRouter();
  const { ready, account } = useAuth();
  const library = useLibrary();
  const pickPdf = useRef<HTMLInputElement>(null);
  const [d, setD] = useState<Draft>({
    title: "", titleEn: "", kind: "", field: "", level: "", authors: "", institution: "", supervisor: "", year: String(new Date().getFullYear()), district: "", summary: "", keywords: "", sections: START, references: "", agree: false, cover: "", coverCaption: "", gallery: [],
  });
  const [file, setFile] = useState<Article["file"]>();
  const [busy, setBusy] = useState<"" | "cover" | "gallery">("");
  const [tried, setTried] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const thisYear = new Date().getFullYear();
  const p: DraftProblems = draftProblems(d, thisYear);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const gallery = d.gallery ?? [];

  // Start the author and institution from the account, once it is known.
  if (account && !seeded) {
    setSeeded(true);
    setD((x) => ({ ...x, authors: x.authors || account.name, institution: x.institution || (account.institution ?? "") }));
  }

  /** Choose the type; untouched sections switch to the structure that type is expected to follow. */
  const pickKind = (k: ResearchKind) =>
    setD((x) => ({ ...x, kind: k, sections: x.sections.every((s) => !s.body.trim()) ? SECTION_TEMPLATES[k].map((heading) => ({ heading, body: "" })) : x.sections }));

  async function onCover(files: File[]) {
    const f = files[0];
    if (!f) return;
    const trouble = imageTrouble(f);
    if (trouble) return toast.error(trouble);
    setBusy("cover");
    try {
      const src = await shrinkImage(f, THUMB);
      set("cover", src);
    } catch {
      toast.error("Could not read that photo", { description: "Try another JPEG, PNG or WebP file." });
    } finally {
      setBusy("");
    }
  }

  async function onGallery(files: File[]) {
    const room = LIMITS.gallery - gallery.length;
    if (room <= 0) return toast.error(`${LIMITS.gallery} project images at most`);
    if (files.length > room) toast.error(`Only ${room} more ${room === 1 ? "image fits" : "images fit"}; the rest were left out`);
    setBusy("gallery");
    const added: { src: string; caption: string }[] = [];
    for (const f of files.slice(0, room)) {
      const trouble = imageTrouble(f);
      if (trouble) {
        toast.error(trouble);
        continue;
      }
      try {
        added.push({ src: await shrinkImage(f, PHOTO), caption: "" });
      } catch {
        toast.error(`Could not read ${f.name}`);
      }
    }
    setBusy("");
    if (added.length) setD((x) => ({ ...x, gallery: [...(x.gallery ?? []), ...added].slice(0, LIMITS.gallery) }));
  }

  function onPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf") return toast.error("Only PDF files can be attached");
    if (f.size > LIMITS.fileBytes) return toast.error("The PDF is larger than 1.5 MB", { description: "Make it smaller, or put a link to the full text in the references." });
    const reader = new FileReader();
    reader.onload = () => setFile({ name: f.name, size: f.size, url: String(reader.result) });
    reader.onerror = () => toast.error("Could not read the file");
    reader.readAsDataURL(f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!account) return toast.error("Log in to upload");
    if (busy) return toast.error("Wait for the photos to finish");
    if (Object.keys(p).length > 0) {
      toast.error("A few fields still need attention", { description: Object.values(p)[0] });
      requestAnimationFrame(() => document.querySelector("[aria-invalid=true], [data-invalid=true]")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    const now = new Date();
    const tracking = nextTracking(library, authorNames(d.authors)[0] ?? account.name, now.getFullYear());
    const article = buildArticle(d, { now, taken: new Set(library.map((a) => a.slug)), owner: account.id, ownerName: account.name, file, tracking });
    if (!updateResearch((s) => ({ ...s, mine: [article, ...s.mine] }))) return toast.error("This browser has no room left", { description: "Remove the PDF or some project images and try again." });
    toast.success("Submitted for review", { description: `Tracking number ${tracking}. It will be published for everyone once reviewed.` });
    router.push(articleHref(article));
  }

  if (ready && !account) {
    return (
      <div className={cn(PANEL, "p-6 sm:p-8")}>
        <h2 className={cn(H2, "text-2xl sm:text-2xl")}>Log in to upload research</h2>
        <p className="mt-3 text-base leading-relaxed text-white/80">Reading is open to everyone. Uploading needs a free Kandari Profile, so that a real person stands behind every work.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/login?next=/research/submit" className={BTN_SOLID}><Icon name="account_circle" className="text-xl" /> Log in</Link>
          <Link href="/signup" className={BTN}>Register</Link>
        </div>
      </div>
    );
  }

  const show = (k: keyof DraftProblems) => tried && Boolean(p[k]);
  const choice = (on: boolean) =>
    cn(
      "flex min-h-24 cursor-pointer flex-col justify-between gap-3 rounded-2xl p-3.5 text-sm leading-snug font-semibold ring-1 ring-inset transition-[background-color,color,box-shadow,translate] duration-300 has-focus-visible:ring-2 has-focus-visible:ring-signal-orange motion-reduce:transition-none",
      on ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-black/30 text-white ring-white/15 hover:-translate-y-0.5 hover:ring-signal-orange/60 motion-reduce:hover:translate-y-0",
    );

  return (
    <form onSubmit={submit} noValidate className={cn(PANEL, "space-y-10 p-5 sm:p-8")}>
      <fieldset className="space-y-5">
        <legend className={legend}>1. About the work</legend>
        <label className="block">
          <span className={label}>Title *</span>
          <input className={field} value={d.title} maxLength={LIMITS.title[1]} onChange={(e) => set("title", e.target.value)} placeholder="For example: A low-cost smartphone test for arsenic in tube-well water" aria-invalid={show("title")} />
          <Err show={show("title")} msg={p.title} />
        </label>
        <label className="block">
          <span className={label}>Alternative title <span className={hint}>(optional, for example the title in Bangla)</span></span>
          <input className={field} value={d.titleEn} maxLength={LIMITS.title[1]} onChange={(e) => set("titleEn", e.target.value)} />
        </label>
        <div>
          <span id="kind-label" className={label}>Content type *</span>
          <div role="radiogroup" aria-labelledby="kind-label" aria-invalid={show("kind")} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.keys(KINDS) as ResearchKind[]).map((k) => (
              <label key={k} className={choice(d.kind === k)}>
                <input type="radio" name="kind" className="sr-only" checked={d.kind === k} onChange={() => pickKind(k)} />
                <Icon name={KINDS[k].icon} filled={d.kind === k} className={cn("text-2xl", d.kind !== k && "text-signal-orange")} />
                {KINDS[k].type}
              </label>
            ))}
          </div>
          <p className="mt-2 min-h-[1lh] text-sm text-white/65" aria-live="polite">
            {d.kind ? `${ROADMAP_KINDS[d.kind].note} The text sections below start from the structure this type is expected to follow.` : "Choose one: the text sections below follow the type."}
          </p>
          <Err show={show("kind")} msg={p.kind} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Subject *</span>
            <select className={field} value={d.field} onChange={(e) => set("field", e.target.value as FieldId)} aria-invalid={show("field")}>
              <option value="">Choose</option>
              {(Object.keys(FIELDS) as FieldId[]).map((f) => <option key={f} value={f}>{FIELDS[f].en}</option>)}
            </select>
            <Err show={show("field")} msg={p.field} />
          </label>
          <label className="block">
            <span className={label}>Level *</span>
            <select className={field} value={d.level} onChange={(e) => set("level", e.target.value as Level)} aria-invalid={show("level")}>
              <option value="">Choose</option>
              {(Object.keys(LEVELS) as Level[]).map((l) => <option key={l} value={l}>{LEVELS[l]}</option>)}
            </select>
            <Err show={show("level")} msg={p.level} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>2. Who and where</legend>
        <label className="block">
          <span className={label}>Authors * <span className={hint}>(separate with commas, 8 at most)</span></span>
          <input className={field} value={d.authors} onChange={(e) => set("authors", e.target.value)} aria-invalid={show("authors")} />
          <Err show={show("authors")} msg={p.authors} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Institution and department *</span>
            <input className={field} value={d.institution} onChange={(e) => set("institution", e.target.value)} placeholder="University, college or school" aria-invalid={show("institution")} />
            <Err show={show("institution")} msg={p.institution} />
          </label>
          <label className="block">
            <span className={label}>Supervisor</span>
            <input className={field} value={d.supervisor} onChange={(e) => set("supervisor", e.target.value)} placeholder="Name and position" />
          </label>
          <label className="block">
            <span className={label}>Year *</span>
            <input className={field} inputMode="numeric" value={d.year} onChange={(e) => set("year", e.target.value)} aria-invalid={show("year")} />
            <Err show={show("year")} msg={p.year} />
          </label>
          <label className="block">
            <span className={label}>District <span className={hint}>(where the work was done)</span></span>
            <input className={field} value={d.district} onChange={(e) => set("district", e.target.value)} />
          </label>
          <label className="block">
            <span className={label}>Scope</span>
            <select className={field} value={d.scope ?? "bangladesh"} onChange={(e) => set("scope", e.target.value as Scope)}>
              {(Object.keys(SCOPES) as Scope[]).map((k) => <option key={k} value={k}>{SCOPES[k]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={label}>National problem addressed <span className={hint}>(optional)</span></span>
            <select className={field} value={d.problem ?? ""} onChange={(e) => set("problem", e.target.value)}>
              <option value="">None</option>
              {sourcePoints.map((sp) => <option key={sp.n} value={String(sp.n)}>{problemCode(sp.n)} · {sp.topic}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className={legend}>3. Images</legend>
        <div>
          <span id="cover-label" className={label}>Thumbnail image * <span className={hint}>(the cover readers see first: a photo of the work, the site or the device)</span></span>
          {d.cover ? (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:items-start">
              <span className="relative block aspect-4/3 overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
                {/* A data URL made in this browser: next/image adds nothing here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.cover} alt="Thumbnail preview" className="size-full object-cover" />
              </span>
              <div className="space-y-3">
                <label className="block">
                  <span className={label}>Caption and credit <span className={hint}>(what it shows, and who took it)</span></span>
                  <input className={field} value={d.coverCaption ?? ""} maxLength={LIMITS.caption} onChange={(e) => set("coverCaption", e.target.value)} placeholder="The test kit in the field, Chapai Nawabganj. Photo: the authors" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <DropZone onFiles={onCover} className="w-auto flex-row px-4 py-2.5">
                    <Icon name="swap_horiz" className="text-xl text-signal-orange" /> Replace
                  </DropZone>
                  <button type="button" onClick={() => setD((x) => ({ ...x, cover: "", coverCaption: "" }))} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                    <Icon name="delete" className="text-xl" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <DropZone onFiles={onCover} invalid={show("cover")} className="min-h-40">
              <Icon name={busy === "cover" ? "hourglass_top" : "add_photo_alternate"} className="text-4xl text-signal-orange" />
              {busy === "cover" ? "Preparing the photo…" : "Choose a photo, or drop it here"}
              <span className="font-normal text-white/65">JPEG, PNG or WebP, up to 12 MB. It is scaled down here before upload.</span>
            </DropZone>
          )}
          <Err show={show("cover")} msg={p.cover} />
        </div>

        <div>
          <span className={label}>Project images <span className={hint}>(optional, up to {LIMITS.gallery}: the prototype, the test set-up, the field site, the results)</span></span>
          {gallery.length > 0 && (
            <ul className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((g, i) => (
                <li key={i} className="rounded-2xl bg-black/30 p-2.5 ring-1 ring-white/12 ring-inset">
                  <span className="relative block aspect-4/3 overflow-hidden rounded-xl bg-bdnavy-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.src} alt={g.caption || `Project image ${i + 1}`} className="size-full object-cover" />
                    <button type="button" onClick={() => set("gallery", gallery.filter((_, j) => j !== i))} aria-label={`Remove project image ${i + 1}`} className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-black text-white ring-1 ring-white/20 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                      <Icon name="close" className="text-xl" />
                    </button>
                  </span>
                  <input
                    aria-label={`Caption for project image ${i + 1}`}
                    className={cn(field, "mt-2 py-2 text-sm")}
                    value={g.caption}
                    maxLength={LIMITS.caption}
                    onChange={(e) => set("gallery", gallery.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
                    placeholder="Caption: what it shows"
                    aria-invalid={tried && g.caption.trim().length < 3}
                  />
                </li>
              ))}
            </ul>
          )}
          {gallery.length < LIMITS.gallery && (
            <DropZone onFiles={onGallery} multiple>
              <Icon name={busy === "gallery" ? "hourglass_top" : "collections"} className="text-3xl text-signal-orange" />
              {busy === "gallery" ? "Preparing the photos…" : gallery.length ? `Add more (${LIMITS.gallery - gallery.length} left)` : "Choose photos, or drop them here"}
            </DropZone>
          )}
          <Err show={show("gallery")} msg={p.gallery} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>4. The text</legend>
        <label className="block">
          <span className={label}>Abstract * <span className={hint}>({d.kind === "idea" ? "the problem, the idea, how it could be tested" : "the question, the method, what you found"}; {fmtNum(d.summary.trim().length)}/{fmtNum(LIMITS.summary[1])})</span></span>
          <textarea rows={4} className={field} value={d.summary} maxLength={LIMITS.summary[1] + 50} onChange={(e) => set("summary", e.target.value)} aria-invalid={show("summary")} />
          <Err show={show("summary")} msg={p.summary} />
        </label>
        <div className="space-y-3" aria-invalid={show("sections")}>
          <p className={label}>Sections * <span className={hint}>(mark references in brackets: [1], [2])</span></p>
          {d.sections.map((s, i) => (
            <div key={i} className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/12 ring-inset sm:p-4">
              <div className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-signal-orange font-grotesk text-sm font-bold text-text-primary tabular-nums">{i + 1}</span>
                <input aria-label={`Section ${i + 1} heading`} className={cn(field, "py-2 font-semibold")} value={s.heading} maxLength={LIMITS.heading[1]} onChange={(e) => set("sections", d.sections.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)))} placeholder="Section heading" />
                {d.sections.length > 2 && (
                  <button type="button" onClick={() => set("sections", d.sections.filter((_, j) => j !== i))} className={ICON_BTN} aria-label={`Remove section ${i + 1}`}>
                    <Icon name="delete" className="text-xl" />
                  </button>
                )}
              </div>
              <textarea aria-label={`Section ${i + 1} text`} rows={4} className={cn(field, "mt-2")} value={s.body} maxLength={LIMITS.body[1] + 100} onChange={(e) => set("sections", d.sections.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} placeholder="Leave a blank line between paragraphs. Start lines with '- ' for a list." />
            </div>
          ))}
          {d.sections.length < LIMITS.sections[1] && (
            <button type="button" onClick={() => set("sections", [...d.sections, { heading: "", body: "" }])} className={BTN}>
              <Icon name="add" className="text-xl" /> Add a section
            </button>
          )}
          <Err show={show("sections")} msg={p.sections} />
        </div>
        <label className="block">
          <span className={label}>References <span className={hint}>(one per line; add the link if there is one)</span></span>
          <textarea rows={4} className={cn(field, "text-sm")} value={d.references} onChange={(e) => set("references", e.target.value)} placeholder={"Bangladesh Bureau of Statistics, Population and Housing Census 2022 https://bbs.gov.bd\nAuthor (year). Title. Journal."} aria-invalid={show("references")} />
          <Err show={show("references")} msg={p.references} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Keywords <span className={hint}>(separate with commas, 8 at most)</span></span>
            <input className={field} value={d.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="Water, arsenic, health" aria-invalid={show("keywords")} />
            <Err show={show("keywords")} msg={p.keywords} />
          </label>
          <div>
            <span className={label}>Full text <span className={hint}>(PDF, optional)</span></span>
            {file ? (
              <p className="flex min-h-12 items-center gap-2 rounded-xl bg-black/30 px-4 text-sm text-white ring-1 ring-white/15 ring-inset">
                <Icon name="picture_as_pdf" className="text-xl text-signal-orange" /> <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(undefined)} className="rounded-md text-sm font-semibold text-white/65 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">Remove</button>
              </p>
            ) : (
              <button type="button" onClick={() => pickPdf.current?.click()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 text-sm font-semibold text-white transition-colors hover:border-signal-orange hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                <Icon name="upload_file" className="text-xl text-signal-orange" /> Choose a PDF (up to 1.5 MB)
              </button>
            )}
            <input ref={pickPdf} type="file" accept="application/pdf" className="sr-only" tabIndex={-1} aria-hidden onChange={onPdf} />
          </div>
        </div>
      </fieldset>

      <div className="space-y-4 border-t border-white/12 pt-8">
        <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 ring-inset", show("agree") ? "ring-2 ring-national-crimson" : "ring-white/15")}>
          <input type="checkbox" checked={d.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-1 size-4.5 accent-signal-orange" aria-invalid={show("agree")} />
          <span className="text-sm leading-relaxed text-white/80">I confirm the work is mine (or my co-authors agree to publish it), the data are not invented, nobody else&apos;s text or images are used without credit, and no participant&apos;s personal details are published.</span>
        </label>
        <Err show={show("agree")} msg={p.agree} />
        <button type="submit" disabled={Boolean(busy)} className={cn(BTN_GOLD, "w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto")}>
          <Icon name="send" className="text-xl" /> Submit for review
        </button>
        <p className="text-sm text-white/65">For now, a submission is kept in this browser and only you can see it. Once Kandari-Lab&apos;s server is live, reviewed work will be published for everyone.</p>
      </div>
    </form>
  );
}
