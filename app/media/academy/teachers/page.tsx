import type { Metadata } from "next";
import { TeachersScreen } from "@/components/media/academy/teachers-screen";

export const metadata: Metadata = { 
  title: "প্রফেশনাল মেন্টর ও শিক্ষক — কান্ডারি তৈরি একাডেমি",
  description: "একাডেমির সকল প্রুভেন ও প্রফেশনাল শিক্ষকদের প্রোফাইল।" 
};

export default function AcademyTeachersPage() {
  return <TeachersScreen />;
}
