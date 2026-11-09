import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Scale, Search } from "lucide-react";
import { Graduates, graduateCount } from "@/components/media/jobs/graduates";
import { Invitations } from "@/components/media/jobs/invitations";
import { JobCard } from "@/components/media/jobs/job-card";
import { MyJobs, PostJobButton } from "@/components/media/jobs/post-job";
import { SeekingButton, Seekers } from "@/components/media/jobs/seekers";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { Num, Taka } from "@/components/media/ui/numerals";
import { categories, isCategoryId } from "@/data/media/categories";
import { jobs, jobTypeBn } from "@/data/media/jobs";
import type { JobType } from "@/data/media/types";
import { currentUser, people } from "@/data/media/users";
import { PAY_FLOOR } from "@/lib/media/fair-pay";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "কাজ" };

type Params = { s?: string; type?: string; st?: string; q?: string };

function href(p: Params) {
  const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]);
  const s = q.toString();
  return s ? `/media/jobs?${s}` : "/media/jobs";
}

const hud = "font-mono text-[11px] font-bold tracking-wide uppercase";

const BANDS = [
  { id: "open-jobs", label: "খোলা কাজ" },
  { id: "seekers", label: "কাজ চাই" },
  { id: "graduates", label: "একাডেমির স্কিল হান্টার" },
  { id: "invites", label: "আমন্ত্রণ" },
] as const;

/** One band of the page, numbered like the academy's: "০২ / কাজ চাই", a bold title, a line on what it is. */
function Band({ n, title, note, action, children }: { n: number; title: string; note: string; action?: React.ReactNode; children: React.ReactNode }) {
  const { id, label } = BANDS[n - 1];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32">
      <header className="flex flex-wrap items-end justify-between gap-4 border-t border-m-ink/10 pt-6">
        <div className="min-w-0">
          <p className={cn(hud, "text-m-ink/50")}>
            <Num value={String(n).padStart(2, "0")} /> / {label}
          </p>
          <h2 id={`${id}-title`} className="mt-1.5 text-2xl leading-tight font-bold text-m-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-m-ink/65">{note}</p>
        </div>
        {action}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * কাজ — the hiring floor, laid out like the academy's pages. Open jobs with
 * everything about each; people who want work, in the open for recruiters;
 * the academy's graduates, verified and ready to interview; and the
 * invitations going both ways. Every job names the academy courses that
 * teach it, so the road from learning to work is one tap.
 */
export default async function JobsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const sector = sp.s && isCategoryId(sp.s) ? sp.s : undefined;
  const type = sp.type && sp.type in jobTypeBn ? (sp.type as JobType) : undefined;
  const student = sp.st === "1";
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const needle = q.toLowerCase();
  const filtered = Boolean(sector || type || student || q);

  const shown = jobs
    .filter((j) => !sector || j.sector === sector)
    .filter((j) => !type || j.type === type)
    .filter((j) => !student || j.studentFriendly)
    .filter((j) => !needle || [j.title, j.org, j.description, j.location, ...j.tags].some((f) => f.toLowerCase().includes(needle)))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  const sectors = categories.filter((c) => jobs.some((j) => j.sector === c.id));
  const forYou = jobs.filter((j) => currentUser.categories.includes(j.sector));
  const base = { s: sector, type, st: student ? "1" : undefined, q: q || undefined };
  const heroShots = jobs.filter((j) => j.image).slice(0, 3);
  const stats = [
    { n: jobs.length, label: "খোলা কাজ" },
    { n: jobs.reduce((sum, j) => sum + j.applicants, 0), label: "আবেদন" },
    { n: people.filter((p) => p.openToWork).length, label: "কাজ চাইছেন" },
    { n: graduateCount(), label: "সনদপ্রাপ্ত গ্র্যাজুয়েট" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-m-ink/10 bg-m-card">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="p-5 sm:p-8 lg:p-10">
            <p className={cn(hud, "text-m-blue")}>কাজের বাজার · ন্যায্য মজুরি</p>
            <h1 className="mt-3 text-4xl leading-[1.1] font-bold text-balance text-m-ink sm:text-5xl">
              দক্ষতা দেখান, <span className="text-m-yellow">কাজ</span> পান।
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-m-ink/75">
              খাত অনুযায়ী কাজ, বেতন লেখা বাধ্যতামূলক। কাজ চাইলে কার্ড রাখুন — নিয়োগকর্তারা সরাসরি ডাকবেন। একাডেমির সনদপ্রাপ্তরা যাচাই করা ফল নিয়ে তৈরি।
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <PostJobButton />
              <SeekingButton />
            </div>
          </div>
          <div aria-hidden className="relative hidden grid-cols-2 grid-rows-2 gap-1.5 p-1.5 lg:grid">
            {heroShots.map((j, i) => (
              <span key={j.id} className={cn("relative overflow-hidden rounded-2xl", i === 0 && "row-span-2")}>
                <Image src={j.image!} alt="" fill sizes="20rem" className="object-cover" />
              </span>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px border-t border-m-ink/10 bg-m-ink/10 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="bg-m-card px-5 py-4">
              <dt className={cn(hud, "text-m-ink/50")}>
                <Num value={String(i + 1).padStart(2, "0")} /> / {s.label}
              </dt>
              <dd className="font-display-m mt-1 text-2xl font-bold text-m-ink">
                <Num value={s.n} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="এই পাতায়" className="frost-pane sticky top-16 z-30 -mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:rounded-2xl sm:px-2">
        <ul className="flex w-max gap-1 py-2">
          {BANDS.map((b, i) => (
            <li key={b.id}>
              <a href={`#${b.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-bold text-m-ink/75 transition-colors hover:bg-m-ink/8 hover:text-m-ink">
                <span className="font-mono text-[11px] text-m-ink/45">
                  <Num value={String(i + 1).padStart(2, "0")} />
                </span>
                {b.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Band
        n={1}
        title="এখন যেসব কাজ খোলা"
        note="প্রতিটি কাজে মজুরি, সময়, নিয়োগের ধাপ আর যে কোর্সে কাজটা শেখা যায় — সব এক জায়গায়।"
        action={
          <p className="flex max-w-xs items-start gap-2 text-xs leading-relaxed text-m-ink/60">
            <Scale className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden />
            <span>
              মাসে অন্তত <Taka amount={PAY_FLOOR.month} />, ঘণ্টায় অন্তত <Taka amount={PAY_FLOOR.hour} /> — এর নিচে কাজ পোস্ট হয় না।
            </span>
          </p>
        }
      >
        <div className="space-y-4">
          <form action="/media/jobs#open-jobs" role="search">
            {sector && <input type="hidden" name="s" value={sector} />}
            {type && <input type="hidden" name="type" value={type} />}
            {student && <input type="hidden" name="st" value="1" />}
            <label className="relative block">
              <span className="sr-only">কাজ খুঁজুন</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-m-ink/55" aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={q}
                autoComplete="off"
                placeholder="পদ, প্রতিষ্ঠান বা #হ্যাশট্যাগ…"
                className="h-12 w-full rounded-2xl border border-m-ink/10 bg-m-card pr-4 pl-12 text-[15px] text-m-ink focus:border-m-blue focus:ring-3 focus:ring-m-blue/15 focus:outline-none"
              />
            </label>
          </form>

          <nav aria-label="কাজের ফিল্টার" className="space-y-3">
            <div className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
              <ul className="flex w-max gap-2">
                <li>
                  <Link href={href({ ...base, s: undefined })} scroll={false} aria-current={!sector ? "page" : undefined} className={chipClass(!sector)}>
                    সব খাত
                  </Link>
                </li>
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
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-m-ink/6 p-1 scrollbar-none">
                {[undefined, ...(Object.keys(jobTypeBn) as JobType[])].map((t) => (
                  <Link
                    key={t ?? "all"}
                    href={href({ ...base, type: t })}
                    scroll={false}
                    aria-current={type === t ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-8 shrink-0 items-center rounded-lg px-2.5 text-xs font-semibold",
                      type === t ? "bg-m-yellow text-m-ink" : "text-m-ink/75 hover:text-m-ink",
                    )}
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

          {!filtered && forYou.length > 0 && (
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-m-ink/60">আপনার দক্ষতার সাথে মেলে:</span>
              {forYou.map((j) => (
                <a
                  key={j.id}
                  href={`#${j.id}`}
                  className="rounded-full border border-m-blue/40 px-3 py-1 text-xs font-semibold text-m-ink transition-colors hover:bg-m-blue hover:text-white"
                >
                  {j.title}
                </a>
              ))}
            </p>
          )}

          {!filtered && <MyJobs />}

          {shown.length === 0 ? (
            <EmptyState
              icon="search"
              title="এই ফিল্টারে কাজ নেই"
              body="অন্য খাত বা ধরন বেছে নিন।"
              action={
                <Link href="/media/jobs" className="text-sm font-semibold text-m-blue hover:underline">
                  সব কাজ দেখুন
                </Link>
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {shown.map((j, i) => (
                <li key={j.id}>
                  <JobCard job={j} n={i + 1} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Band>

      <Band
        n={2}
        title="যাঁরা কাজ চাইছেন"
        note="সব নিয়োগকর্তা ও প্রতিষ্ঠানের জন্য খোলা — প্রোফাইল, যাচাইকৃত দক্ষতা আর CV দেখে সরাসরি ইন্টারভিউয়ে ডাকুন।"
        action={
          <Link href="/media/people" className="text-sm font-semibold text-m-blue hover:underline">
            সবাইকে দেখুন
          </Link>
        }
      >
        <Seekers />
      </Band>

      <Band
        n={3}
        title="পাস করে কাজের জন্য তৈরি"
        note="কাণ্ডারী তৈরি একাডেমির প্যানেল ইন্টারভিউ পাস করা মানুষ — নম্বর আর সনদ যে কেউ যাচাই করতে পারেন। যাঁদের ইন্টারভিউ সামনে, তাঁরাও এখানে।"
        action={
          <Link href="/media/academy/graduation" className="text-sm font-semibold text-m-blue hover:underline">
            সমাবর্তন বোর্ড
          </Link>
        }
      >
        <Graduates />
      </Band>

      <Band n={4} title="ইন্টারভিউয়ের আমন্ত্রণ" note="আপনার কাছে আসা আমন্ত্রণে রাজি হন বা ফিরিয়ে দিন; আপনি যাঁদের ডেকেছেন, তাঁরাও এখানে।">
        <Invitations />
      </Band>
    </div>
  );
}
