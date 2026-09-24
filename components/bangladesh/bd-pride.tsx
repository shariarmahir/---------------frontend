import { P, facts, type Credit, type Photo } from "@/data/bangladesh";
import { commonsPhotos } from "@/data/bangladesh-photos";
import { StoryPhoto } from "./story-photo";

/**
 * The emotional turn between the numbers and the reader's own memory:
 * a full-bleed photograph, a line of Nazrul, and the invitation.
 */
export function BdPride() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      <StoryPhoto photo={P.smritisoudho} sizes="100vw" className="absolute inset-0 -z-10" drift imgClassName="opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-slate-950/80 via-bd-green-dark/60 to-slate-950/90" />

      <div className="story-reveal mx-auto flex max-w-4xl flex-col items-center px-gutter-x py-28 text-center lg:py-40">
        <span className="font-bengali text-sm font-bold tracking-wide text-signal-orange">আমরা বীরের জাতি</span>
        <blockquote className="mt-6 font-bengali text-4xl leading-tight font-bold text-white sm:text-6xl">
          “বল বীর—<br />
          বল <span className="text-national-crimson">উন্নত</span> মম শির!”
        </blockquote>
        <p className="mt-3 font-bengali text-base text-white/70">— কাজী নজরুল ইসলাম, ‘বিদ্রোহী’</p>
        <p className="mt-8 max-w-2xl font-bengali text-lg leading-relaxed text-white/85">
          যে জাতি ভাষার জন্য বুক পেতে দিয়েছে, নয় মাস যুদ্ধ করে স্বাধীনতা এনেছে,
          আর শূন্য থেকে উঠে দাঁড়িয়েছে — সেই জাতির সন্তান আমরা। এই সবুজ দেশটা
          আমাদের আশীর্বাদ, আর একে আরও সুন্দর করার দায়ও আমাদের।
        </p>
        <a
          href="#memories"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-signal-orange px-7 py-4 font-bengali text-base font-bold text-white shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-bdorange-600 focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-none motion-reduce:hover:translate-y-0"
        >
          আপনার বাংলাদেশের গল্প বলুন
        </a>
      </div>
    </section>
  );
}

/** Full attribution list: every Commons photo, plus the data sources. */
export function BdCredits() {
  const photos = Object.values(commonsPhotos).filter(
    (p): p is Photo & { credit: Credit } => Boolean(p?.credit),
  );

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-gutter-x py-10">
        <details className="group rounded-2xl border border-slate-200 bg-white p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-bengali text-sm font-bold text-text-primary">
            ছবি ও তথ্যের উৎস ({photos.length + facts.length})
            <span aria-hidden className="material-symbols-outlined transition-transform group-open:rotate-180 motion-reduce:transition-none">expand_more</span>
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-bengali text-sm font-bold text-slate-700">তথ্য</h3>
              <ul className="space-y-1.5 font-sans text-xs text-slate-600">
                <li>
                  গ্রাফ: <a className="text-bd-green hover:underline" href="https://data.worldbank.org/country/bangladesh" target="_blank" rel="noopener noreferrer">World Bank WDI</a>
                </li>
                {facts.map((f) => (
                  <li key={f.label}>
                    <span className="font-bengali">{f.label}</span>:{" "}
                    <a className="text-bd-green hover:underline" href={f.url} target="_blank" rel="noopener noreferrer">{f.source}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-bengali text-sm font-bold text-slate-700">ছবি (Wikimedia Commons)</h3>
              <ul className="space-y-1.5 font-sans text-xs text-slate-600">
                {photos.map((p) => (
                  <li key={p.src}>
                    <a className="font-bengali text-bd-green hover:underline" href={p.credit.sourceUrl} target="_blank" rel="noopener noreferrer">{p.alt}</a>
                    {" — "}{p.credit.author},{" "}
                    {p.credit.licenseUrl ? (
                      <a className="hover:underline" href={p.credit.licenseUrl} target="_blank" rel="noopener noreferrer">{p.credit.license}</a>
                    ) : (
                      p.credit.license
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
