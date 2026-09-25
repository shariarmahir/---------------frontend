import type { Metadata } from "next";
import Link from "next/link";
import { CreateTeamButton, MyTeams, TeamCard } from "@/components/media/community/teams";
import { chipClass } from "@/components/media/ui/field-styles";
import { PageHeader } from "@/components/media/ui/layout";
import { teamKindBn, teamKindHint, teams } from "@/data/media/teams";
import type { TeamKind } from "@/data/media/types";

export const metadata: Metadata = { title: "টিম ও গ্রুপ" };

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const kind = k && k in teamKindBn ? (k as TeamKind) : undefined;
  const shown = teams.filter((t) => !kind || t.kind === kind);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="টিম ও গ্রুপ"
        subtitle="প্রোডাক্টিভ ফ্যামিলি, ইউনিভার্সিটি ল্যাব, প্রজেক্ট টিম, ভ্রমণ দল — একসাথে শিখুন, বানান, আয় করুন।"
        actions={<CreateTeamButton />}
      />
      <nav aria-label="টিমের ধরন" className="-mx-3 mb-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          <li><Link href="/media/teams" scroll={false} aria-current={!kind ? "page" : undefined} className={chipClass(!kind)}>সব</Link></li>
          {(Object.keys(teamKindBn) as TeamKind[]).map((key) => (
            <li key={key}>
              <Link href={`/media/teams?k=${key}`} scroll={false} aria-current={kind === key ? "page" : undefined} className={chipClass(kind === key)}>
                {teamKindBn[key]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {kind && <p className="mb-5 text-sm text-text-secondary">{teamKindHint[kind]}</p>}
      <div className="space-y-6">
        {!kind && <MyTeams />}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((t) => <TeamCard key={t.id} team={t} />)}
        </div>
      </div>
    </div>
  );
}
