"use client";

import { useSearchParams } from "next/navigation";
import { KeyRound, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Avatar, hb, PageHead, Panel, Pill, Toggle } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago } from "@/lib/hq/format";
import { ALL_PERMS, LEVEL_LABEL, LEVEL_PRESET, PERM_LABEL } from "@/lib/hq/rules";
import type { Perm, Person } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

/** The super prime admin's switchboard: every permission, person by person. */
export function AccessControl() {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const focus = useSearchParams().get("p");
  const rowRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    rowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focus]);
  const list = [...v.people].sort((a, b) => Number(b.level === "prime") - Number(a.level === "prime") || a.name.localeCompare(b.name));
  const toggle = (p: Person, perm: Perm) => {
    const next = p.perms.includes(perm) ? p.perms.filter((x) => x !== perm) : [...p.perms, perm];
    act("people", "perms", { personId: p.id, perms: next }, { quiet: true }).catch(() => {});
  };
  const reset = (p: Person) => act("people", "perms", { personId: p.id, perms: LEVEL_PRESET[p.level] }, { ok: `${p.name}: reset to the ${LEVEL_LABEL[p.level]} preset` }).catch(() => {});
  const log = v.audit.filter((a) => a.kind === "perm").slice(-12).reverse();

  return (
    <>
      <PageHead title="Access Control" lead="Grant or remove each permission person by person. Only you can do this; every change is logged and the person is told." />
      {/* Desktop: the matrix. */}
      <div className="hidden overflow-x-auto rounded-2xl ring-1 ring-white/12 lg:block">
        <table className="w-full min-w-[80rem] border-collapse text-sm">
          <thead className="sticky top-0 bg-bdnavy-900">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-bdnavy-900 px-4 py-3 text-left font-grotesk text-sm font-bold text-signal-orange">
                Person
              </th>
              {ALL_PERMS.map((perm) => (
                <th key={perm} scope="col" title={PERM_LABEL[perm].hint} className="px-2 py-3 text-center align-bottom">
                  <span className="mx-auto block w-20 text-xs leading-tight font-semibold text-white/80">{PERM_LABEL[perm].label}</span>
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const prime = p.level === "prime";
              return (
                <tr key={p.id} ref={p.id === focus ? (el) => { rowRef.current = el; } : undefined} className={cn("border-t border-white/8", p.id === focus && "bg-signal-orange/10")}>
                  <th scope="row" className="sticky left-0 z-10 bg-black px-4 py-2.5 text-left">
                    <span className="flex items-center gap-3">
                      <Avatar person={p} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-white">{p.name}</span>
                        <span className="block text-xs font-normal text-white/55">{LEVEL_LABEL[p.level]}</span>
                      </span>
                    </span>
                  </th>
                  {ALL_PERMS.map((perm) => (
                    <td key={perm} className="px-2 py-2.5 text-center">
                      <span className="inline-flex">
                        <Toggle on={prime || p.perms.includes(perm)} disabled={prime} label={`${PERM_LABEL[perm].label} for ${p.name}`} onChange={() => toggle(p, perm)} />
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    {prime ? (
                      <Lock aria-label="Always every permission" className="size-4 text-signal-orange" />
                    ) : (
                      <button type="button" onClick={() => reset(p)} aria-label={`Reset ${p.name} to preset`} title="Reset to the level's preset" className={hb.iconSm}>
                        <RotateCcw aria-hidden className="size-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Phones and tablets: one card per person. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {list.map((p) => {
          const prime = p.level === "prime";
          return (
            <section key={p.id} ref={p.id === focus ? (el) => { rowRef.current = el; } : undefined} className={cn("rounded-2xl bg-bdnavy-900 p-4 ring-1", p.id === focus ? "ring-signal-orange" : "ring-white/12")}>
              <div className="mb-3 flex items-center gap-3">
                <Avatar person={p} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-white">{p.name}</span>
                  <span className="block text-xs text-white/55">{LEVEL_LABEL[p.level]}</span>
                </span>
                {prime ? <Pill tone="gold">All access</Pill> : <button type="button" onClick={() => reset(p)} className={hb.quietSm}>Preset</button>}
              </div>
              <ul className="flex flex-col gap-2">
                {ALL_PERMS.map((perm) => (
                  <li key={perm} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 text-sm text-white/85">{PERM_LABEL[perm].label}</span>
                    <Toggle on={prime || p.perms.includes(perm)} disabled={prime} label={`${PERM_LABEL[perm].label} for ${p.name}`} onChange={() => toggle(p, perm)} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="What each permission opens" icon={KeyRound} field="ink">
          <dl className="grid gap-3 sm:grid-cols-2">
            {ALL_PERMS.map((perm) => (
              <div key={perm}>
                <dt className="text-sm font-semibold text-signal-orange">{PERM_LABEL[perm].label}</dt>
                <dd className="text-xs leading-relaxed text-white/65">{PERM_LABEL[perm].hint}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Recent permission changes" icon={ShieldCheck}>
          {log.length === 0 ? <p className="text-sm text-white/60">No changes yet.</p> : null}
          <ul className="flex flex-col gap-2">
            {log.map((a) => (
              <li key={a.id} className="text-sm text-white/85">
                <strong className="text-white">{nameOf(people, a.target)}</strong> <span className="font-mono text-xs text-white/60">{a.detail}</span>
                <span className="block text-xs text-white/45">
                  by {nameOf(people, a.actor)} · {ago(a.at, now)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
