import type { Metadata } from "next";
import { DepartmentsScreen } from "@/components/media/academy/departments-screen";

export const metadata: Metadata = { 
  title: "স্কিল ডিপার্টমেন্ট — কান্ডারি তৈরি একাডেমি",
  description: "একাডেমির সকল প্র্যাক্টিক্যাল স্কিল ডিপার্টমেন্ট ব্রাউজ করুন।" 
};

export default function AcademyDepartmentsPage() {
  return <DepartmentsScreen />;
}
