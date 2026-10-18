import type { Metadata } from "next";
import Link from "next/link";
import { COLUMN, H1, LINK, PANEL_COBALT, TITLE } from "@/components/research/kit";
import { SubmitForm } from "@/components/research/submit-form";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Upload Research — Genius" };

const RULES = [
  { icon: "verified_user", title: "Your own work", body: "Publish what you or your team did. Get your co-authors' consent." },
  { icon: "fact_check", title: "Honest data", body: "Never invent or alter data. Do not claim what you did not find; state the limitations plainly." },
  { icon: "menu_book", title: "Cite your sources", body: "Credit anyone else's data, text or images in the references." },
  { icon: "photo_camera", title: "Your own photos", body: "Use photos you took or may use, with a credit. Ask before photographing people, and leave out anyone who said no." },
  { icon: "shield_person", title: "Protect participants", body: "Never publish survey or interview participants' names, phone numbers or addresses." },
  { icon: "rate_review", title: "Review", body: "Reviewers read every submission; questions or suggestions may come through the comments." },
  { icon: "public", title: "Open to all", body: "Anyone can read, download and cite published work, with a link to it." },
];

export default function ResearchSubmitPage() {
  return (
    <div className={cn(COLUMN, "py-10 lg:py-12")}>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="min-w-0">
          <header className="hero-rise pb-8">
            <h1 className={H1}>Upload research</h1>
            <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-white/80">Theses, papers, innovations, projects and ideas, from school to PhD, or as an independent researcher. Free to publish, free to read. Write plainly, so anyone in the country can follow it.</p>
          </header>
          <SubmitForm />
        </div>
        <aside id="rules" aria-labelledby="rules-title" className={cn(PANEL_COBALT, "p-6 sm:p-7 xl:sticky xl:top-[calc(var(--research-top)+1rem)]")}>
          <h2 id="rules-title" className={cn(TITLE, "text-2xl")}>Publishing rules</h2>
          <ul className="mt-5 space-y-5">
            {RULES.map((r) => (
              <li key={r.title} className="flex gap-3">
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-signal-orange text-text-primary"><Icon name={r.icon} className="text-xl" /></span>
                <span><span className="block font-grotesk font-bold text-white">{r.title}</span><span className="mt-0.5 block text-sm leading-relaxed text-white/80">{r.body}</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-white/20 pt-5 text-sm leading-relaxed text-white/80">Once published, share your work in one click to the Kandari feed, Facebook, LinkedIn or WhatsApp. Readers&apos; reactions, comments and shares add to your research score.</p>
          <p className="mt-4 text-sm leading-relaxed text-white/80">Not ready yet? <Link href="/research/workspace/start#step-upload" className={cn(LINK, "font-semibold")}>Follow the step-by-step guide</Link>: it ends with this form&apos;s checklist.</p>
        </aside>
      </div>
    </div>
  );
}
