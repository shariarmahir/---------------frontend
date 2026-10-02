"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpenCheck, CalendarClock, Crown, FilePenLine, GraduationCap, KeyRound, Plus, Swords, Users } from "lucide-react";
import { toast } from "sonner";
import { AccountAvatar } from "@/components/auth/account-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark, SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { Textarea } from "@/components/ui/textarea";
import { ROLES } from "@/data/auth";
import { DEMO_NOW } from "@/data/media/clock";
import { sampleByCode, sampleClassrooms } from "@/data/media/classroom";
import { useAuth } from "@/lib/auth/client";
import { LEVELS, nextExam, syllabusProgress, validJoinCode, type ClassLevel, type Classroom } from "@/lib/media/classroom";
import { useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { createClassroom, joinClassroom, useMe } from "./use-classroom";

const FEATURES = [
  { Icon: CalendarClock, title: "রুটিন ও কাউন্টডাউন", body: "ক্লাস আর পরীক্ষার রুটিন, কাছের পরীক্ষার সতর্কতা" },
  { Icon: BookOpenCheck, title: "সিলেবাস মিটার", body: "কতটা শেষ হলো, এক নজরে" },
  { Icon: Swords, title: "ক্লাস চ্যালেঞ্জ", body: "পুরো ক্লাস মিলে সমস্যা সমাধান" },
  { Icon: FilePenLine, title: "নিজের প্রশ্নপত্র", body: "প্রশ্ন বানান, নিজেই যাচাই করুন" },
];

export function ClassroomHub() {
  const { account } = useAuth();
  const mineMap = useMediaState((s) => s.classrooms);
  const mine = useMemo(() => Object.values(mineMap), [mineMap]);
  const samples = sampleClassrooms.filter((c) => !mineMap[c.id]);
  const [creating, setCreating] = useState(false);
  const role = ROLES.find((r) => r.id === account?.role);
  const classmates = mine.reduce((n, c) => n + c.members.length, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero — the home page's ink band: claim left, colour fields right, proof strip below. */}
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12">
        <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:items-center">
          <div className="space-y-5">
            <PixelMark tone="dark" />
            <p className="inline-flex items-center gap-2 rounded-full bg-signal-orange px-3 py-1 text-xs font-bold text-text-primary">
              <GraduationCap className="size-4" aria-hidden /> ক্লাসরুম · স্কুল থেকে চাকরির প্রস্তুতি
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.1]">
              পুরো ক্লাস, <span className="text-signal-orange">এক জায়গায়।</span>
            </h1>
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-white/80">
              সিআর বা ক্যাপ্টেন ব্যাচ বানান, সহপাঠীদের নাম যোগ করেন — তারপর রুটিন, সিলেবাস, নোট, পরীক্ষার কাউন্টডাউন আর ক্লাস চ্যালেঞ্জ সবার জন্য খোলা।
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setCreating(true)} className={mediaButton({ variant: "primary", size: "lg" })}>
                <Crown aria-hidden /> সিআর হয়ে ক্লাস বানান
              </button>
              <a href="#join" className={mediaButton({ variant: "outline", size: "lg" })}>
                <KeyRound aria-hidden /> কোড দিয়ে যোগ দিন
              </a>
            </div>
            {account && (
              <p className="flex items-center gap-3 text-sm text-white/75">
                <AccountAvatar name={account.name} photo={account.photo} sizes="36px" className="size-9 text-sm ring-2 ring-signal-orange" />
                <span>
                  <span className="font-semibold text-white">{account.name}</span>
                  {role && <> · {role.bn}</>}
                  <span className="block text-xs text-white/60">আলাদা প্রোফাইল লাগে না — কাণ্ডারী প্রোফাইল দিয়েই চলে।</span>
                </span>
              </p>
            )}
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ Icon, title, body }, i) => {
              const s = surfaceAt(i);
              return (
                <li key={title} style={glowStyle(s.glow)} className={cn("rounded-2xl p-4", s.card, LIFT)}>
                  <span className={cn("mb-3 flex size-10 items-center justify-center rounded-xl", s.tile)}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-80">{body}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative">
          <SignalSeam className="top-0" />
          <dl className="grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x">
            {[
              { label: "আমার ক্লাস", value: mine.length },
              { label: "সহপাঠী", value: classmates },
              { label: "নমুনা ক্লাস", value: sampleClassrooms.length },
              { label: "স্তর", value: Object.keys(LEVELS).length },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 py-4">
                <dt className="text-xs text-white/65">{s.label}</dt>
                <dd className="text-2xl font-bold text-signal-orange"><Num value={s.value} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <JoinByCode />

      {mine.length > 0 && (
        <section aria-labelledby="mine-title">
          <h2 id="mine-title" className="mb-4 text-xl font-bold text-white">আমার ক্লাসরুম</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mine.map((c, i) => <ClassCard key={c.id} room={c} i={i} />)}
          </div>
        </section>
      )}

      {samples.length > 0 && (
        <section aria-labelledby="sample-title">
          <h2 id="sample-title" className="text-xl font-bold text-white">নমুনা ক্লাস</h2>
          <p className="mt-1 mb-4 text-sm text-white/70">ঘুরে দেখুন বা কোড দিয়ে যোগ দিন — এগুলো ডেমো, আসল প্রতিষ্ঠানের নয়।</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {samples.map((c, i) => <ClassCard key={c.id} room={c} i={i + mine.length} sample />)}
          </div>
        </section>
      )}

      <CreateDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}

function ClassCard({ room, i, sample }: { room: Classroom; i: number; sample?: boolean }) {
  const s = surfaceAt(i);
  const progress = syllabusProgress(room.topics);
  const next = nextExam(room.exams, DEMO_NOW);
  return (
    <Link href={`/media/classroom/${room.id}`} style={glowStyle(s.glow)} className={cn("story-reveal flex flex-col gap-4 rounded-2xl p-5", s.card, LIFT)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", s.tile)}>{LEVELS[room.level].bn}</span>
        {sample && <span className="font-mono text-xs font-bold tracking-widest opacity-80">{room.code}</span>}
      </div>
      <div>
        <p className="text-lg leading-snug font-bold text-balance">{room.name}</p>
        <p className="mt-1 text-sm opacity-80">{room.institution}</p>
      </div>
      <div className="mt-auto space-y-2 text-sm">
        <div className="flex items-center justify-between font-semibold">
          <span>সিলেবাস</span>
          <span><Num value={progress} />%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-current/20">
          <div className="h-full rounded-full bg-current transition-[width] duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between pt-1 text-xs font-semibold opacity-85">
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /><Num value={room.members.length} /> জন</span>
          {next ? <span><Num value={next.days} /> দিন পর পরীক্ষা</span> : <span>পরীক্ষা নেই</span>}
        </div>
      </div>
    </Link>
  );
}

function JoinByCode() {
  const me = useMe();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  function join(e: React.FormEvent) {
    e.preventDefault();
    const valid = validJoinCode(code);
    const room = valid ? sampleByCode(valid) : undefined;
    if (!valid) return setError("কোড ৬ অক্ষরের — অক্ষর বা সংখ্যা।");
    if (!room || !me) return setError("এই কোডের কোনো ক্লাস পাওয়া যায়নি। সিআর-এর কাছ থেকে কোডটি আবার নিন।");
    joinClassroom(room.id, me);
    toast.success("ক্লাসে যোগ দিলেন", { description: room.name });
    router.push(`/media/classroom/${room.id}`);
  }
  return (
    <form id="join" onSubmit={join} className="scroll-mt-24 rounded-2xl bg-bd-green p-5 text-white sm:flex sm:items-center sm:gap-6 sm:p-6">
      <div className="mb-4 sm:mb-0">
        <p className="flex items-center gap-2 text-lg font-bold"><KeyRound className="size-5 text-signal-orange" aria-hidden /> ক্লাস কোড দিয়ে যোগ দিন</p>
        <p className="mt-1 text-sm text-white/80">সিআর বা ক্যাপ্টেন কোড শেয়ার করবেন। নমুনা: SSC27N, CSE22B, BCSPRE</p>
      </div>
      <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
        <label className="min-w-0 flex-1 sm:max-w-56">
          <span className="sr-only">ক্লাস কোড</span>
          <Input value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} maxLength={8} placeholder="যেমন SSC27N" className="font-mono tracking-widest uppercase" aria-invalid={Boolean(error)} />
        </label>
        <button type="submit" className={mediaButton({ variant: "primary" })}>যোগ দিন</button>
        {error && <p role="alert" className="live-in w-full text-sm font-semibold text-signal-orange sm:text-right">{error}</p>}
      </div>
    </form>
  );
}

function CreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const me = useMe();
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<ClassLevel>("school");
  const [institution, setInstitution] = useState("");
  const [students, setStudents] = useState("");
  const [teacher, setTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [tried, setTried] = useState(false);
  const nameOk = name.trim().length >= 3;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!nameOk || !me) return;
    const id = createClassroom(
      {
        name: name.trim(),
        level,
        institution: institution.trim() || LEVELS[level].bn,
        students: students.split("\n").map((s) => s.trim()).filter(Boolean),
        teacher: teacher.trim() ? { name: teacher.trim(), subject: subject.trim() || "তত্ত্বাবধান" } : undefined,
      },
      me,
    );
    onOpenChange(false);
    toast.success("ক্লাসরুম তৈরি হলো", { description: "আপনি এই ক্লাসের সিআর। কোড শেয়ার করে সবাইকে ডাকুন।" });
    router.push(`/media/classroom/${id}`);
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-lg">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-white">সিআর হয়ে ক্লাস বানান</DialogTitle>
          <DialogDescription>আপনি হবেন ক্লাস লিডার। ব্যাচের নাম দিন, সহপাঠীদের নাম যোগ করুন — পরে কোড দিয়েও সবাই আসতে পারবে।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-5">
          <fieldset>
            <legend className={label}>স্তর</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LEVELS) as ClassLevel[]).map((k) => (
                <label key={k} className={choiceClass(level === k)}>
                  <input type="radio" name="level" className="sr-only" checked={level === k} onChange={() => setLevel(k)} />
                  {LEVELS[k].bn}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-white/65">{LEVELS[level].hint}</p>
          </fieldset>
          <label className="block">
            <span className={label}>ব্যাচ বা ক্লাসের নাম</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: নবম শ্রেণি ক শাখা" aria-invalid={tried && !nameOk} />
            {tried && !nameOk && <span className="mt-1 block text-xs font-semibold text-crimson-bright">অন্তত ৩ অক্ষরের একটি নাম দিন।</span>}
          </label>
          <label className="block">
            <span className={label}>প্রতিষ্ঠান বা বিবরণ</span>
            <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="স্কুল, কলেজ, বিশ্ববিদ্যালয় বা অনলাইন" />
          </label>
          <label className="block">
            <span className={label}>সহপাঠীদের নাম (প্রতি লাইনে একজন)</span>
            <Textarea rows={4} value={students} onChange={(e) => setStudents(e.target.value)} placeholder={"রাহাত\nমীম\nসোহেল"} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>শিক্ষক (ঐচ্ছিক)</span>
              <Input value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="তত্ত্বাবধানের জন্য" />
            </label>
            <label className="block">
              <span className={label}>বিষয়</span>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="যেমন: গণিত" />
            </label>
          </div>
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            <Plus aria-hidden /> ক্লাসরুম তৈরি করুন
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
