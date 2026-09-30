import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PixelMark, SignalSeam } from "@/components/ui/section-kit";
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
 * Split auth screen in the home page's language: the form column is a
 * solid gold field (the header's gold, ink text and ink primary action), the
 * photograph panel beside it (md and up) is shaded in ink with the gold
 * pulse on the seam of its figures strip. The site header is a fixed
 * floating card that would cover this layout, so the screen carries its
 * own way home instead.
 */
export function AuthShell({ panel, children }: { panel: AuthPanelContent; children: React.ReactNode }) {
  return (
    <main className="relative min-h-dvh w-full bg-signal-orange text-text-primary md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <Link
        href="/"
        className="absolute top-space-md left-space-md z-20 inline-flex min-h-10 items-center gap-space-xs rounded-xl bg-text-primary px-space-sm font-sans text-label-sm font-bold text-signal-orange shadow-ink [-webkit-tap-highlight-color:transparent] transition-[translate,scale,background-color] duration-200 hover:-translate-y-0.5 hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-95 md:top-space-lg md:left-space-lg"
      >
        <Icon name="arrow_back" className="text-[16px]" />
        হোমে ফিরুন
      </Link>

      <div className="flex min-h-dvh items-start justify-center px-gutter pt-20 pb-space-xl sm:items-center md:min-h-0 md:px-space-xl md:py-space-2xl">
        <div className="auth-rise mx-auto flex w-full max-w-100 flex-col gap-space-lg">
          <Link
            href="/"
            className="mx-auto flex w-fit rounded-2xl px-space-sm py-space-xs transition-[background-color,scale] duration-200 hover:bg-text-primary/10 focus-visible:ring-2 focus-visible:ring-text-primary/40 focus-visible:outline-none active:scale-95"
          >
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
    <div className="relative hidden overflow-hidden bg-text-primary md:sticky md:top-0 md:block md:h-dvh">
      <Image
        src="/login/login.jpg"
        alt="বর্ষার জলে ডুবে থাকা মাঠের মাঝে একাকী বটগাছ, পাশ দিয়ে যাত্রীবোঝাই নৌকা"
        fill
        priority
        sizes="(min-width: 768px) 52vw, 0px"
        quality={90}
        className="story-drift object-cover object-center"
      />
      {/* Ink scrim only under the text, so the sky stays clear. */}
      <div className="absolute inset-0 bg-linear-to-t from-text-primary via-text-primary/60 via-45% to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end">
        <blockquote className="flex max-w-lg flex-col gap-space-md p-space-xl pb-space-lg">
          <PixelMark tone="dark" />
          <Icon name="format_quote" className="text-[44px] leading-none text-signal-orange" filled />
          <p className="font-bengali text-headline-md leading-snug font-bold text-white" aria-label={content.quote.text}>
            <Typewriter key={content.quote.text} text={content.quote.text} speed={55} />
          </p>
          <cite className="font-bengali text-body-md font-semibold text-signal-orange not-italic">— {content.quote.author}</cite>
        </blockquote>

        {/* Figures — the home hero's ink proof strip, gold pulse on its seam. */}
        <div className="relative bg-text-primary">
          <SignalSeam className="top-0" />
          <dl className="grid grid-cols-3 divide-x divide-white/10">
            {content.stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-space-sm py-space-md text-center">
                <dt className="font-bengali text-xs font-medium text-white/70">{s.label}</dt>
                <dd className="font-bengali text-2xl font-bold text-signal-orange">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/** Pixel mark, eyebrow, title and one line under it, centred over the form. */
export function AuthHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-space-sm text-center">
      <span className="inline-flex items-center gap-space-xs rounded-full bg-text-primary px-space-md py-1.5 font-mono text-label-xs font-bold tracking-widest text-signal-orange uppercase shadow-ink">
        <span className="radar-indicator size-1.5 rounded-full bg-bdgreen-500" />
        {eyebrow}
      </span>
      <h1 className="font-bengali text-4xl font-bold tracking-tight text-balance text-text-primary">{title}</h1>
      {subtitle ? <p className="max-w-[22rem] font-bengali text-body-md text-balance text-text-primary/85">{subtitle}</p> : null}
    </div>
  );
}
