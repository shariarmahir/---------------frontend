import type { Metadata } from "next";
import { ChapterShell } from "@/components/bangladesh-landing/chapter-shell";
import { CitizenShield, CityRights, ShieldNext } from "@/components/desh/citizen-shield";

export const metadata: Metadata = {
  title: "Citizen shield — Bangladesh | Kandari-Lab",
  description:
    "Chapter 3 of Bangladesh: the citizen shield, from yourself to your neighbourhood to the country, with your rights, duties and where to raise a protest.",
};

export default function BangladeshShieldPage() {
  return (
    <ChapterShell chapter="shield">
      <CitizenShield />
      <CityRights />
      <ShieldNext />
    </ChapterShell>
  );
}
