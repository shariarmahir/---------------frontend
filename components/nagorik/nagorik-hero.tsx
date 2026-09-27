import { StoryPhoto } from "@/components/bangladesh/story-photo";
import { ruralBackdrops } from "@/data/rural-life";

const JUMPS = [
  { href: "#day", label: "দিনের হিসাব" },
  { href: "#divisions", label: "বিভাগ" },
  { href: "#rights", label: "অধিকার" },
  { href: "#responsibility", label: "দায়িত্ব" },
  { href: "#self-check", label: "আজ রাতের আয়না" },
];

/** Opening: the promise of the page over a working farmer's morning. */
export function NagorikHero() {
  return (
    <section aria-labelledby="nagorik-title" className="relative isolate overflow-hidden bg-bdgreen-950 text-white">
      <StoryPhoto photo={ruralBackdrops.farmerCow} sizes="100vw" priority drift className="absolute inset-0 -z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-bdgreen-950 via-bdgreen-950/85 to-bdgreen-950/30" />
      <div className="mx-auto max-w-7xl px-gutter-x py-16 sm:py-24">
        <p className="font-bengali text-sm font-semibold text-signal-orange">যাঁরা এই অবস্থা বদলাতে চান, তাঁদের জন্য</p>
        <h1 id="nagorik-title" className="mt-4 max-w-3xl font-bengali text-5xl leading-[1.08] font-bold text-balance sm:text-6xl">
          নাগরিক <span className="text-signal-orange [text-shadow:0_0_28px_rgb(228_176_39/0.5)]">অধিকার</span> ও দায়িত্ব
        </h1>
        <p className="mt-5 max-w-2xl font-bengali text-lg leading-relaxed text-emerald-50/90">
          দেশ বদলায় মানুষের দিনে। আমরা দিনের সময় কোথায় দিই, কোন অধিকার জানি, কোন দায়িত্ব পালন করি — এখান থেকেই আগামী প্রজন্মের বাংলাদেশ তৈরি হয়।
        </p>
        <p className="mt-6 max-w-2xl rounded-2xl bg-white/8 px-5 py-4 font-bengali text-base leading-relaxed text-white backdrop-blur-sm">
          একজন নারী দিনে গড়ে <strong className="text-signal-orange">৫.৯ ঘণ্টা</strong> অবৈতনিক ঘর ও সেবার কাজ করেন, একজন পুরুষ <strong className="text-signal-orange">০.৮ ঘণ্টা</strong>। <span className="text-emerald-50/70">— বিবিএস টাইম-ইউজ সার্ভে ২০২১</span>
        </p>
        <nav aria-label="এই পাতায়" className="mt-8 flex flex-wrap gap-2">
          {JUMPS.map((j) => (
            <a key={j.href} href={j.href} className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/5 px-4 font-bengali text-sm font-semibold backdrop-blur-sm transition-colors hover:border-signal-orange hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              {j.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
