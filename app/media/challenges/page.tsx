import type { Metadata } from "next";
import Link from "next/link";
import { ChallengeCard } from "@/components/media/community/challenges";
import { chipClass } from "@/components/media/ui/field-styles";
import { PageHeader } from "@/components/media/ui/layout";
import { challengeKindBn, challenges } from "@/data/media/challenges";
import type { ChallengeKind } from "@/data/media/types";

export const metadata: Metadata = { title: "চ্যালেঞ্জ" };

export default async function ChallengesPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const kind = k && k in challengeKindBn ? (k as ChallengeKind) : undefined;
  const shown = challenges.filter((c) => !kind || c.kind === kind).sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="চ্যালেঞ্জ"
        subtitle="কোড, ডিজাইন, গবেষণা আর ল্যাবের চ্যালেঞ্জ — একা বা টিমে। বাস্তব সমস্যার সমাধান করে পুরস্কার জিতুন, ছোট পেইড অ্যাসাইনমেন্টে আয় করুন।"
      />
      <nav aria-label="চ্যালেঞ্জের ধরন" className="-mx-3 mb-5 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          <li><Link href="/media/challenges" scroll={false} aria-current={!kind ? "page" : undefined} className={chipClass(!kind)}>সব</Link></li>
          {(Object.keys(challengeKindBn) as ChallengeKind[]).map((key) => (
            <li key={key}>
              <Link href={`/media/challenges?k=${key}`} scroll={false} aria-current={kind === key ? "page" : undefined} className={chipClass(kind === key)}>
                {challengeKindBn[key]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
      </div>
    </div>
  );
}
