import type { Metadata } from "next";
import { DepartmentsView } from "@/components/media/academy/catalogue/departments-view";
import { deptEntries } from "@/components/media/academy/catalogue/entries";

export const metadata: Metadata = {
  title: "বিভাগ · কাণ্ডারী তৈরি একাডেমি",
  description: "সব একাডেমির সব বিভাগ এক জায়গায় — প্রতিটির একাডেমি, শিক্ষক, কোর্স, ফি আর পরের ব্যাচ দেখে নিজের পথ বেছে নিন।",
};

/** Step three of the road: every department of every academy, side by side. */
export default function DepartmentsPage() {
  return <DepartmentsView entries={deptEntries()} />;
}
