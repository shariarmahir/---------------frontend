import type { CvData, CvFormat, CvLine } from "@/lib/media/cv";

/*
 * The three CV layouts. A CV is a paper document, so these never follow the
 * site's dark theme: fixed black on white, sized to A4, and the same data
 * in each (lib/media/cv.ts builds it once).
 */

const SHEET = "mx-auto w-full max-w-[210mm] bg-white text-neutral-900 shadow-2xl print:max-w-none print:shadow-none";

function Lines({ items, accent }: { items: CvLine[]; accent: string }) {
  return (
    <ul className="space-y-3">
      {items.map((l, i) => (
        <li key={`${l.title}-${i}`} className="break-inside-avoid">
          <p className="flex flex-wrap justify-between gap-x-4 text-[13px] font-bold">
            <span>{l.title}</span>
            {l.period && <span className="font-medium text-neutral-500">{l.period}</span>}
          </p>
          {l.place && <p className={`text-[12px] font-semibold ${accent}`}>{l.place}</p>}
          {l.note && <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-700">{l.note}</p>}
        </li>
      ))}
    </ul>
  );
}

const Para = ({ children }: { children: React.ReactNode }) => <p className="text-[12.5px] leading-relaxed">{children}</p>;

/* ── ATS: one column, plain headings, no icons or tables — what hiring software reads best. */

function AtsBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="border-b border-neutral-900 pb-1 text-[12px] font-bold tracking-widest uppercase">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Ats({ cv }: { cv: CvData }) {
  return (
    <article className={`${SHEET} min-h-[297mm] p-[14mm]`}>
      <header className="text-center">
        <h1 className="text-[26px] font-bold">{cv.name}</h1>
        <p className="text-[14px] text-neutral-700">{cv.headline}</p>
        <p className="mt-1 text-[12px] text-neutral-600">{cv.contact.join("  |  ")}</p>
      </header>
      <AtsBlock title="সারসংক্ষেপ · Summary">
        <Para>{cv.summary}</Para>
      </AtsBlock>
      {cv.experience.length > 0 && (
        <AtsBlock title="অভিজ্ঞতা · Experience">
          <Lines items={cv.experience} accent="text-neutral-600" />
        </AtsBlock>
      )}
      {cv.education.length > 0 && (
        <AtsBlock title="শিক্ষা · Education">
          <Lines items={cv.education} accent="text-neutral-600" />
        </AtsBlock>
      )}
      {cv.training.length > 0 && (
        <AtsBlock title="প্রশিক্ষণ · Training">
          <Lines items={cv.training} accent="text-neutral-600" />
        </AtsBlock>
      )}
      {cv.skills.length > 0 && (
        <AtsBlock title="দক্ষতা · Skills">
          <Para>{cv.skills.join(" · ")}</Para>
        </AtsBlock>
      )}
      {cv.languages.length > 0 && (
        <AtsBlock title="ভাষা · Languages">
          <Para>{cv.languages.join(" · ")}</Para>
        </AtsBlock>
      )}
    </article>
  );
}

/* ── Modern: a dark side column for contact, skills and languages; work and study in the wide one. */

function ModernSide({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">{title}</h2>
      <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-white">
        {items.map((i) => (
          <li key={i} className="wrap-break-word">
            {i}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModernMain({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-3 text-[13px] font-bold tracking-widest uppercase">
        {title}
        <span aria-hidden className="h-px flex-1 bg-neutral-300" />
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Modern({ cv }: { cv: CvData }) {
  return (
    <article className={`${SHEET} grid min-h-[297mm] grid-cols-[34%_1fr]`}>
      <aside className="bg-neutral-900 p-[9mm] text-white">
        <span aria-hidden className="grid size-16 place-items-center rounded-full bg-amber-400 text-3xl font-bold text-neutral-900">
          {cv.name.trim().slice(0, 1)}
        </span>
        <ModernSide title="যোগাযোগ · Contact" items={cv.contact} />
        <ModernSide title="দক্ষতা · Skills" items={cv.skills} />
        <ModernSide title="ভাষা · Languages" items={cv.languages} />
      </aside>
      <div className="p-[11mm]">
        <h1 className="text-[28px] leading-tight font-bold">{cv.name}</h1>
        <p className="text-[14px] font-semibold text-amber-700">{cv.headline}</p>
        <ModernMain title="পরিচিতি · Profile">
          <Para>{cv.summary}</Para>
        </ModernMain>
        {cv.experience.length > 0 && (
          <ModernMain title="অভিজ্ঞতা · Experience">
            <Lines items={cv.experience} accent="text-amber-700" />
          </ModernMain>
        )}
        {cv.education.length > 0 && (
          <ModernMain title="শিক্ষা · Education">
            <Lines items={cv.education} accent="text-amber-700" />
          </ModernMain>
        )}
        {cv.training.length > 0 && (
          <ModernMain title="প্রশিক্ষণ · Training">
            <Lines items={cv.training} accent="text-amber-700" />
          </ModernMain>
        )}
      </div>
    </article>
  );
}

/* ── Europass-style: a label column at the left and the content beside it, under blue rules. */

function EuropassRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[30mm_1fr] gap-x-5 border-t border-sky-300 py-4">
      <h2 className="text-[11px] font-bold tracking-wide text-sky-800 uppercase">{label}</h2>
      <div>{children}</div>
    </section>
  );
}

function Europass({ cv }: { cv: CvData }) {
  return (
    <article className={`${SHEET} min-h-[297mm] p-[14mm]`}>
      <header className="mb-5">
        <p className="text-[11px] font-bold tracking-widest text-sky-700 uppercase">Curriculum Vitae</p>
        <h1 className="mt-1 text-[28px] font-bold text-sky-900">{cv.name}</h1>
        <p className="text-[13px] text-neutral-700">{cv.headline}</p>
      </header>
      <EuropassRow label="ব্যক্তিগত তথ্য · Personal information">
        <ul className="space-y-0.5 text-[12.5px]">
          {cv.contact.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </EuropassRow>
      <EuropassRow label="সারসংক্ষেপ · About me">
        <Para>{cv.summary}</Para>
      </EuropassRow>
      {cv.experience.length > 0 && (
        <EuropassRow label="কাজের অভিজ্ঞতা · Work experience">
          <Lines items={cv.experience} accent="text-sky-800" />
        </EuropassRow>
      )}
      {(cv.education.length > 0 || cv.training.length > 0) && (
        <EuropassRow label="শিক্ষা ও প্রশিক্ষণ · Education and training">
          <Lines items={[...cv.education, ...cv.training]} accent="text-sky-800" />
        </EuropassRow>
      )}
      {cv.skills.length > 0 && (
        <EuropassRow label="দক্ষতা · Skills">
          <Para>{cv.skills.join(" · ")}</Para>
        </EuropassRow>
      )}
      {cv.languages.length > 0 && (
        <EuropassRow label="ভাষা · Languages">
          <Para>{cv.languages.join(" · ")}</Para>
        </EuropassRow>
      )}
    </article>
  );
}

export function CvSheet({ format, cv }: { format: CvFormat; cv: CvData }) {
  return format === "modern" ? <Modern cv={cv} /> : format === "europass" ? <Europass cv={cv} /> : <Ats cv={cv} />;
}
