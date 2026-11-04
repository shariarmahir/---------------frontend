"use client";

import { useCallback, useState } from "react";
import { INVEST_CONTACT, INVEST_LINKS } from "@/data/motherland-live";
import { cn } from "@/lib/utils";
import { Dialog } from "./dialog";
import { COLUMN, pill } from "./kit";

const SECTORS = ["Garments and textiles", "Healthcare and medicine", "Software and fintech", "Food and farm processing", "Blue economy", "Ports and logistics", "Clean energy", "Ship building and engineering", "Tourism", "Something else"];
const FIELD = "min-h-12 w-full rounded-xl bg-ml-ground px-4 py-3 ring-1 ring-ml-ink/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy";

/** The way to reach us. There is no server behind this yet, so it opens the visitor's own email with everything filled in. */
export function ConnectBand() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const [form, setForm] = useState({ name: "", company: "", sector: SECTORS[0], message: "" });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const mail = `mailto:${INVEST_CONTACT}?subject=${encodeURIComponent(`Investing in Bangladesh: ${form.sector}`)}&body=${encodeURIComponent(`Name: ${form.name}\nCompany: ${form.company}\nSector: ${form.sector}\n\n${form.message}`)}`;

  return (
    <section id="connect" aria-labelledby="connect-title" className="scroll-mt-(--ml-header) bg-signal-orange py-12 text-ml-ink sm:py-14 lg:py-16">
      <div className={cn(COLUMN, "flex flex-wrap items-center justify-between gap-8")}>
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 id="connect-title" className="font-ml-display text-[clamp(2.25rem,4.8vw,4.5rem)] leading-[1.02] tracking-[0.01em] uppercase">
            Tell us what you are looking for
          </h2>
          <p className="text-lg leading-relaxed sm:text-xl">Name a sector or a region. We will send you the figures we have and point you to the right people.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className={cn(pill.onDark, "bg-ml-navy text-white hover:bg-white hover:text-ml-ink")}>
          Connect for details
        </button>
      </div>
      {open ? (
        <Dialog title="Connect for details" onClose={close}>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <label className="flex flex-col gap-1.5 font-semibold">
              Your name
              <input required autoComplete="name" value={form.name} onChange={set("name")} className={FIELD} />
            </label>
            <label className="flex flex-col gap-1.5 font-semibold">
              Company
              <input autoComplete="organization" value={form.company} onChange={set("company")} className={FIELD} />
            </label>
            <label className="flex flex-col gap-1.5 font-semibold">
              Sector
              <select value={form.sector} onChange={set("sector")} className={FIELD}>
                {SECTORS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 font-semibold">
              What would you like to know?
              <textarea rows={4} value={form.message} onChange={set("message")} className={FIELD} />
            </label>
            <a href={mail} className={cn(pill.onLight, "w-fit")}>
              Send by email
            </a>
          </form>
          <div className="flex flex-col gap-1.5 border-t border-ml-ink/10 pt-4">
            <p className="font-semibold">Official bodies for investors</p>
            <ul className="flex flex-col gap-1">
              {INVEST_LINKS.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    {l.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Dialog>
      ) : null}
    </section>
  );
}
