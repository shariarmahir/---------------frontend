import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayScreen } from "@/components/gori/play/play-screen";

export const metadata: Metadata = {
  title: "কমান্ড সেন্টার — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব",
  description: "কারণ-মানচিত্র, হস্তক্ষেপ, সম্পদ বণ্টন আর টার্নভিত্তিক সিমুলেশন — একটি কাল্পনিক ইউনিয়নের প্রাথমিক স্বাস্থ্যসেবা।",
};

export default function PlayPage() {
  return (
    <Suspense>
      <PlayScreen />
    </Suspense>
  );
}
