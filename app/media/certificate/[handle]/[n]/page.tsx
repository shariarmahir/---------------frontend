import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { PrintButton } from "@/components/media/profile/print-button";
import { PageHeader } from "@/components/media/ui/layout";
import { Num } from "@/components/media/ui/numerals";
import { Stars } from "@/components/media/ui/trust";
import { getCategory } from "@/data/media/categories";
import { certificatesFor } from "@/data/media/certificates";
import { getPerson } from "@/data/media/users";

async function find(params: Promise<{ handle: string; n: string }>) {
  const { handle, n } = await params;
  const person = getPerson(handle);
  const cert = person && certificatesFor(person).find((c) => String(c.n) === n);
  return person && cert ? { person, cert } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string; n: string }> }): Promise<Metadata> {
  const f = await find(params);
  return f ? { title: `সার্টিফিকেট — ${f.cert.skill.skill}, ${f.person.nameBn}` } : {};
}

export default async function CertificatePage({ params }: { params: Promise<{ handle: string; n: string }> }) {
  const f = await find(params);
  if (!f) notFound();
  const { person, cert } = f;
  const s = cert.skill;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print:hidden">
        <PageHeader title="দক্ষতার সার্টিফিকেট" back={{ href: `/media/u/${person.handle}`, label: person.nameBn }} actions={<PrintButton />} />
      </div>
      <article className="relative overflow-hidden rounded-2xl border-2 border-bd-green/40 bg-white p-6 text-center shadow-[0_10px_30px_-18px_rgb(0_71_49/0.45)] sm:p-12 print:border-bd-green print:shadow-none">
        <div className="absolute inset-3 rounded-xl border border-bd-green/15" aria-hidden />
        <Image src="/logo/logo.png" alt="" width={1432} height={2000} className="mx-auto h-14 w-auto" />
        <p className="mt-3 text-sm font-bold tracking-wide text-bd-green">শিক্ষিতদের মিডিয়া</p>
        <h1 className="mt-6 text-sm font-semibold text-text-muted">কমিউনিটি-যাচাইকৃত দক্ষতার সনদ</h1>
        <p className="mt-6 text-sm text-text-secondary">এই মর্মে জানানো যাচ্ছে যে</p>
        <p className="mt-2 text-3xl font-bold text-text-primary">{person.nameBn}</p>
        <p className="text-sm text-text-muted" lang="en">{person.name}</p>
        <p className="mt-6 text-sm text-text-secondary">কাজের প্রমাণ দেখে কমিউনিটি যাচাই করেছে তাঁর দক্ষতা</p>
        <p className="mt-2 text-2xl font-bold text-bd-green-dark">{s.skill}</p>
        <p className="text-sm text-text-muted">{getCategory(s.category).bn}</p>
        <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-6 rounded-xl bg-bd-green-light/60 px-4 py-3">
          <div>
            <p className="text-2xl font-bold text-bd-green-dark"><Num value={s.communityAvg} decimals={1} /></p>
            <Stars value={s.communityAvg} size={14} />
          </div>
          <div className="text-left text-sm text-text-secondary">
            <p><Num value={s.raters} /> জন পরিচয়-যাচাইকৃত মানুষের রেটিং</p>
            <p>নিজের দাবি <Num value={s.self} decimals={1} /></p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 text-left text-xs text-text-muted">
          <div>
            <p>সনদ নম্বর</p>
            <p className="font-mono text-sm font-semibold text-text-primary">{cert.id}</p>
          </div>
          <SealCheck size={56} weight="duotone" className="seal-shine rounded-full text-bd-green" aria-hidden />
          <div className="text-right">
            <p>পরীক্ষা নয়, প্রমাণ।</p>
            <p>সার্টিফিকেট নয়, কাজ।</p>
          </div>
        </div>
      </article>
      <p className="mt-4 text-center text-xs text-text-muted print:hidden">
        ৫ বা তার বেশি জনের রেটিং দাবির আধা তারার মধ্যে থাকলে সনদ তৈরি হয়। রেটিং কমে গেলে সনদ বাতিল হয়।
      </p>
    </div>
  );
}
