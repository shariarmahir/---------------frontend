import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/media/profile/profile-view";
import { CURRENT_USER_HANDLE, getPerson, people } from "@/data/media/users";

export const dynamicParams = false;

export function generateStaticParams() {
  return people.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = getPerson((await params).handle);
  return p ? { title: `${p.nameBn} — ${p.headline}`, description: p.bio } : {};
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const person = getPerson((await params).handle);
  if (!person) notFound();
  return <ProfileView person={person} self={person.handle === CURRENT_USER_HANDLE} />;
}
