import type { Metadata } from "next";
import { TeachScreen } from "@/components/media/academy/teach-screen";

export const metadata: Metadata = { 
  title: "শিক্ষক হিসেবে যোগ দিন — কান্ডারি তৈরি একাডেমি",
  description: "আপনার প্রফেশনাল স্কিল শেখান এবং নিজের ডিপার্টমেন্ট তৈরি করুন।" 
};

export default function AcademyTeachPage() {
  return <TeachScreen />;
}
