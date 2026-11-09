"use client";

import { BookOpen, Crown, Gavel, MessageSquareText, Pencil, Plus, Scale, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Empty, FormField, hb, inputCls, PageHead, Panel, Pill, Seg, selectCls, textareaCls, type Tone } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago } from "@/lib/hq/format";
import { addDays, can, num } from "@/lib/hq/rules";
import { crimePoints, lutherKing, weekStart } from "@/lib/hq/scoring";
import type { Article, Case, PenaltyKind } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const PART_NAME: Record<string, string> = { Ka: "Time & attendance", Kha: "Tasks & responsibility", Ga: "Teamwork & help", Gha: "Communication & meetings", Uma: "Conduct & respect" };
const PENALTY_LABEL: Record<PenaltyKind, string> = { warning: "Warning", points: "Points", treat: "Treat", duty: "Duty", fine: "Fine" };
const PENALTY_TONE: Record<PenaltyKind, Tone> = { warning: "muted", points: "navy", treat: "gold", duty: "cobalt", fine: "red" };
const STATUS: Record<Case["status"], { label: string; tone: Tone }> = { filed: { label: "Filed", tone: "red" }, answered: { label: "Answered", tone: "gold" }, decided: { label: "Verdict", tone: "navy" }, appealed: { label: "Appealed", tone: "cobalt" }, closed: { label: "Closed", tone: "muted" } };

export function Shongbidhan() {
  const v = useHq();
  const people = usePeople();
  const today = useToday();
  const me = v.me.person;
  const judge = can(me, "shongbidhan.judge");
  const parts = useMemo(() => [...new Set(v.articles.map((a) => a.part))], [v.articles]);
  const [part, setPart] = useState(parts[0] ?? "Ka");
  const [span, setSpan] = useState<"week" | "month">("week");
  const [filing, setFiling] = useState(false);
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [tab, setTab] = useState<"all" | "mine" | "open">("all");
  const pts = Object.fromEntries(v.articles.map((a) => [a.id, a.crimePoints]));
  const from = span === "week" ? weekStart(today) : `${today.slice(0, 7)}-01`;
  const counts = crimePoints(v.cases, pts, from, addDays(today, 1));
  const bars = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const king = lutherKing(v.cases, pts, today);
  const kingCases = king ? v.cases.filter((c) => c.accusedId === king && c.verdict?.guilty && c.appeal?.outcome !== "overturned" && c.verdict.at.slice(0, 10) >= weekStart(today)) : [];
  const cases = [...v.cases].filter((c) => (tab === "mine" ? c.accusedId === me.id || c.byId === me.id : tab === "open" ? c.status !== "closed" && c.status !== "decided" : true)).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <PageHead
        title="Kandari Shongbidhan"
        lead="The company's constitution: parts, articles and sections, the crime wall and the week's Luther King. Playful, but fair."
        actions={
          <>
            {judge ? (
              <button type="button" onClick={() => setEditing("new")} className={hb.outline}>
                <Plus aria-hidden className="size-4" /> Article
              </button>
            ) : null}
            <button type="button" onClick={() => setFiling(true)} className={hb.gold}>
              <Gavel aria-hidden className="size-4" /> File a case
            </button>
          </>
        }
      />
      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-text-primary p-4 text-sm leading-relaxed text-white/80 ring-1 ring-white/12">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-signal-orange" />
        Fairness first: every accused member answers before a verdict (or 48 hours pass), judges never hear their own case, appeals go to the super prime admin within 7 days, and fines are capped by law at a tenth of the month&apos;s wage (Bangladesh Labour Act 2006, s. 25).
      </p>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section aria-label="The constitution" className="hq-rise rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <BookOpen aria-hidden className="size-5 text-signal-orange" />
            <h2 className="font-grotesk text-lg font-bold text-signal-orange">The constitution</h2>
            <Seg label="Part" value={part} onChange={setPart} className="ml-auto" options={parts.map((p) => ({ value: p, label: `Part ${p}`, count: v.articles.filter((a) => a.part === p).length }))} />
          </div>
          <p className="mb-4 font-grotesk text-2xl font-bold text-white">
            Part {part} · {PART_NAME[part] ?? ""}
          </p>
          <ol className="flex flex-col gap-3">
            {v.articles
              .filter((a) => a.part === part)
              .map((a) => (
                <li key={a.id} className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-signal-orange">
                      Article {a.article} · Section {a.section}
                    </span>
                    <Pill tone={PENALTY_TONE[a.penalty.kind]} className="ml-auto">
                      {PENALTY_LABEL[a.penalty.kind]}
                    </Pill>
                    <Pill tone="muted">{a.crimePoints} crime pts</Pill>
                    {judge ? (
                      <button type="button" onClick={() => setEditing(a)} aria-label={`Edit ${a.title}`} className={hb.iconSm}>
                        <Pencil aria-hidden className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-grotesk font-bold text-white">{a.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">{a.text}</p>
                  <p className="mt-2 text-sm font-semibold text-signal-orange">Penalty: {a.penalty.text}</p>
                </li>
              ))}
          </ol>
        </section>

        <div className="flex flex-col gap-5 xl:col-span-4">
          <section aria-label="Luther King of the week" className="hq-rise relative overflow-hidden rounded-3xl bg-signal-orange p-6 text-text-primary">
            <Crown aria-hidden className="absolute -top-3 -right-3 size-28 opacity-15" />
            <p className="flex items-center gap-2 font-grotesk text-sm font-bold">
              <Crown aria-hidden className="size-4" /> Luther King of the week
            </p>
            {king ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar person={people.get(king)} size="lg" className="ring-2 ring-text-primary" />
                  <span>
                    <span className="block font-grotesk text-xl font-bold">{nameOf(people, king)}</span>
                    <span className="block text-sm">{num(counts[king] ?? 0)} crime points this week</span>
                  </span>
                </div>
                <ul className="mt-4 flex flex-col gap-1 text-sm">
                  {kingCases.map((c) => (
                    <li key={c.id}>· {v.articles.find((a) => a.id === c.articleId)?.title}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs">Hosts next week&apos;s meetings and materials. A clean week clears the title.</p>
              </>
            ) : (
              <p className="mt-4 text-sm font-semibold">Nobody this week — a clean record (or a tie, which we never crown).</p>
            )}
          </section>

          <Panel title="Crime count" icon={Scale} field="ink" action={<Seg label="Span" value={span} onChange={setSpan} options={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }]} />}>
            {bars.length === 0 ? <p className="text-sm text-white/60">No guilty verdicts {span === "week" ? "this week" : "this month"}.</p> : null}
            <ul className="flex flex-col gap-2.5">
              {bars.map(([pid, n]) => (
                <li key={pid} className="flex items-center gap-3">
                  <Avatar person={people.get(pid)} size="xs" />
                  <span className="w-24 truncate text-sm text-white">{nameOf(people, pid)}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-national-crimson" style={{ width: `${(n / bars[0][1]) * 100}%` }} />
                  </span>
                  <span className="w-8 text-right font-mono text-xs font-bold text-crimson-bright">{n}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-8 mb-4 flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-grotesk text-2xl font-bold text-signal-orange">
          <Gavel aria-hidden className="size-6" /> Crime wall
        </h2>
        <Seg label="Cases" value={tab} onChange={setTab} className="ml-auto" options={[{ value: "all", label: "All", count: v.cases.length }, { value: "open", label: "Open" }, { value: "mine", label: "Mine" }]} />
      </div>
      {cases.length === 0 ? <Empty title="No cases" icon={Scale} /> : null}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cases.map((c, i) => (
          <CaseCard key={c.id} c={c} i={i} />
        ))}
      </div>

      <FileCase open={filing} onOpenChange={setFiling} />
      {judge ? <ArticleDialog key={editing === "new" ? "new" : (editing?.id ?? "none")} article={editing} onClose={() => setEditing(null)} defaultPart={part} /> : null}
    </>
  );
}

function CaseCard({ c, i }: { c: Case; i: number }) {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const me = v.me.person;
  const a = v.articles.find((x) => x.id === c.articleId);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState(false);
  const [appeal, setAppeal] = useState(false);
  const judge = can(me, "shongbidhan.judge") && c.accusedId !== me.id;
  const steps = [
    { label: "Filed", done: true },
    { label: "Answered", done: Boolean(c.showCause) },
    { label: "Verdict", done: Boolean(c.verdict) },
    { label: "Appeal", done: Boolean(c.appeal) },
  ];
  const canDecide = judge && !c.verdict && (Boolean(c.showCause) || now - Date.parse(c.at) >= 48 * 3600_000);
  return (
    <article style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className={cn("hq-rise flex flex-col gap-3 rounded-2xl p-5 ring-1", c.verdict?.guilty && c.appeal?.outcome !== "overturned" ? "bg-bdnavy-900 ring-national-crimson/50" : "bg-bdnavy-900 ring-white/12")}>
      <div className="flex items-center gap-3">
        <Avatar person={people.get(c.accusedId)} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-white">{nameOf(people, c.accusedId)}</span>
          <span className="block text-xs text-white/55">
            filed by {nameOf(people, c.byId)} · {ago(c.at, now)}
          </span>
        </span>
        <Pill tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Pill>
      </div>
      <ol className="flex items-center gap-1" aria-label="Case progress">
        {steps.map((s) => (
          <li key={s.label} className="flex flex-1 items-center gap-1">
            <span className={cn("h-1.5 flex-1 rounded-full", s.done ? "bg-signal-orange" : "bg-white/12")} />
          </li>
        ))}
      </ol>
      <p className="font-mono text-xs text-signal-orange">
        Part {a?.part}, Article {a?.article}, Section {a?.section} — {a?.title}
      </p>
      <p className="text-sm leading-relaxed text-white/85">{c.evidence}</p>
      {c.showCause ? (
        <blockquote className="border-l-2 border-signal-orange pl-3 text-sm text-white/75 italic">
          <MessageSquareText aria-hidden className="mr-1 inline size-3.5" /> {c.showCause.text}
        </blockquote>
      ) : null}
      {c.verdict ? (
        <div className={cn("rounded-xl p-3 text-sm", c.verdict.guilty ? "bg-national-crimson/15 text-white" : "bg-white/6 text-white")}>
          <p className="font-bold">
            {c.verdict.guilty ? "Guilty" : "Not guilty"} · {nameOf(people, c.verdict.by)}
          </p>
          <p className="mt-1 text-white/80">{c.verdict.note}</p>
          {c.verdict.guilty && a ? <p className="mt-1 text-signal-orange">Penalty: {a.penalty.text}{c.verdict.fine ? ` (৳${num(c.verdict.fine)})` : ""}</p> : null}
        </div>
      ) : null}
      {c.appeal ? (
        <p className="text-sm text-white/75">
          <Undo2 aria-hidden className="mr-1 inline size-3.5" />
          Appeal: {c.appeal.text}
          {c.appeal.outcome ? <strong className="ml-1 text-signal-orange">— {c.appeal.outcome}</strong> : null}
        </p>
      ) : null}

      {c.accusedId === me.id && !c.verdict ? (
        <form onSubmit={(e) => { e.preventDefault(); act("control", "case.answer", { id: c.id, text: answer }, { ok: "Your answer was recorded" }).then(() => setAnswer(""), () => {}); }} className="flex flex-col gap-2">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your side of the story…" aria-label="Your answer" className={cn(textareaCls, "min-h-20")} />
          <button type="submit" disabled={answer.trim().length < 10} className={cn(hb.goldSm, "self-start")}>
            {c.showCause ? "Update answer" : "Answer"}
          </button>
        </form>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2">
        {canDecide ? (
          <button type="button" onClick={() => setVerdict(true)} className={hb.goldSm}>
            <Gavel aria-hidden className="size-3.5" /> Give verdict
          </button>
        ) : judge && !c.verdict ? (
          <span className="text-xs text-white/55">Waiting for the answer (or 48 hours).</span>
        ) : null}
        {c.accusedId === me.id && c.verdict?.guilty && !c.appeal ? (
          <button type="button" onClick={() => setAppeal(true)} className={hb.outlineSm}>
            <Undo2 aria-hidden className="size-3.5" /> Appeal
          </button>
        ) : null}
        {me.level === "prime" && c.appeal && !c.appeal.outcome ? (
          <>
            <button type="button" onClick={() => act("control", "case.appealDecide", { id: c.id, outcome: "overturned" }, { ok: "Verdict overturned" })} className={hb.goldSm}>
              Overturn
            </button>
            <button type="button" onClick={() => act("control", "case.appealDecide", { id: c.id, outcome: "upheld" }, { ok: "Verdict upheld" })} className={hb.quietSm}>
              Uphold
            </button>
          </>
        ) : null}
      </div>
      <VerdictDialog c={c} article={a} open={verdict} onOpenChange={setVerdict} />
      <HqDialog open={appeal} onOpenChange={setAppeal} title="Appeal the verdict" description="Appeals go to the super prime admin. Explain what the verdict missed." size="sm">
        <AppealButton id={c.id} onDone={() => setAppeal(false)} />
      </HqDialog>
    </article>
  );
}

function AppealButton({ id, onDone }: { id: string; onDone: () => void }) {
  const act = useAct();
  const [text, setText] = useState("");
  return (
    <div className="flex w-full flex-col gap-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Your appeal" className={textareaCls} />
      <button type="button" disabled={text.trim().length < 10} onClick={() => act("control", "case.appeal", { id, text }, { ok: "Appeal sent" }).then(onDone, () => {})} className={hb.gold}>
        Send appeal
      </button>
    </div>
  );
}

function VerdictDialog({ c, article, open, onOpenChange }: { c: Case; article?: Article; open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const people = useHq((v) => v.people);
  const accused = people.find((p) => p.id === c.accusedId);
  const [guilty, setGuilty] = useState(true);
  const [note, setNote] = useState("");
  const [fine, setFine] = useState(article?.penalty.amount ?? 0);
  const cap = accused?.wage ? Math.floor(accused.wage / 10) : 0;
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Verdict"
      description={article?.title}
      size="sm"
      footer={
        <button type="button" disabled={note.trim().length < 5} onClick={() => act("control", "case.verdict", { id: c.id, guilty, note, fine: article?.penalty.kind === "fine" ? fine : undefined }, { ok: "Verdict recorded" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>
          <Gavel aria-hidden className="size-4" /> Record verdict
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <Seg label="Verdict" value={guilty ? "g" : "n"} onChange={(x) => setGuilty(x === "g")} options={[{ value: "g", label: "Guilty" }, { value: "n", label: "Not guilty" }]} />
        <FormField label="Reasoning">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className={textareaCls} />
        </FormField>
        {guilty && article?.penalty.kind === "fine" ? (
          <FormField label="Fine (৳)" hint={accused?.wage ? `Capped at ৳${num(cap)} a month by law (a tenth of the wage).` : "No wage on record, so no fine can be charged — set a wage in People first."}>
            <input type="number" min={0} value={fine} onChange={(e) => setFine(Number(e.target.value))} className={inputCls} />
          </FormField>
        ) : guilty && article ? (
          <p className="rounded-xl bg-black/30 p-3 text-sm text-signal-orange">Penalty: {article.penalty.text}</p>
        ) : null}
      </div>
    </HqDialog>
  );
}

function FileCase({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const articles = useHq((v) => v.articles);
  const me = useHq((v) => v.me.person.id);
  const [f, setF] = useState({ accusedId: "", articleId: "", evidence: "" });
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="File a Shongbidhan case"
      description="Be specific and fair: the accused reads your evidence and answers before any verdict."
      footer={
        <button type="button" disabled={!f.accusedId || !f.articleId || f.evidence.trim().length < 20} onClick={() => act("control", "case.file", f, { ok: "Case filed — the accused can answer" }).then(() => { setF({ accusedId: "", articleId: "", evidence: "" }); onOpenChange(false); }, () => {})} className={hb.gold}>
          File case
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Member">
          <select value={f.accusedId} onChange={(e) => setF((x) => ({ ...x, accusedId: e.target.value }))} className={selectCls}>
            <option value="">Choose…</option>
            {all
              .filter((p) => p.status === "active" && p.id !== me)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </FormField>
        <FormField label="Article">
          <select value={f.articleId} onChange={(e) => setF((x) => ({ ...x, articleId: e.target.value }))} className={selectCls}>
            <option value="">Choose…</option>
            {articles.map((a) => (
              <option key={a.id} value={a.id}>
                Part {a.part}, Art. {a.article}, Sec. {a.section} — {a.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Evidence" hint={`${f.evidence.trim().length} of at least 20 characters`}>
          <textarea value={f.evidence} onChange={(e) => setF((x) => ({ ...x, evidence: e.target.value }))} className={textareaCls} placeholder="What happened, when, who saw it…" />
        </FormField>
      </div>
    </HqDialog>
  );
}

function ArticleDialog({ article, onClose, defaultPart }: { article: Article | "new" | null; onClose: () => void; defaultPart: string }) {
  const act = useAct();
  const a = article && article !== "new" ? article : null;
  const [f, setF] = useState({ part: a?.part ?? defaultPart, article: a?.article ?? "", section: a?.section ?? "", title: a?.title ?? "", text: a?.text ?? "", kind: a?.penalty.kind ?? ("warning" as PenaltyKind), penalty: a?.penalty.text ?? "", amount: a?.penalty.amount ?? 0, crimePoints: a?.crimePoints ?? 1 });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: ["amount", "crimePoints"].includes(k) ? Number(e.target.value) : e.target.value }));
  return (
    <HqDialog
      open={article !== null}
      onOpenChange={(o) => !o && onClose()}
      title={a ? "Edit article" : "New article"}
      size="lg"
      footer={
        <>
          {a && a.id !== "art-help" ? (
            <button type="button" onClick={() => act("control", "article.remove", { id: a.id }, { ok: "Article removed" }).then(onClose, () => {})} className={hb.quiet}>
              <Trash2 aria-hidden className="size-4" /> Remove
            </button>
          ) : null}
          <button type="button" onClick={() => act("control", "article.save", { id: a?.id, part: f.part, article: f.article, section: f.section, title: f.title, text: f.text, penalty: { kind: f.kind, text: f.penalty, amount: f.amount || undefined }, crimePoints: f.crimePoints }, { ok: "Article saved" }).then(onClose, () => {})} className={hb.gold}>
            Save
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Part">
          <input value={f.part} onChange={set("part")} className={inputCls} />
        </FormField>
        <FormField label="Article">
          <input value={f.article} onChange={set("article")} className={inputCls} />
        </FormField>
        <FormField label="Section">
          <input value={f.section} onChange={set("section")} className={inputCls} />
        </FormField>
        <FormField label="Title" className="sm:col-span-3">
          <input value={f.title} onChange={set("title")} className={inputCls} />
        </FormField>
        <FormField label="Text" className="sm:col-span-3">
          <textarea value={f.text} onChange={set("text")} className={textareaCls} />
        </FormField>
        <FormField label="Penalty kind">
          <select value={f.kind} onChange={set("kind")} className={selectCls}>
            {Object.entries(PENALTY_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Amount (points or ৳)">
          <input type="number" min={0} value={f.amount} onChange={set("amount")} className={inputCls} />
        </FormField>
        <FormField label="Crime points">
          <input type="number" min={0} max={100} value={f.crimePoints} onChange={set("crimePoints")} className={inputCls} />
        </FormField>
        <FormField label="Penalty, in words" className="sm:col-span-3">
          <input value={f.penalty} onChange={set("penalty")} className={inputCls} placeholder="e.g. Treats the team to lunch today" />
        </FormField>
      </div>
    </HqDialog>
  );
}
