import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Typewriter } from "@/components/ui/typewriter";

export interface AuthPanelContent {
  quote: { text: string; author: string };
  stats: { label: string; value: string }[];
}

export const SIGN_IN_PANEL: AuthPanelContent = {
  quote: { text: "ফাঁসির মঞ্চে গেয়ে গেল যারা জীবনের জয়গান", author: "কাজী নজরুল ইসলাম" },
  stats: [
    { label: "জেলা", value: "৬৪" },
    { label: "খাত", value: "৮" },
    { label: "পণ্য", value: "৩" },
  ],
};

export const SIGN_UP_PANEL: AuthPanelContent = {
  quote: { text: "কারার ঐ লৌহ কপাট, ভেঙ্গে ফেল কর রে লোপাট", author: "কাজী নজরুল ইসলাম" },
  stats: [
    { label: "ধাপ", value: "৩" },
    { label: "সময়", value: "২ মি." },
    { label: "খরচ", value: "৳০" },
  ],
};

/**
 * Split auth screen: the form column and a photograph panel (md and up).
 * The site header is a fixed floating card that would cover this layout,
 * so the screen carries its own way home instead.
 */
export function AuthShell({ panel, children }: { panel: AuthPanelContent; children: React.ReactNode }) {
  return (
    <main className="relative min-h-dvh w-full bg-white md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <Link
        href="/"
        className="absolute top-space-md left-space-md z-20 inline-flex min-h-10 items-center gap-space-xs rounded-lg border border-card-border bg-white/90 px-space-sm font-sans text-label-sm font-semibold text-text-secondary shadow-clean backdrop-blur-sm transition-colors hover:border-bd-green/40 hover:text-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/30 focus-visible:outline-none md:top-space-lg md:left-space-lg"
      >
        <Icon name="arrow_back" className="text-[16px]" />
        হোমে ফিরুন
      </Link>

      <div className="flex min-h-dvh items-start justify-center px-gutter pt-20 pb-space-xl sm:items-center md:min-h-0 md:px-space-xl md:py-space-2xl">
        <div className="mx-auto flex w-full max-w-100 flex-col gap-space-lg">
          <Link href="/" className="mx-auto flex w-fit rounded-xl px-space-sm py-space-xs transition-colors hover:bg-mint-subtle focus-visible:ring-2 focus-visible:ring-bd-green/30 focus-visible:outline-none">
            <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী-ল্যাব (Kandari Lab)" width={1600} height={967} priority sizes="106px" className="aspect-1600/967 h-16 w-auto object-contain" />
          </Link>
          {children}
        </div>
      </div>

      <BrandPanel content={panel} />
    </main>
  );
}

function BrandPanel({ content }: { content: AuthPanelContent }) {
  return (
    <div className="relative hidden overflow-hidden md:sticky md:top-0 md:block md:h-dvh">
      <Image
        src="/login/login.jpg"
        alt="বর্ষার জলে ডুবে থাকা মাঠের মাঝে একাকী বটগাছ, পাশ দিয়ে যাত্রীবোঝাই নৌকা"
        fill
        priority
        sizes="(min-width: 768px) 52vw, 0px"
        quality={90}
        className="object-cover object-center"
      />
      {/* Scrim only under the text, so the sky stays clear. */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/55 via-45% to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end gap-space-xl p-space-xl">
        <blockquote className="flex max-w-md flex-col gap-space-md">
          <Icon name="format_quote" className="text-[40px] leading-none text-signal-orange" filled />
          <p className="font-bengali text-headline-md leading-snug font-semibold text-white" aria-label={content.quote.text}>
            <Typewriter key={content.quote.text} text={content.quote.text} speed={55} />
          </p>
          <cite className="font-sans text-body-md font-light text-emerald-200/90 not-italic">— {content.quote.author}</cite>
        </blockquote>

        <dl className="grid grid-cols-3 gap-space-md border-t border-white/15 pt-space-lg">
          {content.stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <dt className="font-sans text-label-xs tracking-wide text-emerald-200/80">{s.label}</dt>
              <dd className="font-mono text-headline-sm font-bold text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** Eyebrow, title and one line under it, centred over the form. */
export function AuthHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-space-sm text-center">
      <span className="inline-flex items-center gap-space-xs rounded-full border border-bd-green/20 bg-bd-green-light px-space-md py-1 font-mono text-label-xs font-bold tracking-widest text-bd-green uppercase">
        <span className="radar-indicator size-1.5 rounded-full bg-bd-green" />
        {eyebrow}
      </span>
      <h1 className="font-display text-headline-md font-bold tracking-tight text-balance text-text-primary">{title}</h1>
      {subtitle ? <p className="max-w-[22rem] font-sans text-body-md text-balance text-text-secondary">{subtitle}</p> : null}
    </div>
  );
}
