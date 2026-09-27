"use client";

import { TUS } from "@/data/nagorik";
import { toBanglaDigits } from "@/lib/bangla";
import { useInView } from "./use-in-view";

/**
 * The survey's headline findings. The ratios measure different things, so
 * they are figures, not bars on a shared axis; the one like-for-like
 * comparison (an attitude by age) is a bar pair.
 */
export function TusFindings() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const lf = TUS.womenLabourForce;
  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <ul className="grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
        {TUS.ratios.map((r) => (
          <li key={r.value + r.text} className="bg-white p-6">
            <p className="font-bengali text-4xl font-bold text-chart-care">{r.value}</p>
            <p className="mt-2 font-bengali text-[15px] leading-relaxed text-text-secondary">{r.text}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-5">
        <figure className="rounded-3xl border border-slate-200 bg-white p-6">
          <figcaption className="font-bengali text-base font-bold text-text-primary">“পুরুষের কাজ নারীর কাজের চেয়ে বেশি গুরুত্বপূর্ণ” — যাঁরা মনে করেন</figcaption>
          <div className="mt-4 space-y-3">
            {TUS.menWorkMoreImportant.map((a, i) => (
              <div key={a.group}>
                <div className="flex justify-between font-bengali text-sm">
                  <span className="text-text-secondary">{a.group}</span>
                  <span className="font-bold text-text-primary">{toBanglaDigits(a.pct)}%</span>
                </div>
                <div className="mt-1 h-3 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-chart-paid transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    style={{ width: seen ? `${a.pct}%` : "0%", transitionDelay: `${i * 150}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-bengali text-sm leading-relaxed text-text-muted">তরুণেরা বদলাচ্ছে — পুরোনো ধারণা ভাঙার কাজটা তাদের হাতেই এগোবে।</p>
        </figure>

        <div className="rounded-3xl bg-bd-green p-6 text-white">
          <p className="font-bengali text-sm text-emerald-100">নারীর শ্রমশক্তিতে অংশগ্রহণ</p>
          <p className="mt-1 font-bengali text-3xl font-bold">
            {toBanglaDigits(lf.from.pct)}% <span className="text-emerald-200">({lf.from.year})</span> → {toBanglaDigits(lf.to.pct)}% <span className="text-emerald-200">({lf.to.year})</span>
          </p>
          <p className="mt-3 font-bengali text-[15px] leading-relaxed text-emerald-50">{TUS.bothShouldEarn}</p>
        </div>
      </div>
    </div>
  );
}
