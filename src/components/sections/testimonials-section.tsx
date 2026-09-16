"use client";

import { testimonials } from "@/data/testimonials";

export function TestimonialsSection() {
  return (
    <section id="community" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
          Voices from the Kandari Community
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          A preview of the community — full reviews launching soon.
        </p>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <p className="text-sm italic text-slate-700">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-4 font-heading text-sm font-semibold text-primary">
              {t.name}
            </p>
            <p className="text-xs text-slate-500">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
