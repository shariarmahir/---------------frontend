"use client";

import { useState } from "react";
import { Crown, HandHeart, Medal, Plus, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { SolarSystem, type OrbitConfig } from "@/components/ui/solar-system";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { DEMO_NOW } from "@/data/media/clock";
import { WEAK_BELOW, needsHelp, nextExam, rank, recoveryPairs, syllabusProgress, type Classroom } from "@/lib/media/classroom";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Panel } from "../ui/layout";
import { Num } from "../ui/numerals";
import type { ClassTab } from "./room";
import { bump, editClassroom, nameOf } from "./use-classroom";

const initial = (name: string) => name.trim().charAt(0);

export const RankingTab: ClassTab = ({ room, me, member, leader }) => {
  const ranked = rank(room.members);
  const pairs = recoveryPairs(room.members);
  const top = ranked.slice(0, 3);

  return (
    <div className="space-y-4">
      <ol className="grid gap-3 sm:grid-cols-3">
        {top.map((m, i) => {
          const s = surfaceAt([1, 0, 2][i]);
          return (
            <li key={m.id} style={glowStyle(s.glow)} className={cn("story-reveal flex items-center gap-4 rounded-2xl p-5", s.card, LIFT, i === 0 && "sm:order-2 sm:-mt-3", i === 1 && "sm:order-1", i === 2 && "sm:order-3")}>
              <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold", s.tile)}>{initial(m.name)}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-bold opacity-80">
                  {i === 0 ? <Crown className="size-3.5" aria-hidden /> : <Medal className="size-3.5" aria-hidden />} <Num value={i + 1} /> নম্বর
                </span>
                <span className="block truncate text-lg font-bold">{m.name}</span>
                <span className="text-sm font-semibold opacity-85"><Num value={m.points} /> পয়েন্ট</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="পুরো ক্লাসের র‍্যাংকিং">
          <p className="mb-4 text-xs text-white/60">নোট শেয়ার ৫, সমাধান ১০, সাহায্য ৮ পয়েন্ট; মূল্যায়নের গড় থেকে সর্বোচ্চ ১০ — নম্বরের চেয়ে অবদান বড়।</p>
          <ol className="space-y-2">
            {ranked.map((m, i) => (
              <li key={m.id} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5", m.id === me?.id ? "bg-signal-orange/15 ring-1 ring-signal-orange/50" : "bg-black/30")}>
                <span className="w-6 text-center text-sm font-bold text-white/60"><Num value={i + 1} /></span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bd-green font-bold text-white">{initial(m.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate font-semibold text-white">
                    {m.name}
                    {m.id === room.leaderId && <Crown className="size-3.5 shrink-0 text-signal-orange" aria-label="সিআর" />}
                  </span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-signal-orange transition-[width] duration-700" style={{ width: `${(m.points / Math.max(1, ranked[0].points)) * 100}%` }} />
                  </span>
                </span>
                <span className="w-14 text-right text-sm font-bold text-signal-orange"><Num value={m.points} /></span>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-4">
          <Recovery room={room} pairs={pairs} me={me} member={member} />
          <TeacherDesk room={room} leader={leader} />
        </div>
      </div>

      <ClassGalaxy room={room} />
      {leader && <AddStudent roomId={room.id} />}
    </div>
  );
};

function Recovery({ room, pairs, me, member }: { room: Classroom; pairs: { weak: string; buddy: string }[]; me: { id: string } | null; member: boolean }) {
  const myBuddy = pairs.find((p) => p.weak === me?.id);
  return (
    <section className="story-reveal rounded-2xl bg-bd-green p-5 text-white">
      <h2 className="flex items-center gap-2 font-bold"><HandHeart className="size-5 text-signal-orange" aria-hidden /> পিছিয়ে পড়া বন্ধুর পাশে</h2>
      <p className="mt-1 text-xs text-white/80">মূল্যায়নের গড় <Num value={WEAK_BELOW} />%-এর নিচে হলে ক্লাসের সবচেয়ে বেশি সাহায্যকারী একজন বাডি হন।</p>
      {myBuddy && <p className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">আপনার বাডি: {nameOf(room, myBuddy.buddy)}</p>}
      <ul className="mt-3 space-y-2">
        {pairs.map((p) => (
          <li key={p.weak} className="flex items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{nameOf(room, p.weak)}</span>
              <span className="text-xs text-white/75">বাডি: {nameOf(room, p.buddy)}</span>
            </span>
            {member && me && me.id !== p.weak && (
              <button
                type="button"
                onClick={() => {
                  editClassroom(room.id, (r) => bump(r, me.id, "helped"));
                  toast.success(`${nameOf(room, p.weak)}-কে সাহায্য করছেন`, { description: "+৮ পয়েন্ট — বার্তায় যোগাযোগ করুন।" });
                }}
                className={mediaButton({ variant: "primary", size: "sm" })}
              >
                সাহায্য করব
              </button>
            )}
          </li>
        ))}
        {pairs.length === 0 && <li className="text-sm text-white/80">এখন কেউ পিছিয়ে নেই।</li>}
      </ul>
    </section>
  );
}

function TeacherDesk({ room, leader }: { room: Classroom; leader: boolean }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const assessed = room.members.filter((m) => m.stats.assess > 0);
  const avg = Math.round(assessed.reduce((n, m) => n + m.stats.assess, 0) / Math.max(1, assessed.length));
  const weak = room.members.filter((m) => needsHelp(m.stats)).length;
  const next = nextExam(room.exams, DEMO_NOW);

  return (
    <Panel title={<span className="flex items-center gap-2"><UserRoundCheck className="size-4.5" aria-hidden /> শিক্ষকের নজরে</span>}>
      {room.teacher ? (
        <>
          <p className="mb-3 text-sm text-white/80">{room.teacher.name} · {room.teacher.subject}</p>
          <dl className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: "ক্লাসের গড়", value: <><Num value={avg} />%</> },
              { label: "সিলেবাস", value: <><Num value={syllabusProgress(room.topics)} />%</> },
              { label: "সাহায্য দরকার", value: <><Num value={weak} /> জন</> },
              { label: "পরের পরীক্ষা", value: next ? <><Num value={next.days} /> দিন</> : "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-black/40 px-2 py-3 ring-1 ring-white/10">
                <dt className="text-[11px] text-white/60">{s.label}</dt>
                <dd className="text-lg font-bold text-signal-orange">{s.value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : leader ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            editClassroom(room.id, (r) => ({ ...r, teacher: { name: name.trim(), subject: subject.trim() || "তত্ত্বাবধান" } }));
          }}
        >
          <p className="text-sm text-white/75">একজন শিক্ষক যোগ করলে তিনি ক্লাসের গড়, সিলেবাস আর কে পিছিয়ে — এক নজরে দেখবেন।</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="শিক্ষকের নাম" aria-label="শিক্ষকের নাম" />
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয়" aria-label="বিষয়" />
          <button type="submit" className={mediaButton({ variant: "primary", className: "w-full" })}>শিক্ষক যোগ করুন</button>
        </form>
      ) : (
        <p className="text-sm text-white/70">এই ক্লাসে এখনো কোনো শিক্ষক যুক্ত নেই।</p>
      )}
    </Panel>
  );
}

/** The class as a galaxy: the CR at the centre, the top third on the gold ring. */
function ClassGalaxy({ room }: { room: Classroom }) {
  const others = rank(room.members.filter((m) => m.id !== room.leaderId));
  const third = Math.ceil(others.length / 3);
  const rings: { radius: OrbitConfig["radius"]; color: string; speed: number }[] = [
    { radius: "inner", color: "var(--color-signal-orange)", speed: 30 },
    { radius: "mid", color: "var(--color-bdorange-600)", speed: 46 },
    { radius: "outer", color: "var(--color-bdgreen-500)", speed: 64 },
  ];
  const orbits: OrbitConfig[] = rings.map((r, i) => ({
    id: r.radius,
    name: r.radius,
    radius: r.radius,
    speed: r.speed,
    color: r.color,
    items: others.slice(i * third, (i + 1) * third).map((m) => ({
      id: m.id,
      label: m.name,
      sublabel: `${m.points} পয়েন্ট`,
      color: r.color,
      avatar: <span className="flex size-8 items-center justify-center rounded-full bg-text-primary text-xs font-bold text-white ring-2 ring-current lg:size-9">{initial(m.name)}</span>,
    })),
  }));

  return (
    <section className="story-reveal overflow-hidden rounded-3xl bg-black ring-1 ring-white/12">
      <h2 className="px-5 pt-5 text-lg font-bold text-white sm:px-8 sm:pt-7">ক্লাসের গ্যালাক্সি</h2>
      <p className="px-5 text-sm text-white/65 sm:px-8">মাঝে সিআর, সোনালি কক্ষপথে সবচেয়ে সক্রিয়রা। নাম দেখতে কোনো গ্রহের ওপর রাখুন।</p>
      <SolarSystem
        className="mx-auto"
        orbits={orbits}
        core={
          <span className="flex flex-col items-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-signal-orange text-2xl font-bold text-text-primary shadow-[0_0_40px_-6px_var(--color-signal-orange)]">{initial(nameOf(room, room.leaderId))}</span>
            <span className="mt-2 rounded-full bg-text-primary px-2.5 py-0.5 text-xs font-bold text-signal-orange ring-1 ring-white/15">সিআর</span>
          </span>
        }
      />
    </section>
  );
}

function AddStudent({ roomId }: { roomId: string }) {
  const [name, setName] = useState("");
  return (
    <form
      className="flex flex-wrap gap-2 rounded-2xl bg-text-primary p-4 ring-1 ring-white/12"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim().length < 2) return;
        editClassroom(roomId, (r) => ({ ...r, members: [...r.members, { id: `${roomId}-s${r.members.length}-${Date.now().toString(36)}`, name: name.trim(), stats: { notes: 0, solved: 0, helped: 0, assess: 0 } }] }));
        setName("");
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">শিক্ষার্থীর নাম</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="নতুন শিক্ষার্থীর নাম" />
      </label>
      <button type="submit" className={mediaButton({ variant: "primary" })}><Plus aria-hidden /> শিক্ষার্থী যোগ</button>
    </form>
  );
}
