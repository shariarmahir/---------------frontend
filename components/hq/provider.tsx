"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import { createStore, useStore, type StoreApi } from "zustand";
import type { DomainName } from "@/lib/hq/domains";
import type { FileMeta, HqView } from "@/lib/hq/types";

/**
 * Kandari HQ in the browser: the member's view (HqView, already filtered
 * by the server to what they may see), kept fresh by polling every three
 * seconds while the tab is visible, and `act()` for every change. Every
 * page reads through `useHq` and writes through `useAct`.
 */

interface HqState {
  view: HqView;
  set(view: HqView): void;
}

export class HqActError extends Error {}

const StoreCtx = createContext<StoreApi<HqState> | null>(null);
const ActCtx = createContext<Act | null>(null);

export type Act = <T = unknown>(domain: DomainName, action: string, payload?: unknown, opts?: { quiet?: boolean; ok?: string }) => Promise<T>;

const POLL_MS = 3000;
const HIDDEN_POLL_MS = 15000;

export function HqProvider({ initial, children }: { initial: HqView; children: ReactNode }) {
  const [store] = useState(() => createStore<HqState>((set) => ({ view: initial, set: (view) => set({ view }) })));
  const router = useRouter();
  const signOut = useRef(false);

  const act = useCallback<Act>(async (domain, action, payload = {}, opts: { quiet?: boolean; ok?: string } = {}) => {
    const res = await fetch("/api/hq/act", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain, action, payload }) });
    const data = (await res.json().catch(() => ({}))) as { view?: HqView; result?: unknown; error?: string };
    if (res.status === 401 && !signOut.current) {
      signOut.current = true;
      router.replace("/hq/login");
    }
    if (!res.ok || !data.view) {
      const msg = data.error ?? "That didn't work.";
      if (!opts.quiet) toast.error(msg);
      throw new HqActError(msg);
    }
    store.getState().set(data.view);
    if (opts.ok) toast.success(opts.ok);
    return data.result as never;
  }, [store, router]);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const v = store.getState().view.version;
        const res = await fetch(`/api/hq/snapshot?v=${v}`, { cache: "no-store" });
        if (res.status === 401 && !signOut.current) {
          signOut.current = true;
          router.replace("/hq/login");
          return;
        }
        const data = (await res.json()) as { same?: boolean; view?: HqView };
        if (data.view) store.getState().set(data.view);
      } catch {
        // Offline for a moment: try again on the next beat.
      }
      if (!stop) timer = setTimeout(tick, document.hidden ? HIDDEN_POLL_MS : POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    const wake = () => {
      if (document.hidden) return;
      clearTimeout(timer);
      tick();
    };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    return () => {
      stop = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
    };
  }, [store, router]);

  return (
    <StoreCtx.Provider value={store}>
      <ActCtx.Provider value={act}>{children}</ActCtx.Provider>
    </StoreCtx.Provider>
  );
}

/** The member's view, or a slice of it (pass a selector to re-render only when that slice changes). */
export function useHq(): HqView;
export function useHq<T>(select: (v: HqView) => T): T;
export function useHq<T>(select?: (v: HqView) => T) {
  const store = useContext(StoreCtx);
  if (!store) throw new Error("useHq outside HqProvider");
  return useStore(store, (s) => (select ? select(s.view) : s.view));
}

/** `act(domain, action, payload)`: runs on the server, refreshes the view, toasts the error on failure. */
export function useAct(): Act {
  const act = useContext(ActCtx);
  if (!act) throw new Error("useAct outside HqProvider");
  return act;
}

/** Uploads a file (25 MB max); `visibleTo` limits who can open it. */
export async function uploadFile(file: File, visibleTo?: string[]): Promise<FileMeta> {
  const form = new FormData();
  form.set("file", file);
  if (visibleTo) form.set("visibleTo", JSON.stringify(visibleTo));
  const res = await fetch("/api/hq/files", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { file?: FileMeta; error?: string };
  if (!res.ok || !data.file) {
    const msg = data.error ?? "The file couldn't be uploaded.";
    toast.error(msg);
    throw new HqActError(msg);
  }
  return data.file;
}

export const fileUrl = (id: string, download = false) => `/api/hq/files/${id}${download ? "?download" : ""}`;

/* A shared clock: components re-render on the beat they ask for, without effects. */
const listeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;
function subscribe(cb: () => void) {
  listeners.add(cb);
  clockTimer ??= setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

/** Now, in ms, rounded to `stepMs` (1s for countdowns, 60s for "5 minutes ago"). Server render uses the view's time. */
export function useNow(stepMs = 60_000): number {
  const serverNow = useHq((v) => v.now);
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / stepMs) * stepMs,
    () => Math.floor(Date.parse(serverNow) / stepMs) * stepMs,
  );
}
