"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Handshake, SendHorizontal } from "lucide-react";
import { SealCheck } from "@phosphor-icons/react/ssr";
import type { Person, Thread } from "@/data/media/types";
import { negotiationStatus, type Negotiation, type NegotiationStatus, type Round } from "@/lib/media/negotiation";
import { markRead, newId, updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Ago, Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { ThreadListSkeleton } from "../ui/skeletons";
import { IdSeal } from "../ui/trust";
import { DealPanel } from "./deal-panel";
import { fromMine, fromSeed, reply, type DealThread } from "./deal";

export type ChatPerson = Pick<Person, "handle" | "nameBn" | "initials" | "tone" | "headline" | "idVerified">;

const statusChip: Record<NegotiationStatus, { bn: string; className: string }> = {
  open: { bn: "নতুন", className: "bg-slate-100 text-slate-700" },
  "awaiting-seller": { bn: "উত্তরের অপেক্ষা", className: "bg-amber-50 text-amber-900" },
  countered: { bn: "পাল্টা দাম", className: "bg-orange-100 text-orange-900" },
  declined: { bn: "ফিরিয়েছে", className: "bg-red-50 text-national-crimson" },
  exhausted: { bn: "প্রস্তাব শেষ", className: "bg-red-50 text-national-crimson" },
  agreed: { bn: "রাজি", className: "bg-bd-green-light text-bd-green-dark" },
  booked: { bn: "চুক্তি হয়েছে", className: "bg-bd-green text-white" },
};

const roundText: Record<Round["kind"], (a: number) => React.ReactNode> = {
  offer: (a) => <>প্রস্তাব: <Taka amount={a} /></>,
  counter: (a) => <>পাল্টা দাম: <Taka amount={a} /></>,
  accept: (a) => <><Taka amount={a} />-এ রাজি</>,
  decline: () => <>প্রস্তাব ফিরিয়ে দিয়েছেন</>,
  confirm: (a) => <>চুক্তি নিশ্চিত · <Taka amount={a} /> এসক্রোতে</>,
};

/**
 * `live` items were made in this browser. They always follow the seeded
 * history: the device clock may be behind the demo's dates.
 */
type Item = { at: string; key: string; live: boolean } & ({ type: "msg"; from: string; text: string } | { type: "round"; round: Round });

const byTime = (a: Item, b: Item) => Number(a.live) - Number(b.live) || a.at.localeCompare(b.at);

export function MessagesApp({ seed, people, me }: { seed: Thread[]; people: Record<string, ChatPerson>; me: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const mine = useMediaState((s) => s.threads);
  const negotiations = useMediaState((s) => s.negotiations);
  const messages = useMediaState((s) => s.messages);
  const read = useMediaState((s) => s.read);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const all: DealThread[] = [...mine.map(fromMine), ...seed.map(fromSeed)];
  const selectedId = params.get("t");
  const thread = all.find((t) => t.id === selectedId);
  const nFor = (t: DealThread): Negotiation => negotiations[t.id] ?? t.seedNegotiation;

  const n = thread ? nFor(thread) : undefined;
  const status = n ? negotiationStatus(n) : undefined;
  const other = thread ? people[thread.with] : undefined;

  // The seller answers a pending offer after a short, human pause. Keyed
  // to the pending offer itself, so typing or other re-renders don't
  // restart the pause; the effect event reads the latest negotiation.
  const pendingKey = thread && n && status === "awaiting-seller" ? `${thread.id}:${n.rounds.length}` : null;
  const answer = useEffectEvent(() => {
    if (thread && n && negotiationStatus(n) === "awaiting-seller") reply(thread.id, n, thread.with);
  });
  useEffect(() => {
    if (!pendingKey) return;
    const t = window.setTimeout(answer, 1600);
    return () => window.clearTimeout(t);
  }, [pendingKey]);

  const seededRounds = thread?.seedNegotiation.rounds.length ?? 0;
  const items: Item[] = thread && n
    ? [
        ...thread.messages.map((m) => ({ type: "msg" as const, key: m.id, at: m.at, live: false, from: m.from, text: m.text })),
        ...(messages[thread.id] ?? []).map((m) => ({ type: "msg" as const, key: m.id, at: m.at, live: true, from: m.from, text: m.text })),
        ...n.rounds.map((r, i) => ({ type: "round" as const, key: `r${i}`, at: r.at, live: i >= seededRounds, round: r })),
      ].sort(byTime)
    : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread?.id, items.length]);

  // Opening a conversation clears its unread count everywhere.
  const openId = hydrated ? thread?.id : undefined;
  useEffect(() => {
    if (openId) markRead(openId);
  }, [openId]);

  function send() {
    const text = draft.trim();
    if (!text || !thread) return;
    updateMedia((s) => ({ ...s, messages: { ...s.messages, [thread.id]: [...(s.messages[thread.id] ?? []), { id: newId("m"), from: me, at: new Date().toISOString(), text }] } }));
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100dvh-11.5rem)] min-h-120 overflow-hidden rounded-2xl border border-card-border bg-white lg:h-[calc(100dvh-7.5rem)]">
      <section aria-label="কথোপকথন" className={cn("flex w-full flex-col border-card-border lg:w-84 lg:shrink-0 lg:border-r", thread && "hidden lg:flex")}>
        <div className="border-b border-card-border px-4 py-4">
          <h1 className="text-lg font-bold text-text-primary">বার্তা ও ডিল</h1>
          <p className="text-xs text-text-muted">হায়ার ও দরদাম — সব এক জায়গায়</p>
        </div>
        {!hydrated ? (
          <ThreadListSkeleton />
        ) : all.length === 0 ? (
          <div className="p-4"><EmptyState icon="messages" title="কোনো কথোপকথন নেই" /></div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {all.map((t) => {
              const p = people[t.with];
              const s = negotiationStatus(nFor(t));
              const chip = statusChip[s];
              const mineMsgs = messages[t.id] ?? [];
              const lastMsg = [...t.messages, ...mineMsgs].at(-1);
              const lastLive = mineMsgs.length > 0 || mine.some((x) => x.id === t.id);
              return (
                <li key={t.id}>
                  <Link
                    href={`/media/messages?t=${t.id}`}
                    scroll={false}
                    aria-current={t.id === thread?.id ? "true" : undefined}
                    className={cn("flex gap-3 border-b border-card-border/60 px-4 py-3.5 transition-colors hover:bg-slate-50", t.id === thread?.id && "bg-bd-green-light/60 hover:bg-bd-green-light/60")}
                  >
                    {p && <PersonAvatar person={p} />}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-bold text-text-primary">{p?.nameBn}</span>
                        {lastMsg && <span className="shrink-0 text-[11px] text-text-muted"><Ago iso={lastMsg.at} live={lastLive} /></span>}
                      </span>
                      <span className="flex items-center gap-1 truncate text-xs text-text-secondary">
                        {t.kind === "hire" ? <BriefcaseBusiness className="size-3.5 shrink-0" aria-hidden /> : <Handshake className="size-3.5 shrink-0" aria-hidden />}
                        <span className="truncate">{t.subject}</span>
                      </span>
                      <span className="mt-1.5 flex items-center justify-between gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", chip.className)}>{chip.bn}</span>
                        {t.unread > 0 && !read[t.id] && (
                          <span className="min-w-5 rounded-full bg-signal-orange px-1.5 text-center text-[11px] leading-5 font-bold text-text-primary">
                            <Num value={t.unread} />
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-label={thread ? thread.subject : "কথোপকথন বেছে নিন"} className={cn("min-w-0 flex-1 flex-col", thread ? "flex" : "hidden lg:flex")}>
        {!thread || !n || !other ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState icon="messages" title="একটি কথোপকথন বেছে নিন" body="কাউকে হায়ার করলে বা দাম প্রস্তাব করলে এখানে দরদাম চলবে।" />
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-card-border px-3 py-2.5 sm:px-4">
              <button type="button" onClick={() => router.push("/media/messages", { scroll: false })} className={mediaButton({ variant: "ghost", size: "icon", className: "lg:hidden" })}>
                <ArrowLeft aria-hidden />
                <span className="sr-only">সব বার্তা</span>
              </button>
              <PersonAvatar person={other} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-bold text-text-primary">
                  {other.nameBn} {other.idVerified && <IdSeal size={16} />}
                </p>
                <p className="truncate text-xs text-text-muted">{thread.subject}</p>
              </div>
              <Link href={`/media/u/${other.handle}`} className={mediaButton({ variant: "quiet", size: "sm", className: "hidden sm:inline-flex" })}>
                প্রোফাইল
              </Link>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-3 py-4 sm:px-5" aria-live="polite">
              <p className="mx-auto max-w-sm rounded-xl bg-white px-3 py-2 text-center text-xs text-text-muted ring-1 ring-card-border">
                দাম চাওয়া হয়েছে <Taka amount={thread.ask} />। টাকা প্ল্যাটফর্মের এসক্রোতে থাকবে — বাইরে অগ্রিম দেবেন না।
              </p>
              {thread.brief && (
                <div className="mx-auto max-w-md rounded-xl border border-card-border bg-white p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-bd-green"><BriefcaseBusiness className="size-3.5" aria-hidden />কাজের বিবরণ</p>
                  <p className="whitespace-pre-line text-text-primary">{thread.brief}</p>
                </div>
              )}
              {items.map((it) => {
                if (it.type === "round") {
                  const buyer = it.round.by === "buyer";
                  const good = it.round.kind === "accept" || it.round.kind === "confirm";
                  return (
                    <div key={it.key} className={cn("fade-in flex", buyer ? "justify-end" : "justify-start")}>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold",
                          good ? "border-bd-green/30 bg-bd-green-light text-bd-green-dark" : it.round.kind === "decline" ? "border-red-200 bg-red-50 text-national-crimson" : "border-orange-200 bg-orange-50 text-orange-950",
                        )}
                      >
                        {good ? <SealCheck size={18} weight="duotone" aria-hidden /> : <Handshake className="size-4" aria-hidden />}
                        <span className="sr-only">{buyer ? "আপনি:" : `${other.nameBn}:`}</span>
                        {roundText[it.round.kind](it.round.amount)}
                      </span>
                    </div>
                  );
                }
                const fromMe = it.from === me;
                return (
                  <div key={it.key} className={cn("fade-in flex", fromMe && "justify-end")}>
                    <p
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed whitespace-pre-line",
                        fromMe ? "rounded-br-md bg-bd-green text-white" : "rounded-bl-md bg-white text-text-primary ring-1 ring-card-border",
                      )}
                    >
                      {it.text}
                    </p>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <DealPanel thread={thread} n={n} sellerName={other.nameBn} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 border-t border-card-border p-2.5"
            >
              <label className="flex-1">
                <span className="sr-only">বার্তা লিখুন</span>
                <textarea
                  name="message"
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="বার্তা লিখুন…"
                  className="max-h-32 min-h-11 w-full resize-none rounded-xl border border-card-border px-3 py-2.5 text-[15px] focus:border-bd-green focus:ring-3 focus:ring-bd-green/15 focus:outline-none"
                />
              </label>
              <button type="submit" disabled={!draft.trim()} className={mediaButton({ variant: "green", size: "icon", className: "size-11" })}>
                <SendHorizontal aria-hidden />
                <span className="sr-only">পাঠান</span>
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
