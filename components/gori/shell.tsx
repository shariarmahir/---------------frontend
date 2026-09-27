"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, FlaskConical, Gamepad2, GitCompareArrows, Hammer, LayoutDashboard, Lock, Swords, Trophy, UserCog, Users } from "lucide-react";
import { isUnlocked, levelOf, totalXp, UNLOCKS, type Feature } from "@/lib/gori/progression";
import { cn } from "@/lib/utils";
import { useT } from "./provider";
import type { Key } from "./i18n";
import { useGori } from "./store";

export const BASE = "/cholo-bangladesh-gori";

const items: { href: string; key: Key; icon: typeof Gamepad2; feature?: Feature }[] = [
  { href: BASE, key: "navHome", icon: LayoutDashboard },
  { href: `${BASE}/mission`, key: "navMission", icon: Swords },
  { href: `${BASE}/play`, key: "navPlay", icon: Gamepad2 },
  { href: `${BASE}/lab`, key: "navLab", icon: FlaskConical, feature: "lab" },
  { href: `${BASE}/evidence`, key: "navEvidence", icon: BookOpenCheck },
  { href: `${BASE}/compare`, key: "navCompare", icon: GitCompareArrows, feature: "compare" },
  { href: `${BASE}/forge`, key: "navForge", icon: Hammer, feature: "forge" },
  { href: `${BASE}/community`, key: "navCommunity", icon: Users },
  { href: `${BASE}/progress`, key: "navProgress", icon: Trophy },
  { href: `${BASE}/profile`, key: "navProfile", icon: UserCog },
];

/** The game's own navigation, visible at every width; locked features say when they open. */
export function GoriNav() {
  const pathname = usePathname();
  const { t, n } = useT();
  const progress = useGori((s) => s.progress);
  const openAll = useGori((s) => s.settings.openAll);
  const xp = totalXp(progress);

  return (
    <nav aria-label="খেলার মেনু" className="border-b border-white/10 bg-gori-deep">
      {/* `relative`: the lock labels are `sr-only` (absolutely positioned); without a
          positioned scroller they escape its clipping and widen phone layouts. */}
      <ul className="no-scrollbar relative mx-auto flex max-w-340 gap-1 overflow-x-auto px-3 py-2 sm:px-6 lg:px-8">
        {items.map((it) => {
          const on = it.href === BASE ? pathname === BASE : pathname.startsWith(it.href);
          const locked = it.feature ? !isUnlocked(it.feature, xp, openAll) : false;
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={on ? "page" : undefined}
                title={locked ? `${t("unlockAt")} ${n(UNLOCKS[it.feature!].level)}` : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-bengali text-sm font-semibold transition-colors",
                  on ? "bg-gori-cream text-gori-ink" : "text-emerald-50/85 hover:bg-white/10 hover:text-white",
                )}
              >
                <it.icon className="size-4" aria-hidden />
                {t(it.key)}
                {locked && (
                  <>
                    <Lock className="size-3.5 opacity-70" aria-hidden />
                    <span className="sr-only">(বন্ধ — স্তর {n(UNLOCKS[it.feature!].level)}-এ খুলবে)</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
        <li className="ml-auto hidden shrink-0 items-center pl-4 font-bengali text-xs text-emerald-100/80 md:flex">
          {t("level")} {n(levelOf(xp).number)} · {levelOf(xp).bn} · {n(xp)} XP
        </li>
      </ul>
    </nav>
  );
}

/** Shown in place of a locked screen. */
export function LockedNotice({ feature }: { feature: Feature }) {
  const progress = useGori((s) => s.progress);
  const setSettings = useGori((s) => s.setSettings);
  const { n } = useT();
  const xp = totalXp(progress);
  const u = UNLOCKS[feature];
  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-gori-cream p-8 text-center text-gori-ink">
      <Lock className="mx-auto size-8 text-gori-mute" aria-hidden />
      <h2 className="mt-3 font-bengali text-2xl font-bold">{u.bn} এখনো বন্ধ</h2>
      <p className="mt-2 font-bengali text-[15px] leading-7 text-gori-ink-soft">
        স্তর {n(u.level)}-এ খুলবে। আপনি এখন স্তর {n(levelOf(xp).number)}-এ ({n(xp)} XP)। অভিযান আর প্রমাণ-পরীক্ষা খেলে XP পান — XP কেবল শেখা আর উন্নতিতে আসে, একই খেলা বারবার চালিয়ে নয়।
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href={`${BASE}/play`} className="inline-flex h-11 items-center rounded-xl bg-signal-orange px-5 font-bengali font-bold text-gori-ink">
          অভিযান খেলুন
        </Link>
        <button
          type="button"
          onClick={() => setSettings({ openAll: true })}
          className="inline-flex h-11 items-center rounded-xl border border-gori-ink/20 px-4 font-bengali text-sm font-semibold text-gori-ink-soft hover:bg-white"
        >
          শিক্ষক/উন্নত মোড: সব খুলে দিন
        </button>
      </div>
    </div>
  );
}

export function useFeature(feature: Feature): boolean {
  const progress = useGori((s) => s.progress);
  const openAll = useGori((s) => s.settings.openAll);
  return isUnlocked(feature, totalXp(progress), openAll);
}
