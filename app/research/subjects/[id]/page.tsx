import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { COLUMN, H1, LINK, subjectHref } from "@/components/research/kit";
import { Results } from "@/components/research/results";
import { FIELDS, type FieldId } from "@/lib/research/core";
import { isFieldId, SUBJECT_GROUPS } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(FIELDS) as FieldId[]).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${isFieldId(id) ? FIELDS[id].en : "Subject"} — Genius` };
}

/** One subject: its group, its sister subjects, and every work in it, refinable. */
export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isFieldId(id)) notFound();
  const group = SUBJECT_GROUPS.find((g) => g.fields.includes(id))!;
  const sisters = group.fields.filter((f) => f !== id);
  return (
    <div className={cn(COLUMN, "py-10 lg:py-12")}>
      <h1 className={cn(H1, "hero-rise flex items-center gap-3")}>
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-signal-orange text-text-primary"><Icon name={FIELDS[id].icon} className="text-3xl" /></span> {FIELDS[id].en}
      </h1>
      {sisters.length > 0 && (
        <p className="mt-4 text-base text-white/80">
          Also in {group.title}:{" "}
          {sisters.map((f, i) => (
            <span key={f}>
              {i > 0 && ", "}
              <Link href={subjectHref(f)} className={LINK}>{FIELDS[f].en}</Link>
            </span>
          ))}
        </p>
      )}
      <div className="mt-10">
        <Results scope={id} />
      </div>
    </div>
  );
}
