import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileSearch, Swords } from "lucide-react";
import { ModeMenu, PlayerStrip } from "@/components/gori/landing";
import { NationalLayer } from "@/components/gori/national/national-layer";
import { commonsPhotos } from "@/data/bangladesh-photos";

export const metadata: Metadata = {
  title: "চলো বাংলাদেশ গড়ি — জীবন্ত সভ্যতার খেলা | কাণ্ডারী-ল্যাব",
  description:
    "বাংলাদেশের ৩২টি বাস্তব সমস্যা নিয়ে কৌশল-খেলা: ২–৪ জনের সমবায় জাতীয় মিশন (৩D বোর্ড, AI সহযোদ্ধা, শৃঙ্খল-সংকট), সিস্টেম-সিমুলেশন, বিজ্ঞানাগার আর স্বচ্ছ স্কোর। সব ফল খেলার মডেলে — বাস্তব উন্নয়নের দাবি নয়।",
};

const hero = commonsPhotos.padmabridge!;

export default function GoriHome() {
  return (
    <>
      <section aria-labelledby="gori-title" className="relative isolate overflow-hidden">
        <Image src={hero.src} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-35" />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-gori-deep/60 via-gori-deep/85 to-gori-deep" aria-hidden />
        <div className="mx-auto max-w-340 px-4 pt-12 pb-10 sm:px-6 sm:pt-16 lg:px-8">
          <p className="font-bengali text-sm font-semibold text-emerald-200">কাণ্ডারী-ল্যাব · জীবন্ত সভ্যতার খেলা</p>
          <h1 id="gori-title" className="mt-3 font-bengali text-5xl leading-[1.1] font-extrabold text-signal-orange sm:text-6xl lg:text-7xl">
            চলো বাংলাদেশ গড়ি
          </h1>
          <p className="mt-4 font-bengali text-xl font-semibold text-white">ব্যবস্থা গড়ুন। ভবিষ্যৎ পরীক্ষা করুন। ফলের মুখোমুখি হোন।</p>
          <p className="mt-3 max-w-[62ch] font-bengali text-base leading-8 text-emerald-50/85">
            “আমি কি এই ব্যবস্থা ভালো করতে পারি?” — একটি পরিকল্পনা পরীক্ষা করে দেখুন। প্রতিটি পরিকল্পনার খরচ আছে, নির্ভরতা আছে, অনিশ্চয়তা আছে, পরিণতি আছে। একটি ‘সঠিক’ মতাদর্শ নেই; আছে প্রমাণ, অনুমান আর বিনিময় — সবকিছু খোলাখুলি।
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/cholo-bangladesh-gori/mission" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-signal-orange px-6 font-bengali text-lg font-extrabold text-gori-ink transition-transform hover:-translate-y-0.5">
              <Swords className="size-5" aria-hidden /> জাতীয় মিশন খেলুন
            </Link>
            <PlayerStrip />
          </div>
          <p className="mt-6 max-w-[70ch] rounded-lg bg-white/6 px-3.5 py-2.5 font-bengali text-xs leading-5 text-emerald-100/80">
            সততার নীতি: বাস্তব প্রমাণ, খেলার অনুমান, আপনার প্রস্তাব আর সিমুলেশনের ফল — চারটি সবসময় আলাদা করে দেখানো হয়। খেলার কোনো ফল বাস্তব জাতীয় উন্নয়নের দাবি নয়।
          </p>
        </div>
        <p className="absolute right-3 bottom-2 text-[10px] text-white/50">
          ছবি: পদ্মা সেতু · {hero.credit?.author} ·{" "}
          <a href={hero.credit?.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
            {hero.credit?.license}
          </a>
        </p>
      </section>

      <ModeMenu />
      <NationalLayer />

      <section aria-label="পদ্ধতি" className="border-t border-white/10">
        <div className="mx-auto max-w-340 px-4 py-10 font-bengali text-sm leading-7 text-emerald-100/80 sm:px-6 lg:px-8">
          <p className="max-w-[75ch]">
            ৩২টি মডিউল (BD-001–BD-032) জাতীয় সমস্যা প্রতিবেদনের ৩২টি পয়েন্ট থেকে। পূর্ণ সিমুলেশন আপাতত একটি: BD-001, একটি কাল্পনিক ইউনিয়নের প্রাথমিক স্বাস্থ্যসেবা। বাকিগুলোতে প্রমাণ-পরীক্ষা খেলা যায়। সংখ্যাগুলো খেলার সহগ, কোনটি প্রতিবেদনভিত্তিক আর কোনটি অনুমান — প্রতিটি জায়গায় লেখা আছে।
          </p>
          <Link href="/cholo-bangladesh-gori/evidence" className="mt-3 inline-flex items-center gap-2 font-semibold text-signal-orange hover:underline">
            <FileSearch className="size-4" aria-hidden /> প্রমাণ অনুসন্ধান
          </Link>
        </div>
      </section>
    </>
  );
}
