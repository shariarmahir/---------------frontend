import type { Metadata } from "next";
import { AcademiesView } from "@/components/media/academy/catalogue/academies-view";
import { academyEntries } from "@/components/media/academy/catalogue/entries";

export const metadata: Metadata = {
  title: "একাডেমি · কাণ্ডারী তৈরি একাডেমি",
  description: "দেশের পেশাদারদের সব একাডেমি এক জায়গায় — কারা শেখান, কীভাবে শেখান, কোন কোন বিভাগ আর কোর্স।",
};

/** Step one of the road: every academy, side by side. */
export default function AcademiesPage() {
  return <AcademiesView entries={academyEntries()} />;
}
