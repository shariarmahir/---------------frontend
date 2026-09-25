import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Scale, Search } from "lucide-react";
import { JobCard } from "@/components/media/jobs/job-card";
import { MyJobs, PostJobButton } from "@/components/media/jobs/post-job";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Taka } from "@/components/media/ui/numerals";
import { categories, isCategoryId } from "@/data/media/categories";
import { jobs, jobTypeBn } from "@/data/media/jobs";
import type { JobType } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { PAY_FLOOR } from "@/lib/media/fair-pay";

export const metadata: Metadata = { title: "কাজ" };

type Params = { s?: string; type?: string; st?: string; q?: string };

function href(p: Params) {
  const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]);
  const s = q.toString();
  return s ? `/media/jobs?${s}` : "/media/jobs";
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const sector = sp.s && isCategoryId(sp.s) ? sp.s : undefined;
  const type = sp.type && sp.type in jobTypeBn ? (sp.type as JobType) : undefined;
  const student = sp.st === "1";
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const needle = q.toLowerCase();

  const shown = jobs
    .filter((j) => !sector || j.sector === sector)
    .filter((j) => !type || j.type === type)
    .filter((j) => !student || j.studentFriendly)
    .filter((j) => !needle || [j.title, j.org, j.description, j.location, ...j.tags].some((f) => f.toLowerCase().includes(needle)))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  const sectors = categories.filter((c) => jobs.some((j) => j.sector === c.id));
  const forYou = jobs.filter((j) => currentUser.categories.includes(j.sector)).slice(0, 3);
  const base = { s: sector, type, st: student ? "1" : undefined, q: q || undefined };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="কাজ"
        subtitle="খাত অনুযায়ী কাজ — ইঞ্জিনিয়ার পাবেন প্রকৌশলের কাজ, মার্কেটার মার্কেটিংয়ের। পোস্ট বিনামূল্যে, বেতন লেখা বাধ্যতামূলক ও ন্যায্য।"
        actions={<PostJobButton />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <form action="/media/jobs" role="search">
            {sector && <input type="hidden" name="s" value={sector} />}
            {type && <input type="hidden" name="type" value={type} />}
            {student && <input type="hidden" name="st" value="1" />}
            <label className="relative block">
              <span className="sr-only">কাজ খুঁজুন</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-text-muted" aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="পদ, প্রতিষ্ঠান বা #হ্যাশট্যাগ"
                className="h-12 w-full rounded-2xl border border-card-border bg-white pr-4 pl-12 text-[15px] focus:border-bd-green focus:ring-3 focus:ring-bd-green/15 focus:outline-none"
              />
            </label>
          </form>

          <nav aria-label="কাজের ফিল্টার" className="space-y-3">
            <div className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
              <ul className="flex w-max gap-2">
                <li><Link href={href({ ...base, s: undefined })} scroll={false} aria-current={!sector ? "page" : undefined} className={chipClass(!sector)}>সব খাত</Link></li>
                {sectors.map((c) => (
                  <li key={c.id}>
                    <Link href={href({ ...base, s: c.id })} scroll={false} aria-current={sector === c.id ? "page" : undefined} className={chipClass(sector === c.id)}>
                      {c.bn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {[undefined, ...(Object.keys(jobTypeBn) as JobType[])].map((t) => (
                  <Link
                    key={t ?? "all"}
                    href={href({ ...base, type: t })}
                    scroll={false}
                    aria-current={type === t ? "true" : undefined}
                    className={
                      type === t
                        ? "inline-flex min-h-8 items-center rounded-lg bg-white px-2.5 text-xs font-semibold text-bd-green shadow-[0_1px_2px_rgb(15_23_42/0.08)]"
                        : "inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
                    }
                  >
                    {t ? jobTypeBn[t] : "সব ধরন"}
                  </Link>
                ))}
              </div>
              <Link href={href({ ...base, st: student ? undefined : "1" })} scroll={false} aria-pressed={student} className={chipClass(student)}>
                <GraduationCap className="size-4" aria-hidden /> শিক্ষার্থীদের জন্য
              </Link>
            </div>
          </nav>

          {!sector && !type && !student && !q && <MyJobs />}

          {shown.length === 0 ? (
            <EmptyState icon="search" title="এই ফিল্টারে কাজ নেই" body="অন্য খাত বা ধরন বেছে নিন।" action={<Link href="/media/jobs" className="text-sm font-semibold text-bd-green hover:underline">সব কাজ দেখুন</Link>} />
          ) : (
            <div className="space-y-4">
              {shown.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <Panel title="আপনার দক্ষতার সাথে মেলে">
            <ul className="space-y-3">
              {forYou.map((j) => (
                <li key={j.id}>
                  <p className="text-sm font-semibold text-text-primary">{j.title}</p>
                  <p className="text-xs text-text-muted">{j.org}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="ন্যায্য মজুরির নিয়ম">
            <p className="flex gap-2 text-sm leading-relaxed text-text-secondary">
              <Scale className="mt-0.5 size-4.5 shrink-0 text-bd-green" aria-hidden />
              <span>
                মাসিক বেতন অন্তত <Taka amount={PAY_FLOOR.month} />, ঘণ্টায় অন্তত <Taka amount={PAY_FLOOR.hour} />; এককালীন কাজ ওই খাতের ন্যায্য দামের কাছাকাছি। এর নিচে পোস্ট হয় না।
              </span>
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
