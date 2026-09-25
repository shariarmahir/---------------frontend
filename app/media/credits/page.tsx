import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/media/ui/layout";
import { imageCredits } from "@/data/media/credits";

export const metadata: Metadata = { title: "ছবির কৃতজ্ঞতা" };

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="ছবির কৃতজ্ঞতা"
        subtitle="ডেমোর ছবিগুলো উইকিমিডিয়া কমন্সের মুক্ত লাইসেন্সের কাজ। প্রতিটির আলোকচিত্রী, লাইসেন্স ও মূল উৎস নিচে দেওয়া হলো।"
        back={{ href: "/media", label: "ফিড" }}
      />
      <ul className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-white">
        {imageCredits.map((c) => (
          <li key={c.src} className="flex items-center gap-4 p-3 sm:p-4">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <Image src={c.src} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-text-primary" lang="en">{c.title}</span>
              <span className="block truncate text-xs text-text-muted" lang="en">
                {c.author} · {c.license}
              </span>
            </span>
            <a
              href={c.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-bd-green hover:bg-bd-green-light"
            >
              উৎস <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
