import type { Metadata } from "next";
import { MissionGame } from "@/components/gori/mission/mission-game";

export const metadata: Metadata = {
  title: "জাতীয় মিশন — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব",
  description:
    "২–৪ জনের সমবায় কৌশল-খেলা: ৩২টি জাতীয় সমস্যার জালে সংকট শৃঙ্খলে ছড়ায়। ভূমিকা বেছে নিন, মূল কারণ সামলান, কার্ড জমিয়ে চারটি জাতীয় সংস্কার চালু করুন। ৩D বোর্ড, AI সহযোদ্ধা।",
};

export default function MissionPage() {
  return (
    <>
      <header className="mx-auto flex max-w-400 flex-wrap items-baseline gap-x-4 gap-y-1 px-4 pt-6 sm:px-6">
        <h1 className="font-bengali text-3xl font-extrabold text-signal-orange sm:text-4xl">জাতীয় মিশন</h1>
        <p className="font-bengali text-sm text-emerald-50/85 sm:text-base">সংকট শৃঙ্খলে ছড়ায় — মূল কারণ ধরুন, দল মিলিয়ে দেশ গড়ুন।</p>
      </header>
      <MissionGame />
    </>
  );
}
