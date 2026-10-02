"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpenCheck, CalendarClock, Crown, FilePenLine, FlaskConical, KeyRound, Plus, Swords, Timer, Users } from "lucide-react";
import { toast } from "sonner";
import { AccountAvatar } from "@/components/auth/account-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { Textarea } from "@/components/ui/textarea";
import { ROLES } from "@/data/auth";
import { DEMO_NOW } from "@/data/media/clock";
import { sampleByCode, sampleClassrooms } from "@/data/media/classroom";
import { sampleLab, sampleLabByCode, sampleLabs } from "@/data/media/labs";
import { useAuth } from "@/lib/auth/client";
import { LEVELS, nextExam, syllabusProgress, validJoinCode, type ClassLevel, type Classroom } from "@/lib/media/classroom";
import { countdown, dueAt, nextLab, type LabRoom } from "@/lib/media/lab";
import { useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { createClassroom, joinClassroom, useMe } from "./use-classroom";
import { createLab, joinLab } from "./use-lab";

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
  const [creatingLab, setCreatingLab] = useState(false);
  const labMap = useMediaState((s) => s.labs);
  const myLabs = useMemo(() => Object.values(labMap), [labMap]);
  const labSamples = sampleLabs.filter((l) => !labMap[l.id]);
  const role = ROLES.find((r) => r.id === account?.role);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero — the home page's ink band: claim left, colour fields right, proof strip below. */}
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12">
        <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:items-center">
          <div className="space-y-5">
            <PixelMark tone="dark" />
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
              <button type="button" onClick={() => setCreatingLab(true)} className={mediaButton({ variant: "outline", size: "lg" })}>
                <FlaskConical aria-hidden /> ল্যাব রুম বানান
              </button>
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

      {(myLabs.length > 0 || labSamples.length > 0) && (
        <section aria-labelledby="lab-title">
          <h2 id="lab-title" className="flex items-center gap-2 text-xl font-bold text-white"><FlaskConical className="size-5 text-signal-orange" aria-hidden /> ল্যাব রুম</h2>
          <p className="mt-1 mb-4 text-sm text-white/70">এক্সপেরিমেন্টের টপিক, টাস্ক শিট, প্রশ্ন, রিপোর্ট জমার শেষ সময় আর ল্যাব পরীক্ষা — এক জায়গায়।</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myLabs.map((l) => <LabCard key={l.id} lab={l} />)}
            {labSamples.map((l) => <LabCard key={l.id} lab={l} sample />)}
            <button type="button" onClick={() => setCreatingLab(true)} className="story-reveal flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 p-5 text-white/75 transition-colors hover:border-signal-orange hover:text-signal-orange">
              <Plus className="size-6" aria-hidden />
              <span className="font-bold">নতুন ল্যাব রুম</span>
              <span className="text-xs">আপনি হবেন ল্যাব লিডার</span>
            </button>
          </div>
        </section>
      )}

      <CreateDialog open={creating} onOpenChange={setCreating} />
      <CreateLabDialog open={creatingLab} onOpenChange={setCreatingLab} />
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
    const lab = sampleLabByCode(valid);
    if (lab && me) {
      joinLab(lab.id, me);
      toast.success("ল্যাবে যোগ দিলেন", { description: lab.name });
      return router.push(`/media/classroom/lab/${lab.id}`);
    }
    if (!room || !me) return setError("এই কোডের কোনো ক্লাস বা ল্যাব পাওয়া যায়নি। সিআর-এর কাছ থেকে কোডটি আবার নিন।");
    joinClassroom(room.id, me);
    toast.success("ক্লাসে যোগ দিলেন", { description: room.name });
    router.push(`/media/classroom/${room.id}`);
  }
  return (
    <form id="join" onSubmit={join} className="scroll-mt-24 rounded-2xl bg-bd-green p-5 text-white sm:flex sm:items-center sm:gap-6 sm:p-6">
      <div className="mb-4 sm:mb-0">
        <p className="flex items-center gap-2 text-lg font-bold"><KeyRound className="size-5 text-signal-orange" aria-hidden /> ক্লাস বা ল্যাবের কোড দিয়ে যোগ দিন</p>
        <p className="mt-1 text-sm text-white/80">সিআর বা ক্যাপ্টেন কোড শেয়ার করবেন। নমুনা: SSC27N, CSE22B, BCSPRE, ল্যাব EEE2LB</p>
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

function LabCard({ lab, sample }: { lab: LabRoom; sample?: boolean }) {
  const now = sampleLab(lab.id) ? DEMO_NOW : new Date();
  const next = nextLab(lab.experiments, now);
  const due = lab.experiments
    .map((e) => ({ e, hours: (dueAt(e.due) - now.getTime()) / 3_600_000 }))
    .filter((x) => x.hours >= 0)
    .sort((a, b) => a.hours - b.hours)[0];
  const left = due ? countdown(due.hours) : null;
  return (
    <Link href={`/media/classroom/lab/${lab.id}`} className={cn("story-reveal flex flex-col gap-4 rounded-2xl bg-text-primary p-5 text-white ring-1 ring-white/12", LIFT)}>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-orange px-2.5 py-0.5 text-xs font-bold text-text-primary"><FlaskConical className="size-3.5" aria-hidden /> ল্যাব</span>
        {sample && <span className="font-mono text-xs font-bold tracking-widest opacity-80">{lab.code}</span>}
      </div>
      <div>
        <p className="text-sm font-semibold text-signal-orange">{lab.course}</p>
        <p className="mt-0.5 text-lg leading-snug font-bold text-balance">{lab.name}</p>
      </div>
      <div className="mt-auto space-y-1.5 text-xs text-white/80">
        <p className="flex items-center gap-1.5"><CalendarClock className="size-3.5 text-signal-orange" aria-hidden />{next ? <>পরের ল্যাব: {next.exp.title} · {next.days === 0 ? "আজ" : <><Num value={next.days} /> দিন পর</>}</> : "পরের ল্যাবের তারিখ নেই"}</p>
        <p className="flex items-center gap-1.5"><Timer className="size-3.5 text-signal-orange" aria-hidden />{due && left ? <>রিপোর্ট <Num value={due.e.no} /> জমা: {left.days > 0 && <><Num value={left.days} /> দিন </>}<Num value={left.hours} /> ঘণ্টা বাকি</> : "কোনো রিপোর্ট বাকি নেই"}</p>
        <p className="flex items-center gap-1.5"><Users className="size-3.5 text-signal-orange" aria-hidden /><Num value={lab.members.length} /> জন · <Num value={lab.experiments.length} />টি এক্সপেরিমেন্ট</p>
      </div>
    </Link>
  );
}

function CreateLabDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const me = useMe();
  const router = useRouter();
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [instructor, setInstructor] = useState("");
  const [students, setStudents] = useState("");
  const [tried, setTried] = useState(false);
  const nameOk = name.trim().length >= 3;
  const courseOk = course.trim().length >= 3;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!nameOk || !courseOk || !me) return;
    const id = createLab(
      {
        name: name.trim(),
        course: course.trim(),
        institution: institution.trim() || "ল্যাব",
        instructor: instructor.trim() || undefined,
        students: students.split("\n").map((x) => x.trim()).filter(Boolean),
      },
      me,
    );
    onOpenChange(false);
    toast.success("ল্যাব রুম তৈরি হলো", { description: "এবার প্রথম এক্সপেরিমেন্ট যোগ করুন, তারপর কোড শেয়ার করুন।" });
    router.push(`/media/classroom/lab/${id}`);
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-lg">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-white">ল্যাব রুম বানান</DialogTitle>
          <DialogDescription>আপনি হবেন ল্যাব লিডার। এক্সপেরিমেন্টের টপিক, টাস্ক শিট, প্রশ্ন, রিপোর্ট জমার শেষ সময় আর ল্যাব পরীক্ষা দেবেন — সবাই রিপোর্ট আর কাজের ছবি জমা দেবে।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-5">
          <label className="block">
            <span className={label}>কোর্স *</span>
            <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="যেমন: EEE 102 · সার্কিট ল্যাব, রসায়ন ব্যবহারিক" aria-invalid={tried && !courseOk} />
            {tried && !courseOk && <span className="mt-1 block text-xs font-semibold text-crimson-bright">কোর্সের কোড বা নাম দিন।</span>}
          </label>
          <label className="block">
            <span className={label}>ল্যাব গ্রুপের নাম *</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: গ্রুপ বি, সেকশন খ" aria-invalid={tried && !nameOk} />
            {tried && !nameOk && <span className="mt-1 block text-xs font-semibold text-crimson-bright">অন্তত ৩ অক্ষরের একটি নাম দিন।</span>}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>প্রতিষ্ঠান</span>
              <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="স্কুল, কলেজ, বিশ্ববিদ্যালয়" />
            </label>
            <label className="block">
              <span className={label}>ল্যাব শিক্ষক</span>
              <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="ঐচ্ছিক" />
            </label>
          </div>
          <label className="block">
            <span className={label}>ল্যাব পার্টনারদের নাম (প্রতি লাইনে একজন)</span>
            <Textarea rows={4} value={students} onChange={(e) => setStudents(e.target.value)} placeholder={"ঋতু\nতামিম\nসাদিয়া"} />
          </label>
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            <FlaskConical aria-hidden /> ল্যাব রুম তৈরি করুন
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
