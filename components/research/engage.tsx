"use client";

import { FacebookLogo, LinkedinLogo, TelegramLogo, WhatsappLogo, XLogo } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { citation, feedIntent, FIELDS, POINTS, REACTION_KINDS, REACTIONS, reactionTotal, shareLinks, shareText, SOCIAL, type Article, type ReactionKind, type SocialChannel } from "@/lib/research/core";
import { fileBase, toBibtex, toHtml, toMarkdown } from "@/lib/research/export";
import { markShared, toggleIn, updateResearch, useLibrary, useResearch, useScores } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { bn, bnNum } from "./ui";

const absolute = (a: Pick<Article, "slug">) => `${window.location.origin}/research/${encodeURIComponent(a.slug)}`;

/** Tell a signed-out reader why nothing happened, with the way in. */
function useNeedSignIn(slug: string) {
  const router = useRouter();
  return (what: string) =>
    toast.error(`${what} করতে সাইন ইন করুন`, {
      description: "প্রতিক্রিয়া, মন্তব্য আর পয়েন্ট আপনার কাণ্ডারী প্রোফাইলে জমা হয়।",
      action: { label: "সাইন ইন", onClick: () => router.push(`/login?next=${encodeURIComponent(`/research/${slug}`)}`) },
    });
}

/** The article's score on a navy card: points in gold, its rank in its field, and what earned them. */
export function ScoreCard({ a }: { a: Article }) {
  const { engagement, points } = useScores();
  const list = useLibrary();
  const e = engagement(a);
  const p = points(a);
  const peers = list.filter((x) => x.status === "published" && x.field === a.field).sort((x, y) => points(y) - points(x));
  const rank = peers.findIndex((x) => x.slug === a.slug) + 1;
  const rows = [
    { label: "প্রতিক্রিয়া", value: reactionTotal(e), each: POINTS.reaction },
    { label: "মন্তব্য", value: e.comments, each: POINTS.comment },
    { label: "শেয়ার", value: e.shares, each: POINTS.share },
    { label: "উদ্ধৃতি", value: e.cites, each: POINTS.cite },
  ];
  return (
    <aside aria-label="গবেষণা স্কোর" className="rounded-3xl bg-bdnavy-900 p-5 text-white ring-1 ring-white/12 ring-inset sm:p-6">
      <p className="flex items-center gap-1.5 text-sm font-bold text-white/80"><Icon name="bolt" className="text-[20px] text-signal-orange" /> গবেষণা স্কোর</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-6xl leading-none font-bold text-signal-orange tabular-nums">{bnNum(p)}</span>
        <span className="text-sm font-bold">পয়েন্ট</span>
      </p>
      {a.status === "published" && rank > 0 && (
        <p className="mt-2 text-sm font-semibold text-white/80">{FIELDS[a.field].bn} ক্ষেত্রে {bn(peers.length)}টির মধ্যে #{bn(rank)}</p>
      )}
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl bg-black/25 px-3 py-2">
            <dt className="text-xs font-semibold text-white/65">{r.label} <span className="text-white/65">(+{bn(r.each)})</span></dt>
            <dd className="text-xl font-bold tabular-nums">{bnNum(r.value)}</dd>
          </div>
        ))}
      </dl>
      {p === 0 && <p className="mt-3 text-xs leading-relaxed text-white/80">এখনো কোনো সাড়া নেই। প্রথম প্রতিক্রিয়া বা মন্তব্যটি আপনার হোক।</p>}
    </aside>
  );
}

/** The action bar's quiet button, and the dark menu its drop-downs open. */
const BAR_BTN = "inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:ring-white/35";
const MENU = "live-in absolute z-40 mt-2 w-72 rounded-2xl bg-bdnavy-900 p-2 text-white shadow-elevated ring-1 ring-white/15";

/** Close a drop-down on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void, box: React.RefObject<HTMLDivElement | null>) {
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
function saveFile(name: string, type: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const DOWNLOADS = [
  { kind: "html", icon: "description", title: "পড়ার পাতা (HTML)", note: "যেকোনো ব্রাউজারে খোলে; সেখান থেকে পিডিএফ হিসেবে প্রিন্ট করা যায়" },
  { kind: "md", icon: "notes", title: "মার্কডাউন (.md)", note: "সম্পাদনা বা নোটের জন্য সাধারণ লেখা" },
  { kind: "bib", icon: "format_quote", title: "উদ্ধৃতি (BibTeX)", note: "Zotero, Mendeley বা LaTeX-এর জন্য" },
] as const;

/** ডাউনলোড: the author's PDF when there is one, then the paper as a reading page, as Markdown, and as a BibTeX entry. */
export function DownloadMenu({ a, align = "left" }: { a: Article; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, box);

  const take = (kind: (typeof DOWNLOADS)[number]["kind"]) => {
    const url = absolute(a);
    const base = fileBase(a);
    if (kind === "html") saveFile(`${base}.html`, "text/html;charset=utf-8", toHtml(a, url));
    if (kind === "md") saveFile(`${base}.md`, "text/markdown;charset=utf-8", toMarkdown(a, url));
    if (kind === "bib") saveFile(`${base}.bib`, "application/x-bibtex;charset=utf-8", toBibtex(a, url));
    setOpen(false);
    toast.success("ডাউনলোড শুরু হলো");
  };

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={menuId} className={BAR_BTN}>
        <Icon name="download" className="text-[19px]" /> ডাউনলোড
      </button>
      {open && (
        <div id={menuId} className={cn(MENU, align === "right" ? "right-0" : "left-0")}>
          {a.file?.url && (
            <Link href={a.file.url} download={a.file.name} onClick={close} className="mb-1 flex w-full items-center gap-3 rounded-xl bg-signal-orange px-3 py-3 font-bold text-text-primary transition-colors hover:bg-signal-orange/85">
              <Icon name="picture_as_pdf" className="text-[22px]" />
              <span className="min-w-0">লেখকের পিডিএফ<span className="block truncate text-xs font-semibold opacity-75">{a.file.name}</span></span>
            </Link>
          )}
          <ul>
            {DOWNLOADS.map((it) => (
              <li key={it.kind}>
                <button type="button" onClick={() => take(it.kind)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/10">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cobalt text-signal-orange"><Icon name={it.icon} className="text-[18px]" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{it.title}</span>
                    <span className="block text-xs leading-snug text-white/65">{it.note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {a.sample && <p className="px-3 pt-2 pb-1 text-xs leading-snug text-white/65">নমুনা নিবন্ধ — ফাইলেও তা লেখা থাকবে।</p>}
        </div>
      )}
    </div>
  );
}

const SOCIAL_ICON: Record<SocialChannel, typeof FacebookLogo> = { facebook: FacebookLogo, x: XLogo, linkedin: LinkedinLogo, whatsapp: WhatsappLogo, telegram: TelegramLogo };

/** শেয়ার: the Kandari feed first, then the networks, a copied link, and the phone's own share sheet. */
export function ShareMenu({ a, align = "left" }: { a: Article; align?: "left" | "right" }) {
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
    navigator.clipboard?.writeText(absolute(a)).then(
      () => {
        markShared(a.slug, "link");
        toast.success("লিংক কপি হলো");
      },
      () => toast.error("কপি করা গেল না"),
    );
    setOpen(false);
  };
  const native = () => {
    navigator.share?.({ title: a.title, text: shareText(a), url: absolute(a) }).then(() => markShared(a.slug, "device"), () => undefined);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => (blocked ? toast.error("পর্যালোচনার পর শেয়ার করা যাবে") : setOpen((o) => !o))}
        aria-expanded={open}
        aria-controls={menuId}
        className={BAR_BTN}
      >
        <Icon name="share" className="text-[19px]" /> শেয়ার
      </button>
      {open && (() => {
        // The menu exists only after a click, so the browser's own values are safe to read here.
        const links = shareLinks(absolute(a), shareText(a));
        const canNative = "share" in navigator;
        return (
        <div id={menuId} className={cn(MENU, align === "right" ? "right-0" : "left-0")}>
          <button type="button" onClick={toFeed} className="flex w-full items-center gap-3 rounded-xl bg-signal-orange px-3 py-3 text-left font-bold text-text-primary transition-colors hover:bg-signal-orange/85">
            <Icon name="dynamic_feed" className="text-[22px]" />
            <span>কাণ্ডারী ফিডে শেয়ার<span className="block text-xs font-semibold opacity-75">শিক্ষিতদের মিডিয়ায় পোস্ট হবে</span></span>
          </button>
          <p className="px-3 pt-3 pb-1 text-xs font-bold text-white/65">সোশ্যাল মিডিয়ায়</p>
          <ul>
            {(Object.keys(SOCIAL) as SocialChannel[]).map((ch) => {
              const Logo = SOCIAL_ICON[ch];
              return (
                <li key={ch}>
                  <a
                    href={links[ch]}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      markShared(a.slug, ch);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-cobalt text-white"><Logo size={17} weight="fill" aria-hidden /></span>
                    {SOCIAL[ch]}
                    <Icon name="open_in_new" className="ml-auto text-[16px] text-white/65" />
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 grid grid-cols-2 gap-1 border-t border-white/12 pt-2">
            <button type="button" onClick={copy} className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-white/10"><Icon name="link" className="text-[18px]" /> লিংক কপি</button>
            {canNative && <button type="button" onClick={native} className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-white/10"><Icon name="ios_share" className="text-[18px]" /> আরও…</button>}
          </div>
          <p className="px-3 pt-2 pb-1 text-xs leading-snug text-white/65">প্রতিটি মাধ্যমে প্রথম শেয়ারে +{bn(POINTS.share)} পয়েন্ট।</p>
        </div>
        );
      })()}
    </div>
  );
}

/** The bar under the title: four reactions, comments, share, download, upload, cite and save. */
export function ActionBar({ a }: { a: Article }) {
  const mine = useResearch((s) => s.reactions[a.slug]);
  const cited = useResearch((s) => Boolean(s.cited[a.slug]));
  const saved = useResearch((s) => Boolean(s.saved[a.slug]));
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
    if (!ok) return needSignIn("প্রতিক্রিয়া");
    if (next) toast.success(`“${REACTIONS[next].bn}” — ধন্যবাদ`, { description: `গবেষকের স্কোরে +${bn(POINTS.reaction)}` });
  }

  function cite() {
    const text = citation(a, absolute(a));
    navigator.clipboard?.writeText(text).then(
      () => {
        if (!cited) toggleIn("cited", a.slug);
        toast.success("উদ্ধৃতি কপি হলো", { description: text.length > 90 ? `${text.slice(0, 89)}…` : text });
      },
      () => toast.error("কপি করা গেল না"),
    );
  }

  function save() {
    if (!toggleIn("saved", a.slug)) return needSignIn("সংরক্ষণ");
    toast.success(saved ? "সংরক্ষণ থেকে সরানো হলো" : "পরে পড়ার জন্য রাখা হলো");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="প্রতিক্রিয়া" className="flex flex-wrap gap-1.5">
        {REACTION_KINDS.map((k) => {
          const on = mine === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => react(k)}
              aria-pressed={on}
              title={REACTIONS[k].bn}
              className={cn(
                "inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition-[background-color,color,translate] duration-200 active:translate-y-px",
                on ? "bg-signal-orange text-text-primary" : "text-white ring-1 ring-white/20 hover:bg-white/10 hover:ring-white/35",
              )}
            >
              <Icon name={REACTIONS[k].icon} className="text-[19px]" filled={on} />
              <span className="hidden sm:inline">{REACTIONS[k].bn}</span>
              <span className={cn("tabular-nums", on ? "text-text-primary" : "text-white/65")}>{bnNum(e.reactions[k])}</span>
            </button>
          );
        })}
      </div>
      <span className="mx-1 hidden h-7 w-px bg-white/15 md:block" aria-hidden />
      <a href="#discussion" className={BAR_BTN}>
        <Icon name="forum" className="text-[19px]" /> মন্তব্য <span className="text-white/65">{bnNum(e.comments)}</span>
      </a>
      <ShareMenu a={a} />
      <DownloadMenu a={a} />
      <Link href="/research/submit" className={BAR_BTN}>
        <Icon name="upload_file" className="text-[19px]" /> আপলোড
      </Link>
      <button type="button" onClick={cite} className={BAR_BTN}>
        <Icon name="format_quote" className="text-[19px]" /> উদ্ধৃতি
      </button>
      <button type="button" onClick={save} aria-pressed={saved} className={cn(BAR_BTN, saved && "bg-cobalt ring-cobalt hover:bg-cobalt")}>
        <Icon name="bookmark" className="text-[19px]" filled={saved} /> {saved ? "সংরক্ষিত" : "সংরক্ষণ"}
      </button>
    </div>
  );
}
