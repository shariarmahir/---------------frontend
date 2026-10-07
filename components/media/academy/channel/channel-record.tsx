"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Person } from "@/data/media/types";
import type { TeacherRecord } from "@/lib/media/academy";
import { skillStatus } from "@/lib/media/skill";
import { mediaButton } from "../../ui/button-styles";
import { Panel } from "../../ui/layout";
import { DateText, Num } from "../../ui/numerals";
import { StatusBadge } from "../../ui/trust";
import { ComplaintBox } from "../complaint-box";
import { TierBadge, standingOf } from "../parts";

/**
 * The record behind the channel: how the points add up, the panel that
 * passed them, the skills the community verified, and where to complain.
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        <section aria-labelledby="points" className="rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-6 shadow-m-tile">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="points" className="text-lg font-bold text-m-ink">পয়েন্টের হিসাব</h2>
              <p className="mt-1 text-sm text-m-ink/70">
                র‍্যাংক ঠিক হয় এই পয়েন্টে — টাকা দিয়ে কেউ উপরে উঠতে পারেন না। গড় রেটিং <Num value={record.rating.avg} decimals={1} />, <Num value={record.rating.count} />টি রেটিং থেকে।
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TierBadge tier={tier} />
              <p className="text-right">
                <span className="block text-5xl leading-none font-bold text-m-ink tabular-nums">
                  <Num value={points.total} />
                </span>
                <span className="text-xs text-m-ink/65">১০০-র মধ্যে</span>
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {parts.map((p, i) => (
              <li key={p.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-m-ink/85">{p.label}</span>
                  <span className="font-semibold text-m-ink tabular-nums">
                    <Num value={p.value} /> / <Num value={p.max} />
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-m-ink/6">
                  <motion.span
                    className="block h-full rounded-full bg-m-yellow"
                    initial={reduce ? false : { width: 0 }}
                    whileInView={{ width: `${(p.value / p.max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </li>
            ))}
            {points.penalty > 0 && (
              <li className="flex justify-between border-t border-m-ink/9 pt-3 text-sm">
                <span className="text-m-ink/85">
                  প্রমাণিত অভিযোগ (<Num value={record.complaints.upheld} />টি)
                </span>
                <span className="font-semibold text-m-ink tabular-nums">
                  −<Num value={points.penalty} />
                </span>
              </li>
            )}
          </ul>
        </section>

        <Panel title="কমিউনিটি যাচাই করা দক্ষতা">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {person.skills.map((s) => (
              <li key={s.skill} className="flex items-center justify-between gap-2 rounded-xl bg-white/65 px-3 py-2.5 text-sm">
                <span className="text-m-ink/90">{s.skill}</span>
                <StatusBadge status={skillStatus(s.self, s.communityAvg, s.raters)} size="sm" />
              </li>
            ))}
          </ul>
          <Link href={`/media/u/${person.handle}`} className={mediaButton({ variant: "quiet", size: "sm", className: "mt-4" })}>
            পুরো প্রোফাইল ও কাজ <ArrowUpRight aria-hidden />
          </Link>
        </Panel>
      </div>

      <aside className="space-y-5">
        <Panel title="ইন্টারভিউর রেকর্ড">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-m-ink/75">তারিখ</dt>
              <dd className="text-m-ink">
                <DateText iso={record.interview.at} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-m-ink/75">নম্বর</dt>
              <dd className="font-semibold text-m-ink">
                <Num value={record.interview.score} /> / ১০০
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-semibold text-m-ink/75">প্যানেল</p>
          <ul className="mt-1 space-y-1 text-sm text-m-ink/85">
            {record.interview.panel.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Panel>

        <Panel title="মান নিয়ে অভিযোগ">
          <p className="mb-3 text-sm leading-relaxed text-m-ink/80">ক্লাস না নেওয়া, খারাপ শেখানো, টাকা বা আচরণ — যা-ই হোক, জানান। নাম গোপন থাকে।</p>
          <ComplaintBox teacher={person.handle} teacherName={person.nameBn} />
        </Panel>
      </aside>
    </div>
  );
}
