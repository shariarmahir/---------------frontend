import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CvStudio } from "@/components/media/profile/cv-studio";
import { readFormat } from "@/lib/media/cv";
import { CURRENT_USER_HANDLE, getPerson, people } from "@/data/media/users";

export const dynamicParams = false;

export function generateStaticParams() {
  return people.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = getPerson((await params).handle);
  return p ? { title: `CV — ${p.nameBn}` } : {};
}

/** Anyone's CV, built from their profile; the viewer's own also opens its editor. */
export default async function CvPage({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<{ f?: string }> }) {
  const person = getPerson((await params).handle);
  if (!person) notFound();
  return <CvStudio person={person} self={person.handle === CURRENT_USER_HANDLE} format={readFormat((await searchParams).f)} base={`/media/u/${person.handle}/cv`} />;
}
