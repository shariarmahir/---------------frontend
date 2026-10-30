"use client";

import { useState } from "react";
import { ArrowUpRight, FileText, Hammer, PlayCircle, UserRound, type LucideIcon } from "lucide-react";
import { classVideos, coursesOf, getCourse, teacherFollowers, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { MATERIAL_KINDS, durationText, type Department, watchHref } from "@/lib/media/academy";
import { Compact, DateText, useFormat } from "../../ui/numerals";
import { AssetCard, AssetGrid } from "../catalogue/asset-card";
import { TabStrip } from "../catalogue/tab-strip";

type Kind = "free" | "materials" | "teachers" | "finals";
type Card = { key: string; href: string; title: string; body: string; meta: React.ReactNode };

const KIND: Record<Kind, { label: string; icon: LucideIcon; action: string }> = {
  free: { label: "বিনামূল্যের ক্লাস", icon: PlayCircle, action: "ক্লাস দেখুন" },
  materials: { label: "উপকরণ", icon: FileText, action: "কোর্সে যান" },
  teachers: { label: "শিক্ষক", icon: UserRound, action: "চ্যানেল দেখুন" },
  finals: { label: "ফাইনাল প্রকল্প", icon: Hammer, action: "কোর্সে যান" },
};
/** Six cards a tab: two full rows on a laptop. */
const SHOW = 6;

/** "শেখার রিসোর্স": the free classes, the materials, the teachers and the final projects, a tab each. */
export function DeptResources({ dept }: { dept: Department }) {
  const { num } = useFormat();
  const list = coursesOf(dept.id);
  const tabs = (
    [
      {
        id: "free",
        cards: classVideos
          .filter((v) => v.access === "free" && !v.short && list.some((c) => c.id === v.course))
          .sort((a, b) => b.at.localeCompare(a.at))
          .map((v) => ({
            key: v.id,
            href: watchHref(v),
            title: v.title,
            body: `“${getCourse(v.course)?.title}” কোর্সের সপ্তাহ ${num(v.week)}-এর পুরো ক্লাস — ভর্তি ছাড়াই দেখা যায়।`,
            meta: (
              <>
                <DateText iso={v.at} /> · {num(durationText(v.seconds))} · <Compact n={v.views} /> বার দেখা
              </>
            ),
          })),
      },
      {
        id: "materials",
        cards: list.flatMap((c) =>
          c.materials.map((m) => ({
            key: `${c.id}-${m.title}`,
            href: `/media/academy/course/${c.id}`,
            title: m.title,
            body: `“${c.title}” কোর্সের ${MATERIAL_KINDS[m.kind]} — ভর্তি হলে কোর্সের পাতা থেকে নামানো যায়।`,
            meta: (
              <>
                {MATERIAL_KINDS[m.kind]} · {m.size}
              </>
            ),
          })),
        ),
      },
      {
        id: "teachers",
        cards: dept.teachers.map((h) => {
          const p = personOrThrow(h);
          return {
            key: h,
            href: `/media/academy/teachers/${h}`,
            title: p.nameBn,
            body: `${teacherRecord(h)?.title ?? p.headline}। ${p.bio}`,
            meta: (
              <>
                <Compact n={teacherFollowers(h)} /> অনুসারী
              </>
            ),
          };
        }),
      },
      {
        id: "finals",
        cards: list.map((c) => ({ key: c.id, href: `/media/academy/course/${c.id}`, title: c.title, body: c.final, meta: <>{c.id} · প্যানেলের সামনে প্রকাশ্যে</> })),
      },
    ] satisfies { id: Kind; cards: Card[] }[]
  ).filter((t) => t.cards.length);
  const [tab, setTab] = useState<Kind>(tabs[0]?.id ?? "free");
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];
  if (!active) return null;
  const kind = KIND[active.id];
  const shown = active.cards.slice(0, SHOW);

  return (
    <>
      <TabStrip label="রিসোর্স" idBase={`res-${dept.id}`} value={active.id} onChange={setTab} tabs={tabs.map((t) => ({ id: t.id, label: KIND[t.id].label, count: t.cards.length }))} />
      <div id={`res-${dept.id}-panel`} role="tabpanel" aria-labelledby={`res-${dept.id}-${active.id}`}>
        <AssetGrid count={shown.length}>
          {shown.map((c, i) => (
            <li key={c.key} className="bg-(--c-bg)">
              <AssetCard
                kind={{ icon: kind.icon, label: kind.label }}
                n={i + 1}
                title={c.title}
                text={<p className="line-clamp-4">{c.body}</p>}
                extra={<p className="hud mt-3 text-(--c-faint)">{c.meta}</p>}
                action={{ href: c.href, label: kind.action, icon: ArrowUpRight }}
              />
            </li>
          ))}
        </AssetGrid>
      </div>
    </>
  );
}
