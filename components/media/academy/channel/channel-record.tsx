"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Person } from "@/data/media/types";
import type { TeacherRecord } from "@/lib/media/academy";
import { skillStatus, type SkillStatus } from "@/lib/media/skill";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { secondaryBtn } from "../catalogue/buttons";
import { TierTag } from "../catalogue/tier-tag";
import { ComplaintBox } from "../complaint-box";
import { standingOf } from "../parts";

/** A verified skill in the catalogue's words and marks. */
const STATUS: Record<SkillStatus, { bn: string; look: string; hint: string }> = {
  verified: { bn: "কমিউনিটি যাচাইকৃত", look: "bg-(--c-good) text-black", hint: "৫+ জনের রেটিং দাবির আধা তারার মধ্যে" },
  challenged: { bn: "চ্যালেঞ্জড", look: "border border-(--c-bad) text-(--c-bad)", hint: "কমিউনিটির রেটিং দাবির চেয়ে দেড় তারা বা তার বেশি কম" },
  rated: { bn: "যাচাই চলছে", look: "border border-(--c-line-strong) text-(--c-muted)", hint: "আরও রেটিং দরকার" },
  unrated: { bn: "যাচাই বাকি", look: "border border-(--c-signal) text-(--c-signal)", hint: "এখনো কেউ রেটিং দেয়নি" },
};

/**
 * The record behind the channel, in ruled cells: how the points add up, the
 * skills the community verified, the panel that passed them, and where to
 * complain.
 */
export function ChannelRecord({ record, person }: { record: TeacherRecord; person: Person }) {
  const reduce = useReducedMotion();
  const { points, tier } = standingOf(record);
  const parts = [
    { label: "প্যানেল ইন্টারভিউ", value: points.interview, max: 40 },
    { label: "শিক্ষার্থীদের রেটিং", value: points.rating, max: 30 },
    { label: "গ্র্যাজুয়েট", value: points.graduates, max: 20 },
    { label: "সফলতার গল্প", value: points.stories, max: 10 },
  ];
  const head = "hud text-(--c-faint)";

  return (
    <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-px">
        <section aria-labelledby="points" className="bg-(--c-bg) p-6 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-lg">
              <h2 id="points" className="display text-2xl text-(--c-ink-strong)">
                পয়েন্টের হিসাব
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-(--c-muted)">
                র‍্যাংক ঠিক হয় এই পয়েন্টে — টাকা দিয়ে কেউ উপরে উঠতে পারেন না। গড় রেটিং <Num value={record.rating.avg} decimals={1} />, <Num value={record.rating.count} />
                টি রেটিং থেকে।
              </p>
            </div>
            <div className="flex items-end gap-4">
              <TierTag tier={tier} />
              <p className="text-right">
                <span className="display block text-6xl leading-none text-(--c-ink-strong) tabular-nums">
                  <Num value={points.total} />
                </span>
                <span className="hud text-(--c-faint)">
                  <Num value={100} />
                  -র মধ্যে
                </span>
              </p>
            </div>
          </div>
          <ul className="mt-8 space-y-4">
            {parts.map((p, i) => (
              <li key={p.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-(--c-ink)">{p.label}</span>
                  <span className="hud text-(--c-ink-strong)">
                    <Num value={p.value} /> / <Num value={p.max} />
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-(--c-line)">
                  <motion.span
                    className="block h-full bg-(--c-signal)"
                    initial={reduce ? false : { width: 0 }}
                    whileInView={{ width: `${(p.value / p.max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </li>
            ))}
            {points.penalty > 0 && (
              <li className="flex justify-between border-t border-(--c-line) pt-4 text-sm">
                <span className="text-(--c-ink)">
                  প্রমাণিত অভিযোগ (<Num value={record.complaints.upheld} />
                  টি)
                </span>
                <span className="hud text-(--c-bad)">
                  −<Num value={points.penalty} />
                </span>
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="skills" className="bg-(--c-bg) p-6 md:p-10">
          <h2 id="skills" className="display text-2xl text-(--c-ink-strong)">
            কমিউনিটি যাচাই করা দক্ষতা
          </h2>
          <ul className="mt-6 grid gap-px border border-(--c-line) bg-(--c-line) sm:grid-cols-2">
            {person.skills.map((s) => {
              const st = STATUS[skillStatus(s.self, s.communityAvg, s.raters)];
              return (
                <li key={s.skill} className="flex items-center justify-between gap-3 bg-(--c-bg) px-4 py-3 text-sm">
                  <span className="text-(--c-ink)">{s.skill}</span>
                  <span title={st.hint} className={cn("hud shrink-0 px-1.5 py-px font-bold", st.look)}>
                    {st.bn}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link href={`/media/u/${person.handle}`} className={cn(secondaryBtn, "mt-6 h-10 px-4")}>
            পুরো প্রোফাইল ও কাজ <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </section>
      </div>

      <aside className="flex flex-col gap-px">
        <section className="bg-(--c-bg) p-6 md:p-8">
          <h2 className={head}>ইন্টারভিউর রেকর্ড</h2>
          <dl className="mt-4 border-t border-(--c-line) text-sm">
            <div className="flex justify-between gap-3 border-b border-(--c-line) py-2.5">
              <dt className="text-(--c-muted)">তারিখ</dt>
              <dd className="text-(--c-ink-strong)">
                <DateText iso={record.interview.at} />
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-(--c-line) py-2.5">
              <dt className="text-(--c-muted)">নম্বর</dt>
              <dd className="font-semibold text-(--c-ink-strong)">
                <Num value={record.interview.score} /> / <Num value={100} />
              </dd>
            </div>
          </dl>
          <p className={cn(head, "mt-5")}>প্যানেল</p>
          <ul className="mt-2 space-y-1 text-sm text-(--c-ink)">
            {record.interview.panel.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <section className="flex-1 bg-(--c-bg) p-6 md:p-8">
          <h2 className={head}>মান নিয়ে অভিযোগ</h2>
          <p className="mt-4 mb-5 text-sm leading-relaxed text-(--c-ink)">ক্লাস না নেওয়া, খারাপ শেখানো, টাকা বা আচরণ — যা-ই হোক, জানান। নাম গোপন থাকে।</p>
          <ComplaintBox teacher={person.handle} teacherName={person.nameBn} />
        </section>
      </aside>
    </div>
  );
}
