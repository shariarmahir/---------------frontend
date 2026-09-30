import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { PixelMark } from "@/components/ui/section-kit";

export const metadata: Metadata = { title: "কমিউনিটি মিশন — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব" };

const planned = [
  ["দলগত ভূমিকা", "সমন্বয়ক, প্রমাণ-সংগ্রাহক, অংশীজন-প্রতিনিধি, পর্যালোচক — প্রতিটি ভূমিকার আলাদা কাজ।"],
  ["যৌথ কারণ-মানচিত্র", "একই মানচিত্রে একসাথে সম্পর্ক যোগ, প্রত্যেকের অবদান নামসহ।"],
  ["কাজ ভাগ", "কে কোন প্রমাণ খুঁজবে, কোন হস্তক্ষেপ পরীক্ষা করবে।"],
  ["মন্তব্য ও প্রমাণের অনুরোধ", "যেকোনো সম্পর্ক বা দাবিতে “উৎস দেখান” অনুরোধ।"],
  ["সংস্করণ ইতিহাস", "প্রস্তাবের প্রতিটি বদল দেখা ও ফেরানো।"],
  ["পর্যালোচনা ও মডারেশন", "প্রকাশের আগে মানুষের পর্যালোচনা; অপব্যবহার রিপোর্ট।"],
];

/** Honest preview: collaboration needs accounts, a server and moderation, none of which exist yet. */
export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PixelMark tone="dark" className="mb-2" />
      <h1 className="flex items-center gap-3 font-bengali text-3xl font-bold text-signal-orange"><Users className="size-8" aria-hidden /> কমিউনিটি মিশন</h1>
      <p className="mt-3 font-bengali text-base leading-8 text-white/85">
        এখানে একদল মানুষ একসাথে একটি প্রস্তাব গড়বেন। এটি এখনো চালু হয়নি — অ্যাকাউন্ট, সার্ভার, রিয়েল-টাইম সংযোগ আর মানুষের মডারেশন ছাড়া দলগত কাজ নিরাপদে চালানো যায় না। নকল “চালু আছে” দেখানোর বদলে আমরা পরিকল্পনাটা খুলে বলছি।
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {planned.map(([t, d]) => (
          <li key={t} className="rounded-xl bg-text-primary ring-1 ring-white/12 p-4 font-bengali">
            <p className="font-bold">{t}</p>
            <p className="mt-1 text-sm text-white/85">{d}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 font-bengali text-sm text-white/80">
        এখন যা করা যায়: নিজের দৃশ্যকল্প বানিয়ে JSON হিসেবে সহকর্মীদের দিন, আর একই বীজে খেলে ফল তুলনা করুন।
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/cholo-bangladesh-gori/forge" className="inline-flex h-11 items-center rounded-xl bg-signal-orange px-5 font-bengali font-bold text-text-primary">দৃশ্যকল্প কারখানা</Link>
        <Link href="/cholo-bangladesh-gori/compare" className="inline-flex h-11 items-center rounded-xl border border-white/30 px-5 font-bengali font-semibold">কৌশল তুলনা</Link>
      </div>
    </div>
  );
}
