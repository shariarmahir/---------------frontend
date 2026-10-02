"use client";

import { FacebookLogo, LinkedinLogo, TelegramLogo, WhatsappLogo, XLogo } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { citation, feedIntent, FIELDS, POINTS, REACTION_KINDS, REACTIONS, reactionTotal, shareLinks, shareText, SOCIAL, type Article, type ReactionKind, type SocialChannel } from "@/lib/research/core";
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

/** The article's score on a solid gold card: points, its rank in its field, and what earned them. */
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
    <aside aria-label="গবেষণা স্কোর" className="rounded-[1.75rem] bg-signal-orange p-5 text-text-primary sm:p-6">
      <p className="flex items-center gap-1.5 text-sm font-bold"><Icon name="bolt" className="text-[20px]" /> গবেষণা স্কোর</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="font-wiki text-6xl leading-none font-bold">{bnNum(p)}</span>
        <span className="text-sm font-bold">পয়েন্ট</span>
      </p>
      {a.status === "published" && rank > 0 && (
        <p className="mt-2 text-sm font-semibold text-text-primary/80">{FIELDS[a.field].bn} ক্ষেত্রে {bn(peers.length)}টির মধ্যে #{bn(rank)}</p>
      )}
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl bg-text-primary/10 px-3 py-2">
            <dt className="text-xs font-semibold text-text-primary/70">{r.label} <span className="text-text-primary/50">(+{bn(r.each)})</span></dt>
            <dd className="font-wiki text-xl font-bold">{bnNum(r.value)}</dd>
          </div>
        ))}
      </dl>
      {p === 0 && <p className="mt-3 text-xs leading-relaxed text-text-primary/75">এখনো কোনো সাড়া নেই। প্রথম প্রতিক্রিয়া বা মন্তব্যটি আপনার হোক।</p>}
    </aside>
  );
}

const SOCIAL_ICON: Record<SocialChannel, typeof FacebookLogo> = { facebook: FacebookLogo, x: XLogo, linkedin: LinkedinLogo, whatsapp: WhatsappLogo, telegram: TelegramLogo };

/** শেয়ার: the Kandari feed first, then the networks, a copied link, and the phone's own share sheet. */
export function ShareMenu({ a, align = "left" }: { a: Article; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

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
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-text-primary transition-colors hover:bg-signal-orange"
      >
        <Icon name="share" className="text-[19px]" /> শেয়ার
      </button>
      {open && (() => {
        // The menu exists only after a click, so the browser's own values are safe to read here.
        const links = shareLinks(absolute(a), shareText(a));
        const canNative = "share" in navigator;
        return (
        <div id={menuId} className={cn("live-in absolute z-40 mt-2 w-72 rounded-2xl bg-white p-2 text-text-primary shadow-elevated ring-1 ring-black/10", align === "right" ? "right-0" : "left-0")}>
          <button type="button" onClick={toFeed} className="flex w-full items-center gap-3 rounded-xl bg-signal-orange px-3 py-3 text-left font-bold transition-colors hover:bg-text-primary hover:text-white">
            <Icon name="dynamic_feed" className="text-[22px]" />
            <span>কাণ্ডারী ফিডে শেয়ার<span className="block text-xs font-semibold opacity-75">শিক্ষিতদের মিডিয়ায় পোস্ট হবে</span></span>
          </button>
          <p className="px-3 pt-3 pb-1 text-xs font-bold text-text-muted">সোশ্যাল মিডিয়ায়</p>
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
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-mint-subtle"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-text-primary text-white"><Logo size={17} weight="fill" aria-hidden /></span>
                    {SOCIAL[ch]}
                    <Icon name="open_in_new" className="ml-auto text-[16px] text-text-muted" />
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 grid grid-cols-2 gap-1 border-t border-card-border pt-2">
            <button type="button" onClick={copy} className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-mint-subtle"><Icon name="link" className="text-[18px]" /> লিংক কপি</button>
            {canNative && <button type="button" onClick={native} className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-mint-subtle"><Icon name="ios_share" className="text-[18px]" /> আরও…</button>}
          </div>
          <p className="px-3 pt-2 pb-1 text-[11px] leading-snug text-text-muted">প্রতিটি মাধ্যমে প্রথম শেয়ারে +{bn(POINTS.share)} পয়েন্ট।</p>
        </div>
        );
      })()}
    </div>
  );
}

/** The bar under the title: four reactions, the discussion, share, cite, save and the PDF. */
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
                on ? "bg-signal-orange text-text-primary" : "bg-white/[0.06] text-white/85 ring-1 ring-white/12 hover:bg-white/[0.12] hover:text-white",
              )}
            >
              <Icon name={REACTIONS[k].icon} className="text-[19px]" filled={on} />
              <span className="hidden sm:inline">{REACTIONS[k].bn}</span>
              <span className={cn("tabular-nums", on ? "text-text-primary" : "text-white/60")}>{bnNum(e.reactions[k])}</span>
            </button>
          );
        })}
      </div>
      <span className="mx-1 hidden h-7 w-px bg-white/15 md:block" aria-hidden />
      <a href="#discussion" className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-white/85 ring-1 ring-white/12 transition-colors hover:bg-white/[0.08]">
        <Icon name="forum" className="text-[19px]" /> আলোচনা <span className="text-white/60">{bnNum(e.comments)}</span>
      </a>
      <ShareMenu a={a} />
      <button type="button" onClick={cite} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-white/85 ring-1 ring-white/12 transition-colors hover:bg-white/[0.08]">
        <Icon name="format_quote" className="text-[19px]" /> উদ্ধৃতি
      </button>
      <button type="button" onClick={save} aria-pressed={saved} className={cn("inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition-colors", saved ? "bg-bd-green text-white" : "text-white/85 ring-1 ring-white/12 hover:bg-white/[0.08]")}>
        <Icon name="bookmark" className="text-[19px]" filled={saved} /> {saved ? "সংরক্ষিত" : "সংরক্ষণ"}
      </button>
      {a.file?.url && (
        <Link href={a.file.url} download={a.file.name} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-white/85 ring-1 ring-white/12 transition-colors hover:bg-white/[0.08]">
          <Icon name="picture_as_pdf" className="text-[19px]" /> পিডিএফ
        </Link>
      )}
    </div>
  );
}
