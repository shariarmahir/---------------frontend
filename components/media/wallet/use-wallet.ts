"use client";

import type { Txn, WalletSeed } from "@/data/media/types";
import { walletSeed } from "@/data/media/wallet";
import { useMediaState } from "@/lib/media/store";

/**
 * Wallet figures: the seeded account plus the viewer's own rows from this
 * browser. Every row's `net` is its effect on the available balance (0 for
 * a purchase paid by bKash/card); held escrow counts the whole bill however
 * it was paid.
 */
export function useWallet(seed: WalletSeed = walletSeed) {
  const mine = useMediaState((s) => s.txns);
  const released = useMediaState((s) => s.released);
  const delta = mine.reduce((n, t) => n + t.net, 0);
  const bill = (t: Txn) => t.gross + t.fee;
  const held = mine.filter((t) => t.kind === "escrow" && t.status === "held").reduce((n, t) => n + bill(t), 0);
  // A seeded escrow row leaves escrow once the viewer releases its deal.
  const isReleased = (t: Txn) => Boolean(t.deal && released[t.deal] && t.status === "held");
  const releasedSeed = seed.txns.filter(isReleased).reduce((n, t) => n + bill(t), 0);
  const seedTxns = seed.txns.map((t) => (isReleased(t) ? { ...t, status: "done" as const, label: t.label.replace("এসক্রোতে জমা", "পরিশোধিত") } : t));
  // The viewer's own rows are always the newest; ordered separately because
  // the machine clock may be behind the demo's seeded dates.
  const byTime = (a: { at: string }, b: { at: string }) => b.at.localeCompare(a.at);
  const txns = [...[...mine].sort(byTime), ...seedTxns.sort(byTime)];
  return {
    available: Math.max(0, seed.available + delta),
    escrow: seed.escrow - releasedSeed + held,
    lifetime: seed.lifetime,
    txns,
  };
}
