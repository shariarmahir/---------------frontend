"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, CalendarClock, Camera, ChevronDown, CircleHelp, ClipboardCheck, Copy, FileUp, FlaskConical, GraduationCap, ImagePlus, ListChecks, LogIn, Plus, Settings2, Share2, Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Skeleton } from "@/components/ui/skeleton";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_NOW } from "@/data/media/clock";
import { sampleLab } from "@/data/media/labs";
import type { ClassNote, NoteFile } from "@/lib/media/classroom";
import { countdown, daysUntil, dueAt, EXAM_KINDS, handIns, nextDue, nextLab, nextNo, reportState, reportTally, type Experiment, type LabExam, type LabRoom, type ReportState } from "@/lib/media/lab";
import { roleOf } from "@/lib/media/notices";
import { newId, useHydrated } from "@/lib/media/store";
import { isFull, labDuties } from "@/lib/media/teamwork";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Ago, DateText, Num, useFormat } from "../ui/numerals";
import { DutyBoard } from "./duty-board";
import { FilePreview, NoteReader, readerUrl, toNoteFile } from "./note-files";
import { InnovationTab } from "../research/start-research";
import { bdToday } from "../research/use-research";
import { ExamDesk } from "./exam-desk";
import { NoticeBoard } from "./notice-board";
import { ShareDialog, type SharePreset } from "./share-work";
import { SeatMeter, TeamSettingsDialog } from "./team-settings";
import { useMe } from "./use-classroom";
import { addExperiment, editExperiment, editLab, editLabRota, handIn, joinLab, labMemberName, labRota, useLab } from "./use-lab";

/** The sample lab is dated around the demo clock; labs people make run on real time. */
export const labNow = (id: string) => (sampleLab(id) ? DEMO_NOW : new Date());

const STATE: Record<ReportState, { bn: string; cls: string }> = {
  submitted: { bn: "জমা হয়েছে", cls: "bg-m-blue-soft text-m-ink" },
  late: { bn: "দেরিতে জমা", cls: "bg-m-red-soft text-m-ink" },
  missing: { bn: "জমা পড়েনি", cls: "bg-m-red text-m-on" },
  "due-soon": { bn: "শিগগির জমা দিন", cls: "bg-m-yellow text-m-ink" },
  open: { bn: "জমা খোলা", cls: "bg-m-ink/6 text-m-ink/80" },
};

const at = (date: string, time?: string) => `${date}T${time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00"}:00+06:00`;

function Left({ hours }: { hours: number }) {
  const c = countdown(hours);
  return (
    <>
      {c.days > 0 && <><Num value={c.days} /> দিন </>}
      <Num value={c.hours} /> ঘণ্টা বাকি
    </>
  );
}

/** A file picker behind a button; reports may be PDFs, photos are taken with the camera. */
function UploadButton({ label, Icon, accept, scan, onFile, variant = "outline" }: { label: string; Icon: typeof FileUp; accept: string; scan: boolean; onFile: (f: NoteFile) => void; variant?: "primary" | "outline" | "quiet" }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button type="button" disabled={busy} onClick={() => input.current?.click()} className={mediaButton({ variant, size: "sm" })}>
        <Icon aria-hidden /> {busy ? "প্রস্তুত হচ্ছে…" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        capture={accept === "image/*" ? "environment" : undefined}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onFile(await toNoteFile(file, scan && file.type !== "application/pdf"));
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "ফাইলটি নেওয়া গেল না");
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}

const TABS = [
  { key: "lab", label: "ল্যাব ও জমা" },
  { key: "duty", label: "দায়িত্বের পালা" },
  { key: "show", label: "উদ্ভাবন ও গবেষণা" },
] as const;

export function LabRoomView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const me = useMe();
  const { lab, joined } = useLab(id);
  const [reading, setReading] = useState<{ note: ClassNote; url?: string; by: string } | null>(null);
  const [adding, setAdding] = useState<"exp" | "exam" | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("lab");
  const [sharing, setSharing] = useState<SharePreset | null>(null);
  const [settings, setSettings] = useState(false);
  const reduce = useReducedMotion();
  const { num } = useFormat();

  if (!lab) {
    return hydrated ? (
      <EmptyState icon="posts" title="ল্যাব রুম পাওয়া যায়নি" body="লিংকটি পুরোনো, অথবা ল্যাবটি অন্য অ্যাকাউন্টে তৈরি।" action={<Link href="/media/classroom" className={mediaButton()}>ক্লাসরুমে ফিরুন</Link>} />
    ) : (
      <Skeleton className="h-72 rounded-3xl" />
    );
  }
  if (!hydrated) return <Skeleton className="h-[40rem] rounded-3xl" />;

  const now = labNow(lab.id);
  const member = joined && Boolean(me && (lab.members.some((m) => m.id === me.id) || lab.teacherId === me.id));
  const role = roleOf(lab, me?.id, member);
  const teacher = role === "teacher";
  const leader = role === "leader" || teacher;
  const open = async (file: NoteFile, title: string, by: string, atIso: string) => {
    const note: ClassNote = { id: title, kind: "material", title, text: "", file, by, at: atIso };
    setReading({ note, url: await readerUrl(note), by });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-6 print:hidden">
        <Link href="/media/classroom" className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-m-blue">
          <ArrowLeft className="size-4" aria-hidden /> ক্লাসরুম
        </Link>

        <Hero lab={lab} member={member} me={me} leader={leader} teacher={teacher} onSettings={() => setSettings(true)} />
        <NoticeBoard
          notices={lab.notices ?? []}
          role={role}
          meId={me?.id}
          name={(nid) => labMemberName(lab, nid)}
          today={bdToday(now)}
          subjects={["ল্যাব ক্লাস", ...lab.experiments.map((e) => `এক্সপেরিমেন্ট ${num(e.no)}`)]}
          items={lab.experiments.map((e) => `রিপোর্ট ${num(e.no)} — ${e.title}`)}
          onChange={(fn) => editLab(lab.id, (l) => ({ ...l, notices: fn(l.notices ?? []) }))}
        />
        <Status lab={lab} me={me?.id} now={now} />
      </div>

      <nav aria-label="ল্যাবের অংশ" className="sticky top-[var(--sticky-top,4rem)] z-30 -mx-3 bg-white/90 px-3 py-2 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:px-2 print:hidden">
        <ul className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <li key={t.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
                className={cn("relative isolate min-h-10 rounded-xl px-4 text-sm font-bold whitespace-nowrap [-webkit-tap-highlight-color:transparent] transition-[color,scale] duration-200 active:scale-95", tab === t.key ? "text-m-ink" : "text-m-ink/75 hover:text-m-ink")}
              >
                {tab === t.key && (
                  <motion.span layoutId="lab-tab" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }} className="absolute inset-0 -z-10 rounded-xl bg-m-yellow" aria-hidden />
                )}
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "duty" && (
        <div className="live-in">
          <DutyBoard
            team={lab.name}
            members={lab.members}
            rota={labRota(lab)}
            seed={lab.id}
            now={now}
            meId={me?.id}
            member={member}
            leader={leader}
            onChange={(fn) => editLabRota(lab.id, fn)}
            defaults={labDuties(lab.labDay ?? 1)}
          />
        </div>
      )}

      {tab === "show" && (
        <div className="live-in">
          <InnovationTab from={{ kind: "lab", id: lab.id, name: lab.name }} members={lab.members} member={member} shares={lab.shares ?? []} onShare={() => setSharing({ kind: "innovation" })} />
        </div>
      )}

      {tab === "lab" && (
      <div className="live-in space-y-6">
      <section aria-labelledby="exp-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="exp-title" className="text-xl font-bold text-m-ink">এক্সপেরিমেন্ট</h2>
            <p className="text-sm text-m-ink/65">টপিক, কাজ, প্রশ্ন আর জমা — প্রতিটি ল্যাব এক কার্ডে।</p>
          </div>
          {leader && (
            <button type="button" onClick={() => setAdding("exp")} className={mediaButton({ variant: "primary" })}>
              <Plus aria-hidden /> নতুন এক্সপেরিমেন্ট
            </button>
          )}
        </div>
        {lab.experiments.length === 0 ? (
          <EmptyState icon="posts" title="এখনো কোনো এক্সপেরিমেন্ট নেই" body={leader ? "প্রথম ল্যাবের টপিক, তারিখ আর রিপোর্ট জমার শেষ সময় দিন — সবাই কার্ডে দেখবে।" : "ল্যাব লিডার এক্সপেরিমেন্ট যোগ করলে এখানে আসবে।"} />
        ) : (
          <ol className="space-y-3">
            {lab.experiments.map((e) => (
              <ExperimentCard
                key={e.id}
                lab={lab}
                exp={e}
                me={me}
                member={member}
                leader={leader}
                now={now}
                focus={e.id === (nextDue(lab.experiments, me?.id ?? "", now) ?? nextLab(lab.experiments, now))?.exp.id}
                onOpen={open}
                onShare={() => setSharing({ kind: "research", title: `${e.title} — আমাদের ফলাফল`, question: e.topic, team: me ? [me.id] : [] })}
              />
            ))}
          </ol>
        )}
      </section>

      <ExamDesk
        exams={lab.exams}
        kinds={EXAM_KINDS}
        now={now}
        meId={me?.id}
        member={member}
        manager={leader}
        teacher={teacher}
        teacherName={lab.instructor}
        name={(id) => labMemberName(lab, id)}
        onAdd={(e) => editLab(lab.id, (l) => ({ ...l, exams: [...l.exams, { ...e, id: newId("le"), kind: e.kind as LabExam["kind"] }].sort((a, b) => a.date.localeCompare(b.date)) }))}
        onPaper={(id, paper) => editLab(lab.id, (l) => ({ ...l, exams: l.exams.map((x) => (x.id === id ? { ...x, paper } : x)) }))}
      />
      </div>
      )}

      <ShareDialog
        open={sharing !== null}
        onOpenChange={(o) => !o && setSharing(null)}
        from={{ kind: "lab", id: lab.id, name: lab.name }}
        members={lab.members}
        meId={me?.id}
        preset={sharing ?? undefined}
        onShared={(ref) => editLab(lab.id, (l) => ({ ...l, shares: [ref, ...(l.shares ?? [])] }))}
      />
      {leader && (
        <TeamSettingsDialog
          open={settings}
          onOpenChange={setSettings}
          kind="lab"
          name={lab.name}
          maxMembers={lab.maxMembers}
          members={lab.members}
          leaderId={lab.leaderId}
          canPickLeader={teacher}
          onSave={(d) => editLab(lab.id, (l) => ({ ...l, name: d.name, leaderId: d.leaderId ?? l.leaderId, maxMembers: d.maxMembers, members: d.members.map((m) => l.members.find((x) => x.id === m.id) ?? m) }))}
        />
      )}
      <ExperimentDialog lab={lab} open={adding === "exp"} onOpenChange={(o) => setAdding(o ? "exp" : null)} />
      <NoteReader note={reading?.note ?? null} url={reading?.url} author={reading?.by ?? ""} onClose={() => { if (reading?.url) URL.revokeObjectURL(reading.url); setReading(null); }} />
    </div>
  );
}

function Hero({ lab, member, me, leader, teacher, onSettings }: { lab: LabRoom; member: boolean; me: { id: string; name: string } | null; leader: boolean; teacher: boolean; onSettings: () => void }) {
  const full = isFull(lab.members.length, lab.maxMembers);
  return (
    <section className="live-in overflow-hidden rounded-3xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-8 shadow-m-tile">
      <PixelMark tone="dark" />
      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-m-blue"><FlaskConical className="size-4" aria-hidden /> {lab.course}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance text-m-ink sm:text-4xl">{lab.name}</h1>
      <p className="mt-2 text-sm text-m-ink/75">
        {lab.institution}
        {lab.instructor && <> · ল্যাব শিক্ষক: <span className="font-semibold text-m-ink">{lab.instructor}</span></>}
      </p>
      {teacher && <p className="mt-2 text-xs font-bold text-m-blue">আপনি এই ল্যাবের শিক্ষক — প্রশ্নপত্র, পরীক্ষা, নোটিশ, এক্সপেরিমেন্ট আর সেটিংস সবই আপনার হাতে।</p>}
      {leader && !teacher && !lab.instructor && <p className="mt-2 rounded-xl bg-m-red px-3 py-2 text-sm font-bold text-m-on">ল্যাব শিক্ষক যোগ করা বাধ্যতামূলক — শিক্ষক কোডটি শিক্ষককে দিন।</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <SeatMeter count={lab.members.length} limit={lab.maxMembers} />
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(lab.code).then(() => toast.success("কোড কপি হলো", { description: "ল্যাবের সবাইকে পাঠিয়ে দিন।" }))}
          className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-m-ink/6 px-3 font-mono text-sm font-bold tracking-widest text-m-ink hover:bg-m-ink/11"
        >
          {lab.code} <Copy className="size-4" aria-hidden /><span className="sr-only">ল্যাব কোড কপি করুন</span>
        </button>
        {leader && !teacher && lab.teacherCode && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(lab.teacherCode!).then(() => toast.success("শিক্ষক কোড কপি হলো", { description: "শুধু ল্যাব শিক্ষককে দিন।" }))}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-m-ink/6 px-3 text-sm font-bold text-m-ink hover:bg-m-ink/11"
          >
            শিক্ষক কোড <span className="font-mono tracking-widest">{lab.teacherCode}</span> <Copy className="size-4" aria-hidden />
          </button>
        )}
        {!member && me && (
          <button
            type="button"
            disabled={full}
            onClick={() => {
              if (joinLab(lab.id, me)) toast.success("ল্যাবে যোগ দিলেন", { description: "এখন রিপোর্ট আর কাজের ছবি জমা দিতে পারবেন, দায়িত্বের পালায় আপনার নামও উঠবে।" });
            }}
            className={mediaButton({ variant: "primary" })}
          >
            <LogIn aria-hidden /> {full ? "দল পূর্ণ — লিডারকে বলুন" : "ল্যাবে যোগ দিন"}
          </button>
        )}
        {leader && (
          <button type="button" onClick={onSettings} className={mediaButton({ variant: "outline" })}>
            <Settings2 aria-hidden /> দল ও সেটিংস
          </button>
        )}
      </div>
    </section>
  );
}

/** The four things a lab student checks first. */
function Status({ lab, me, now }: { lab: LabRoom; me?: string; now: Date }) {
  const next = nextLab(lab.experiments, now);
  const due = me ? nextDue(lab.experiments, me, now) : null;
  const exam = lab.exams.map((x) => ({ x, days: daysUntil(x.date, now) })).filter((e) => e.days >= 0).sort((a, b) => a.days - b.days)[0];
  const tally = me ? reportTally(lab.experiments, me, now) : null;
  const tiles = [
    { Icon: CalendarClock, label: "পরের ল্যাব", value: next ? (next.days === 0 ? "আজ" : <><Num value={next.days} /> দিন পর</>) : "নেই", sub: next ? <><Num value={next.exp.no} />. {next.exp.title}</> : "সূচি দেওয়া হয়নি" },
    { Icon: Timer, label: "পরের জমা", value: due ? <Left hours={due.hours} /> : "কিছু বাকি নেই", sub: due ? <>রিপোর্ট <Num value={due.exp.no} /> · <DateText iso={`${due.exp.due}:00+06:00`} time /></> : "সব রিপোর্ট জমা আছে" },
    { Icon: GraduationCap, label: "ল্যাব পরীক্ষা", value: exam ? (exam.days === 0 ? "আজ" : <><Num value={exam.days} /> দিন পর</>) : "নেই", sub: exam ? exam.x.title : "তারিখ দেওয়া হয়নি" },
    { Icon: ClipboardCheck, label: "আমার রিপোর্ট", value: tally ? <><Num value={tally.done} /> / <Num value={tally.owed} /></> : "—", sub: tally ? (tally.done === tally.owed ? "যা জমার ছিল, সব জমা" : <><Num value={tally.owed - tally.done} />টি বাকি পড়েছে</>) : "যোগ দিলে দেখাবে" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map(({ Icon, label, value, sub }, i) => {
        const s = surfaceAt(i);
        return (
          <li key={label} style={glowStyle(s.glow)} className={cn("story-reveal rounded-2xl p-4", s.card, LIFT)}>
            <span className="flex items-center gap-2 text-xs font-semibold opacity-85">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", s.tile)}><Icon className="size-4" aria-hidden /></span>
              {label}
            </span>
            <span className="mt-2 block text-xl font-bold tracking-tight">{value}</span>
            <span className="mt-0.5 block truncate text-xs opacity-80">{sub}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ExperimentCard({ lab, exp, me, member, leader, now, focus, onOpen, onShare }: {
  lab: LabRoom; exp: Experiment; me: { id: string; name: string } | null; member: boolean; leader: boolean; now: Date; focus: boolean;
  onOpen: (file: NoteFile, title: string, by: string, at: string) => void;
  onShare: () => void;
}) {
  const [open, setOpen] = useState(focus);
  const [question, setQuestion] = useState("");
  const state = me && member ? reportState(exp, me.id, now) : null;
  const counts = handIns(exp, lab.members);
  const days = daysUntil(exp.date, now);
  const hoursLeft = (dueAt(exp.due) - now.getTime()) / 3_600_000;
  const mine = (kind: "report" | "done") => exp.submissions.find((s) => s.by === me?.id && s.kind === kind);
  const save = (ok: boolean, msg: string) => (ok ? toast.success(msg) : toast.error("এই ব্রাউজারে আর জায়গা নেই — পুরোনো ফাইল সরিয়ে আবার চেষ্টা করুন।"));
  const submit = (kind: "report" | "done") => (file: NoteFile) => me && save(handIn(lab.id, exp.id, { by: me.id, kind, file, at: new Date().toISOString() }), kind === "report" ? "রিপোর্ট জমা হলো" : "কাজের ছবি জমা হলো");

  return (
    <li className={cn("story-reveal overflow-hidden rounded-2xl bg-m-card ring-1 transition-[box-shadow] duration-300 shadow-m-tile", focus ? "ring-m-blue/60" : "ring-m-ink/10")}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-start gap-4 p-4 text-left sm:p-5">
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold", days < 0 ? "bg-m-ink/6 text-m-ink" : "bg-m-yellow text-m-ink")}><Num value={exp.no} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg leading-snug font-bold text-m-ink">{exp.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-m-ink/70">
            <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden />ল্যাব: <DateText iso={at(exp.date, exp.time)} time={Boolean(exp.time)} weekday /></span>
            <span className="inline-flex items-center gap-1"><Timer className="size-3.5" aria-hidden />জমা: <DateText iso={`${exp.due}:00+06:00`} time />{hoursLeft > 0 && hoursLeft < 24 * 7 && <span className="font-semibold text-m-blue">· <Left hours={hoursLeft} /></span>}</span>
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {state && <span className={cn("rounded-full px-2.5 py-0.5 font-bold", STATE[state].cls)}>{STATE[state].bn}</span>}
            <span className="text-m-ink/60">রিপোর্ট <Num value={counts.report} />/<Num value={counts.of} /> · কাজের ছবি <Num value={counts.done} />/<Num value={counts.of} /></span>
          </span>
        </span>
        <ChevronDown className={cn("mt-2 size-5 shrink-0 text-m-ink/60 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div className="live-in grid gap-5 border-t border-m-ink/9 p-4 sm:p-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <h3 className="mb-1.5 text-sm font-bold text-m-blue">টপিক</h3>
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-m-ink/85">{exp.topic}</p>
            </div>
            <div>
              <h3 className="mb-1.5 flex items-center justify-between gap-2 text-sm font-bold text-m-blue">
                ল্যাবের কাজ
                {leader && <UploadButton label={exp.task?.file ? "টাস্ক শিট বদলান" : "টাস্ক শিটের ছবি"} Icon={ImagePlus} accept="image/*,application/pdf" scan onFile={(file) => save(editExperiment(lab.id, exp.id, (e) => ({ ...e, task: { text: e.task?.text ?? "", file } })), "টাস্ক শিট যোগ হলো")} variant="quiet" />}
              </h3>
              {exp.task?.text ? <p className="text-[15px] leading-relaxed whitespace-pre-line text-m-ink/85">{exp.task.text}</p> : <p className="text-sm text-m-ink/55">কাজের বিবরণ দেওয়া হয়নি।</p>}
              {exp.task?.file && <FilePreview file={exp.task.file} onOpen={() => onOpen(exp.task!.file!, `টাস্ক শিট — ${exp.title}`, "ল্যাব লিডার", exp.date)} />}
            </div>
            <div>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-m-blue"><CircleHelp className="size-4" aria-hidden /> প্রি-ল্যাব ও ভাইভা প্রশ্ন</h3>
              {exp.questions.length === 0 ? (
                <p className="text-sm text-m-ink/55">প্রশ্ন দেওয়া হয়নি।</p>
              ) : (
                <ol className="list-decimal space-y-1.5 pl-5 text-[15px] text-m-ink/85 marker:font-bold marker:text-m-blue">
                  {exp.questions.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              )}
              {leader && (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = question.trim();
                    if (q.length < 4) return;
                    save(editExperiment(lab.id, exp.id, (x) => ({ ...x, questions: [...x.questions, q] })), "প্রশ্ন যোগ হলো");
                    setQuestion("");
                  }}
                >
                  <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="নতুন প্রশ্ন লিখুন" aria-label="নতুন প্রশ্ন" />
                  <button type="submit" className={mediaButton({ variant: "quiet" })}><Plus aria-hidden /><span className="sr-only">যোগ করুন</span></button>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl bg-m-ink/3 p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-m-blue"><ListChecks className="size-4" aria-hidden /> আমার জমা</h3>
              {!member ? (
                <p className="text-sm text-m-ink/65">রিপোর্ট আর কাজের ছবি জমা দিতে ওপরে “ল্যাবে যোগ দিন” চাপুন।</p>
              ) : (
                <div className="space-y-3">
                  {(["report", "done"] as const).map((kind) => {
                    const s = mine(kind);
                    return (
                      <div key={kind} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-m-ink">
                          {kind === "report" ? "ল্যাব রিপোর্ট" : "কাজ শেষের ছবি"}
                          <span className="block text-xs text-m-ink/55">{s ? <>জমা <Ago iso={s.at} live /></> : kind === "report" ? "পিডিএফ বা পাতার ছবি — স্ক্যানের মতো সাদা-কালো হবে" : "সার্কিট বা সেটআপের ছবি, ল্যাবেই তুলুন"}</span>
                        </span>
                        <span className="flex gap-2">
                          {s?.file && <button type="button" onClick={() => onOpen(s.file!, `${kind === "report" ? "রিপোর্ট" : "কাজের ছবি"} — ${exp.title}`, me!.name, s.at)} className={mediaButton({ variant: "quiet", size: "sm" })}>দেখুন</button>}
                          <UploadButton label={s ? "আবার দিন" : "জমা দিন"} Icon={kind === "report" ? FileUp : Camera} accept={kind === "report" ? "image/*,application/pdf" : "image/*"} scan={kind === "report"} onFile={submit(kind)} variant={s ? "outline" : "primary"} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {member && days <= 0 && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-m-blue-soft p-4 text-m-ink">
                <p className="min-w-0 flex-1 text-sm"><span className="block font-bold">নতুন কিছু পেলেন?</span>ফলাফল, সমস্যা বা নতুন আইডিয়া — দলের নামে ফিডে দিন।</p>
                <button type="button" onClick={onShare} className={mediaButton({ variant: "primary", size: "sm" })}><Share2 aria-hidden /> ফলাফল শেয়ার</button>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-bold text-m-blue">যাঁরা জমা দিয়েছেন</h3>
              {exp.submissions.length === 0 ? (
                <p className="text-sm text-m-ink/55">এখনো কেউ জমা দেননি।</p>
              ) : (
                <ul className="divide-y divide-m-ink/9">
                  {[...exp.submissions].sort((a, b) => b.at.localeCompare(a.at)).map((s) => {
                    const late = s.kind === "report" && Date.parse(s.at) > dueAt(exp.due);
                    const name = labMemberName(lab, s.by);
                    return (
                      <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-m-ink/6 text-m-blue">{s.kind === "report" ? <FileUp className="size-4" aria-hidden /> : <Camera className="size-4" aria-hidden />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-m-ink">{name}</span>
                          <span className="text-xs text-m-ink/55">{s.kind === "report" ? "রিপোর্ট" : "কাজের ছবি"} · <Ago iso={s.at} live={s.at > DEMO_NOW.toISOString()} />{late && <span className="ml-1 rounded bg-m-red-soft px-1 font-bold text-m-ink">দেরিতে</span>}</span>
                        </span>
                        {s.file && <button type="button" onClick={() => onOpen(s.file!, `${s.kind === "report" ? "রিপোর্ট" : "কাজের ছবি"} — ${name}`, name, s.at)} className="text-xs font-bold text-m-blue hover:underline">দেখুন</button>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

const label = "mb-1.5 block text-sm font-semibold text-m-ink";

function ExperimentDialog({ lab, open, onOpenChange }: { lab: LabRoom; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [no, setNo] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [task, setTask] = useState("");
  const [sheet, setSheet] = useState<NoteFile | undefined>();
  const [questions, setQuestions] = useState("");
  const [tried, setTried] = useState(false);
  const number = Number(no) || nextNo(lab.experiments);
  const problems = {
    title: title.trim().length < 3 ? "অন্তত ৩ অক্ষরের শিরোনাম দিন" : "",
    date: !date ? "ল্যাবের তারিখ দিন" : "",
    due: !dueDate ? "রিপোর্ট জমার শেষ তারিখ দিন" : date && dueDate < date ? "জমার তারিখ ল্যাবের আগে হতে পারে না" : "",
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (Object.values(problems).some(Boolean)) return;
    const ok = addExperiment(lab.id, {
      no: number,
      title: title.trim(),
      topic: topic.trim(),
      date,
      time: time || undefined,
      due: `${dueDate}T${dueTime || "23:59"}`,
      task: task.trim() || sheet ? { text: task.trim(), file: sheet } : undefined,
      questions: questions.split("\n").map((q) => q.trim()).filter(Boolean),
    });
    if (!ok) return toast.error("এই ব্রাউজারে আর জায়গা নেই — টাস্ক শিটের ছবি ছাড়া চেষ্টা করুন।");
    toast.success("এক্সপেরিমেন্ট যোগ হলো", { description: "ল্যাবের সবাই কার্ডে দেখতে পাবে।" });
    setNo(""); setTitle(""); setTopic(""); setDate(""); setDueDate(""); setTask(""); setSheet(undefined); setQuestions(""); setTried(false);
    onOpenChange(false);
  }

  const err = (k: keyof typeof problems) => tried && problems[k] ? <span className="mt-1 block text-xs font-semibold text-m-red">{problems[k]}</span> : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-m-ink">নতুন এক্সপেরিমেন্ট</DialogTitle>
          <DialogDescription>টপিক, ল্যাবের দিন, রিপোর্ট জমার শেষ সময়, কাজ আর প্রশ্ন — সবাই এক কার্ডে দেখবে।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <label className="block">
              <span className={label}>নম্বর</span>
              <Input inputMode="numeric" value={no} onChange={(e) => setNo(e.target.value.replace(/\D/g, ""))} placeholder={String(nextNo(lab.experiments))} />
            </label>
            <label className="block">
              <span className={label}>শিরোনাম *</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: থেভেনিন উপপাদ্য" aria-invalid={tried && Boolean(problems.title)} />
              {err("title")}
            </label>
          </div>
          <label className="block">
            <span className={label}>টপিক — উদ্দেশ্য ও যা পড়ে আসতে হবে</span>
            <Textarea rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="কী যাচাই করা হবে, কোন অধ্যায় পড়ে আসবেন" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={label}>ল্যাবের দিন *</span>
              <div className="flex gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={tried && Boolean(problems.date)} />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="ল্যাবের সময়" className="w-28" />
              </div>
              {err("date")}
            </label>
            <label className="block">
              <span className={label}>রিপোর্ট জমার শেষ সময় *</span>
              <div className="flex gap-2">
                <Input type="date" value={dueDate} min={date || undefined} onChange={(e) => setDueDate(e.target.value)} aria-invalid={tried && Boolean(problems.due)} />
                <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} aria-label="জমার শেষ সময়" className="w-28" />
              </div>
              {err("due")}
            </label>
          </div>
          <label className="block">
            <span className={label}>ল্যাবের কাজ</span>
            <Textarea rows={3} value={task} onChange={(e) => setTask(e.target.value)} placeholder="যন্ত্রপাতি, ধাপ, কী মেপে টেবিলে লিখতে হবে" />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <UploadButton label={sheet ? "টাস্ক শিট বদলান" : "টাস্ক শিটের ছবি দিন"} Icon={ImagePlus} accept="image/*,application/pdf" scan onFile={setSheet} variant="quiet" />
            {sheet && <span className="text-xs text-m-ink/70">{sheet.name}</span>}
          </div>
          <label className="block">
            <span className={label}>প্রি-ল্যাব ও ভাইভা প্রশ্ন (প্রতি লাইনে একটি)</span>
            <Textarea rows={3} value={questions} onChange={(e) => setQuestions(e.target.value)} placeholder={"থেভেনিন রোধ কীভাবে বের করো?\nলোড বদলালে Vth বদলায় কি?"} />
          </label>
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            <FlaskConical aria-hidden /> এক্সপেরিমেন্ট <Num value={number} /> যোগ করুন
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

