"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { configSchema } from "@/lib/gori/sim/types";
import { randomSeed } from "@/lib/gori/rng";
import { BASE, LockedNotice, useFeature } from "../shell";
import { useGori, useHydrated } from "../store";
import { CommandCenter } from "./command-center";
import { Setup } from "./setup";

/** /play — the command centre for the running game, or a way to start one. */
export function PlayScreen() {
  const hydrated = useHydrated();
  const game = useGori((s) => s.game);
  const startGame = useGori((s) => s.startGame);
  const startMode = useGori((s) => s.startMode);
  const params = useSearchParams();
  const router = useRouter();
  const sandbox = useFeature("sandbox");
  const setup = params.get("setup") === "1";

  if (!hydrated) {
    return (
      <p className="flex items-center justify-center gap-2 py-24 font-bengali text-emerald-100/80">
        <Loader2 className="size-5 animate-spin" aria-hidden /> খেলা লোড হচ্ছে…
      </p>
    );
  }

  if (setup) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {sandbox ? (
          <Setup
            onStart={(c, strategy) => {
              const ok = configSchema.safeParse(c);
              if (!ok.success) return;
              startGame(ok.data, strategy);
              router.replace(`${BASE}/play`);
            }}
          />
        ) : (
          <LockedNotice feature="sandbox" />
        )}
      </div>
    );
  }

  if (game) return <CommandCenter key={game.startedAt} game={game} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-bengali text-3xl font-bold text-signal-orange">কোনো খেলা চলছে না</h1>
      <p className="mt-3 font-bengali text-emerald-50/85">অভিযান দিয়ে শুরু করুন — আট ধাপে এক পিক্সেল থেকে পুরো ব্যবস্থা।</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => startMode("campaign", randomSeed())} className="inline-flex h-12 items-center gap-2 rounded-xl bg-signal-orange px-6 font-bengali font-bold text-gori-ink">
          <MapIcon className="size-5" aria-hidden /> অভিযান শুরু
        </button>
        <button type="button" onClick={() => router.push(`${BASE}/play?setup=1`)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 px-5 font-bengali font-semibold">
          <SlidersHorizontal className="size-5" aria-hidden /> স্যান্ডবক্স
        </button>
      </div>
    </div>
  );
}
