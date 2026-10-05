import type { Metadata } from "next";
import { ExamScreen } from "@/components/media/academy/exam-screen";

export const metadata: Metadata = { 
  title: "ফাইনাল থিসিস ও প্রফেশনাল এক্সাম — কান্ডারি তৈরি একাডেমি",
  description: "বাস্তব জীবনের স্কিল যাচাই এবং প্রেস্টিজিয়াস প্রফেশনাল সার্টিফিকেট অর্জন করুন।" 
};

export default function AcademyExamPage() {
  return <ExamScreen />;
}
