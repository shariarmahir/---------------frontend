import type { Metadata } from "next";
import { CoursesView } from "@/components/media/academy/catalogue/courses-view";
import { courseEntries } from "@/components/media/academy/catalogue/entries";

export const metadata: Metadata = {
  title: "কোর্স বাছুন · কাণ্ডারী তৈরি একাডেমি",
  description: "সব একাডেমির সব কোর্স এক জায়গায় — বিভাগ ধরে সাজানো, নিজের স্তর মিলিয়ে বাছুন।",
};

/** Step ৪ of the road: every course of every academy, side by side. */
export default function CoursesPage() {
  return <CoursesView entries={courseEntries()} />;
}
