"use client";

import { FacebookLogo, LinkedinLogo, TelegramLogo, WhatsappLogo, XLogo } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { feedIntent, POINTS, REACTION_KINDS, REACTIONS, shareLinks, shareText, SOCIAL, type Article, type ReactionKind, type SocialChannel } from "@/lib/research/core";
import { CITE_STYLES, citeAs, fileBase, toBibtex, toHtml, toMarkdown, toRis, type CiteStyle } from "@/lib/research/export";
import { markShared, toggleIn, updateResearch, useResearch, useScores } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { BTN, BTN_QUIET, BTN_SOLID, fmtNum, H2, ICON_BTN, MENU, MENU_ITEM } from "./kit";

/** The work's absolute address, read in the browser only (inside event handlers). */
export const absoluteUrl = (a: Pick<Article, "slug">) => `${window.location.origin}/research/${encodeURIComponent(a.slug)}`;

/** Tell a signed-out reader why nothing happened, with the way in. */
export function useNeedSignIn(slug: string) {
  const router = useRouter();
  return (what: string) =>
    toast.error(`Log in to ${what}`, {
      description: "Saves, reactions and comments live in your Kandari Profile.",
      action: { label: "Log in", onClick: () => router.push(`/login?next=${encodeURIComponent(`/research/${slug}`)}`) },
    });
}

/** Close a drop-down on an outside click or Escape. */
export function useDismiss(open: boolean, close: () => void, box: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && close();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open, close, box]);
}

/** Save text as a file through a temporary link. */
export function saveFile(name: string, type: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type Format = "html" | "md" | "bib" | "ris";

export const FORMATS: Record<Format, { title: string; note: string; icon: string }> = {
  html: { title: "Reading copy (HTML)", note: "Opens in any browser; print it to PDF", icon: "description" },
  md: { title: "Plain text (Markdown)", note: "For notes and editing", icon: "notes" },
  bib: { title: "Citation (BibTeX)", note: "For LaTeX, Zotero or Mendeley", icon: "format_quote" },
  ris: { title: "Citation (RIS)", note: "For EndNote, Zotero or Mendeley", icon: "library_books" },
};

/** Download one work in a format. */
export function downloadAs(a: Article, f: Format) {
  const url = absoluteUrl(a);
  const base = fileBase(a);
  if (f === "html") saveFile(`${base}.html`, "text/html;charset=utf-8", toHtml(a, url));
  if (f === "md") saveFile(`${base}.md`, "text/markdown;charset=utf-8", toMarkdown(a, url));
  if (f === "bib") saveFile(`${base}.bib`, "application/x-bibtex;charset=utf-8", toBibtex(a, url));
  if (f === "ris") saveFile(`${base}.ris`, "application/x-research-info-systems;charset=utf-8", toRis(a, url));
}

/**
 * How an action shows: `button` is the site's own button (the item page's
 * header), `row` a small labelled action for lists, `icon` the icon alone.
 */
export type Look = "button" | "row" | "icon";

const lookOf = (look: Look) => (look === "button" ? BTN : BTN_QUIET);

/**
 * JSTOR's split "Download" button: the main half takes the author's PDF
 * when there is one, else the reading copy; the chevron opens every format.
 * In a list (`row`) it is a single small action.
 */
export function DownloadButton({ a, look = "button" }: { a: Article; look?: Look }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, box);

  const main = () => {
    if (a.file?.url) {
      const link = document.createElement("a");
      link.href = a.file.url;
      link.download = a.file.name;
      link.click();
    } else downloadAs(a, "html");
    toast.success("Download started", { description: a.file?.url ? a.file.name : "Reading copy (HTML): open it and print to PDF if you need one." });
  };
  const take = (f: Format) => {
    downloadAs(a, f);
    setOpen(false);
    toast.success("Download started");
  };

  if (look !== "button") {
    return (
      <button type="button" onClick={main} aria-label={look === "icon" ? "Download" : undefined} className={BTN_QUIET}>
        <Icon name="download" className="text-xl" /> {look === "row" && "Download"}
      </button>
    );
  }

  return (
    <div ref={box} className="relative flex">
      <button type="button" onClick={main} className={cn(BTN_SOLID, "rounded-r-none")}>
        <Icon name="download" className="text-xl" /> Download
      </button>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={menuId} aria-label="More download formats" className={cn(BTN_SOLID, "rounded-l-none border-l border-text-primary/25 px-3")}>
        <Icon name="expand_more" className={cn("text-xl transition-transform duration-300 motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <div id={menuId} className={cn(MENU, "top-full right-0 w-80")}>
          {a.file?.url && (
            <a href={a.file.url} download={a.file.name} onClick={close} className={MENU_ITEM}>
              <Icon name="picture_as_pdf" className="mt-0.5 text-xl text-signal-orange" />
              <span className="min-w-0"><span className="block font-semibold">Author&apos;s PDF</span><span className="block truncate text-white/65">{a.file.name}</span></span>
            </a>
          )}
          {(Object.keys(FORMATS) as Format[]).map((f) => (
            <button key={f} type="button" onClick={() => take(f)} className={MENU_ITEM}>
              <Icon name={FORMATS[f].icon} className="mt-0.5 text-xl text-signal-orange" />
              <span><span className="block font-semibold">{FORMATS[f].title}</span><span className="block text-white/65">{FORMATS[f].note}</span></span>
            </button>
          ))}
          {a.sample && <p className="mt-1 border-t border-white/12 px-4 pt-2.5 pb-1.5 text-sm text-white/65">A sample entry: every file says so.</p>}
        </div>
      )}
    </div>
  );
}

/** Save to Workspace: a bookmark that fills when saved. */
export function SaveButton({ a, className, look = "button" }: { a: Pick<Article, "slug">; className?: string; look?: Look }) {
  const saved = useResearch((s) => Boolean(s.saved[a.slug]));
  const needSignIn = useNeedSignIn(a.slug);
  const save = () => {
    if (!toggleIn("saved", a.slug)) return needSignIn("save to your Workspace");
    toast.success(saved ? "Removed from your Workspace" : "Saved to your Workspace");
  };
  return (
    <button type="button" onClick={save} aria-pressed={saved} aria-label={look === "icon" ? (saved ? "Saved" : "Save") : undefined} className={cn(lookOf(look), className)}>
      <Icon name="bookmark" filled={saved} className="text-xl" />
      {look !== "icon" && (saved ? "Saved" : "Save")}
    </button>
  );
}

/**
 * JSTOR's "Cite this Item": the citation in APA, MLA or Chicago to copy,
 * and the BibTeX or RIS file for a reference manager.
 */
export function CiteButton({ a, className, look = "button" }: { a: Article; className?: string; look?: Look }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [style, setStyle] = useState<CiteStyle>("apa");
  const [url, setUrl] = useState("");
  const cited = useResearch((s) => Boolean(s.cited[a.slug]));
  const titleId = useId();

  const open = () => {
    setUrl(absoluteUrl(a));
    ref.current?.showModal();
  };
  const text = url ? citeAs(a, url, style).replace(/_/g, "") : "";
  const copy = () => {
    navigator.clipboard?.writeText(text).then(
      () => {
        if (!cited) toggleIn("cited", a.slug);
        toast.success("Citation copied", { description: `${CITE_STYLES[style]} style` });
      },
      () => toast.error("Could not copy"),
    );
  };

  return (
    <>
      <button type="button" onClick={open} aria-label={look === "icon" ? "Cite" : undefined} className={cn(lookOf(look), className)}>
        <Icon name="format_quote" className="text-xl" />
        {look !== "icon" && "Cite"}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
        className="live-in m-auto w-[min(40rem,calc(100vw-2rem))] rounded-3xl bg-bdnavy-900 p-0 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/12 backdrop:bg-black/75"
      >
        <div className="flex items-center justify-between border-b border-white/12 px-6 py-4">
          <h2 id={titleId} className={cn(H2, "text-2xl sm:text-2xl")}>Cite this item</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className={ICON_BTN}>
            <Icon name="close" className="text-2xl" />
          </button>
        </div>
        <div className="px-6 py-5">
          <div role="tablist" aria-label="Citation style" className="flex gap-1 border-b border-white/12">
            {(Object.keys(CITE_STYLES) as CiteStyle[]).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={style === s}
                onClick={() => setStyle(s)}
                className={cn(
                  "relative px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                  style === s ? "text-white after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-signal-orange" : "text-white/65 hover:text-white",
                )}
              >
                {CITE_STYLES[s]}
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-black/30 p-4 text-base leading-relaxed wrap-break-word text-white ring-1 ring-white/12 ring-inset">{text}</p>
          <button type="button" onClick={copy} className={cn(BTN_SOLID, "mt-4")}>
            <Icon name="content_copy" className="text-xl" /> Copy citation
          </button>
          <h3 className="mt-7 font-grotesk text-base font-bold text-signal-orange">Export a citation</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["bib", "ris"] as const).map((f) => (
              <button key={f} type="button" onClick={() => { downloadAs(a, f); toast.success("Download started"); }} className={BTN}>
                <Icon name="download" className="text-xl" /> {f === "bib" ? "BibTeX" : "RIS"}
              </button>
            ))}
          </div>
          {a.sample && <p className="mt-5 text-sm text-white/65">This is a sample entry. Its people and figures are illustrative; do not cite it as a real study.</p>}
        </div>
      </dialog>
    </>
  );
}

const SOCIAL_ICON: Record<SocialChannel, typeof FacebookLogo> = { facebook: FacebookLogo, x: XLogo, linkedin: LinkedinLogo, whatsapp: WhatsappLogo, telegram: TelegramLogo };

/** Share: the Kandari feed first, then the networks, a copied link, and the phone's own share sheet. */
export function ShareButton({ a, className }: { a: Article; className?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const router = useRouter();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, box);

  const blocked = a.status !== "published";
  const toFeed = () => {
    markShared(a.slug, "feed");
    setOpen(false);
    router.push(feedIntent(a));
  };
  const copy = () => {
    navigator.clipboard?.writeText(absoluteUrl(a)).then(
      () => {
        markShared(a.slug, "link");
        toast.success("Link copied");
      },
      () => toast.error("Could not copy"),
    );
    setOpen(false);
  };
  const native = () => {
    navigator.share?.({ title: a.title, text: shareText(a), url: absoluteUrl(a) }).then(() => markShared(a.slug, "device"), () => undefined);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => (blocked ? toast.error("You can share it once it passes review") : setOpen((o) => !o))} aria-expanded={open} aria-controls={menuId} className={cn(BTN, className)}>
        <Icon name="share" className="text-xl" /> Share
      </button>
      {open &&
        (() => {
          // The menu exists only after a click, so the browser's own values are safe to read here.
          const links = shareLinks(absoluteUrl(a), shareText(a));
          const canNative = "share" in navigator;
          return (
            <div id={menuId} className={cn(MENU, "top-full right-0 w-72")}>
              <button type="button" onClick={toFeed} className={MENU_ITEM}>
                <Icon name="dynamic_feed" className="mt-0.5 text-xl text-signal-orange" />
                <span><span className="block font-semibold">Share to the Kandari feed</span><span className="block text-white/65">Posts it to Shikkhitoder Media</span></span>
              </button>
              <p className="mt-1 border-t border-white/12 px-4 pt-3 pb-1 text-xs font-semibold text-bdnavy-300">Social media</p>
              {(Object.keys(SOCIAL) as SocialChannel[]).map((ch) => {
                const Logo = SOCIAL_ICON[ch];
                return (
                  <a
                    key={ch}
                    href={links[ch]}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      markShared(a.slug, ch);
                      setOpen(false);
                    }}
                    className={cn(MENU_ITEM, "items-center py-2.5")}
                  >
                    <Logo size={20} weight="fill" aria-hidden /> {SOCIAL[ch]}
                    <Icon name="open_in_new" className="ml-auto text-base text-white/65" />
                  </a>
                );
              })}
              <div className="mt-1 flex border-t border-white/12">
                <button type="button" onClick={copy} className={cn(MENU_ITEM, "flex-1 items-center justify-center gap-1.5 font-semibold")}><Icon name="link" className="text-lg text-signal-orange" /> Copy link</button>
                {canNative && <button type="button" onClick={native} className={cn(MENU_ITEM, "flex-1 items-center justify-center gap-1.5 font-semibold")}><Icon name="ios_share" className="text-lg text-signal-orange" /> More…</button>}
              </div>
            </div>
          );
        })()}
    </div>
  );
}

/** Four reactions, one per reader; each adds to the researcher's points. */
export function Reactions({ a }: { a: Article }) {
  const mine = useResearch((s) => s.reactions[a.slug]);
  const { engagement } = useScores();
  const e = engagement(a);
  const needSignIn = useNeedSignIn(a.slug);

  function react(k: ReactionKind) {
    const next = mine === k ? undefined : k;
    const ok = updateResearch((s) => {
      const reactions = { ...s.reactions };
      if (next) reactions[a.slug] = next;
      else delete reactions[a.slug];
      return { ...s, reactions };
    });
    if (!ok) return needSignIn("react");
    if (next) toast.success(`"${REACTIONS[next].label}": thank you`, { description: `+${POINTS.reaction} points for the researcher` });
  }

  return (
    <div role="group" aria-label="React to this work" className="grid grid-cols-2 gap-2">
      {REACTION_KINDS.map((k) => {
        const on = mine === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => react(k)}
            aria-pressed={on}
            className={cn(
              "flex min-h-12 items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold ring-1 ring-inset [-webkit-tap-highlight-color:transparent] transition-[background-color,color,box-shadow,scale] duration-300 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none",
              on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white ring-white/15 hover:ring-signal-orange/60",
            )}
          >
            <Icon name={REACTIONS[k].icon} filled={on} className={cn("text-xl", !on && "text-signal-orange")} />
            <span className="min-w-0 flex-1">{REACTIONS[k].label}</span>
            <span className="tabular-nums">{fmtNum(e.reactions[k])}</span>
          </button>
        );
      })}
    </div>
  );
}
