import { FilmButton } from "@/components/bangladesh/story-video";
import { heroFacts, heroFilm } from "@/data/bangladesh";
import { ACTS } from "@/data/desh";
import { PixelMap } from "./pixel-map";

/**
 * Opening viewport: the country drawn as a glowing low-resolution image
 * with its 32 bad pixels, beside the page's promise and the four acts it
 * walks through. The map is the thesis — the rest of the page repairs it.
 */
export function DeshHero() {
  return (
    <section aria-labelledby="desh-title" className="relative isolate overflow-hidden bg-bdgreen-950 text-white">
      {/* Night-field glow behind the map: flag green below, harvest gold above. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_75%_45%,rgb(16_185_129/0.28),transparent_70%),radial-gradient(40%_40%_at_85%_15%,rgb(228_176_39/0.18),transparent_70%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-gutter-x py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-20">
        <div className="story-reveal">
          <p className="inline-flex items-center gap-2 font-bengali text-sm font-semibold text-signal-orange">
            <span aria-hidden className="size-2 rounded-xs bg-national-crimson" />
            আমার সোনার বাংলা, আমি তোমায় ভালোবাসি
          </p>
          <h1 id="desh-title" className="mt-4 font-bengali text-5xl leading-[1.05] font-bold text-balance sm:text-6xl lg:text-7xl">
            বাংলাদেশ <span className="text-national-crimson [text-shadow:0_0_28px_rgb(218_41_28/0.55)]">সমস্যা</span> ও{" "}
            <span className="text-signal-orange [text-shadow:0_0_28px_rgb(228_176_39/0.5)]">সমাধান</span>
          </h1>
          <p className="mt-5 max-w-xl font-bengali text-lg leading-relaxed text-emerald-50/85">
            দেশটা যেন একটা ঝাপসা ছবি — প্রতিটি অমীমাংসিত সমস্যা একটা নষ্ট পিক্সেল। আমাদের গল্প, সামনের সংকট, ৩২টি বাস্তব সমস্যা আর সেগুলো মেরামতের বাস্তব পথ — এক পাতায়।
          </p>

          <nav aria-label="এই পাতার চার অধ্যায়" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTS.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="group rounded-xl border border-white/12 bg-white/5 px-3 py-3 transition-colors hover:border-signal-orange/60 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                <span className="block font-bengali text-2xl leading-none font-bold text-signal-orange">{a.n}</span>
                <span className="mt-1.5 block font-bengali text-sm font-semibold text-white">{a.label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-6">
            <FilmButton film={heroFilm} label="বাংলাদেশের গল্প — ভিডিও" />
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-md">
          <PixelMap label="পিক্সেলে আঁকা বাংলাদেশের মানচিত্র; ৩২টি লাল পিক্সেল ৩২টি সমস্যা" className="w-full drop-shadow-[0_0_40px_rgb(16_185_129/0.35)]" />
          <figcaption className="mt-3 flex items-center justify-center gap-4 font-bengali text-sm text-emerald-50/80">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-xs bg-national-crimson" /> ৩২টি সমস্যা
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-xs bg-bdgreen-500" /> সুস্থ ভূমি
            </span>
          </figcaption>
        </figure>
      </div>

      <dl className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-5">
          {heroFacts.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-0.5 border-white/10 px-2 py-4 text-center not-first:border-l max-sm:nth-[2n+1]:border-l-0 max-sm:nth-[n+3]:border-t max-sm:last:col-span-2">
              <dt className="order-last font-bengali text-xs text-emerald-50/70">{f.label}</dt>
              <dd className="font-bengali text-2xl font-bold sm:text-3xl">{f.value}</dd>
            </div>
          ))}
        </div>
      </dl>
    </section>
  );
}
