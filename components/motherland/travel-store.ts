"use client";

import { useSyncExternalStore } from "react";
import { placeById } from "@/data/motherland-travel";
import type { AddedPlace, CrowdReport } from "@/lib/motherland-reports";

/*
 * What the travel page remembers: the minute, the chosen place (in the
 * address, so it can be shared), and the visitor's marks, crowd reports and
 * added places. All of it stays on this device until accounts arrive.
 */

export const useMinute = () =>
  useSyncExternalStore(
    (cb) => {
      const t = window.setInterval(cb, 30_000);
      return () => window.clearInterval(t);
    },
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );

const readPlace = () => {
  const m = /^#place=([\w-]+)$/.exec(window.location.hash);
  return m && placeById(m[1]) ? m[1] : null;
};

export function usePlace() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("hashchange", cb);
      return () => window.removeEventListener("hashchange", cb);
    },
    readPlace,
    () => null,
  );
}

export function choosePlace(id: string | null) {
  if (id) {
    window.location.hash = `place=${id}`;
  } else {
    window.history.pushState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
}

function deviceStore<T>(key: string, empty: T) {
  let value: T | null = null;
  const listeners = new Set<() => void>();
  const read = () => {
    if (value !== null) return value;
    try {
      value = (JSON.parse(localStorage.getItem(key) ?? "null") as T | null) ?? empty;
    } catch {
      value = empty;
    }
    return value;
  };
  return {
    read,
    write(next: T) {
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* Private mode or a full disk: it still works until the page closes. */
      }
      listeners.forEach((l) => l());
    },
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => void listeners.delete(cb);
    },
    empty: () => empty,
  };
}

export type Mark = "want" | "been" | "avoid";
export const MARK_LABEL: Record<Mark, string> = { want: "Want to go", been: "Been there", avoid: "Avoid" };

const marksStore = deviceStore<Record<string, Mark>>("bd-travel-marks", {});
export const reportsStore = deviceStore<Record<string, CrowdReport>>("bd-travel-reports", {});
export const addedStore = deviceStore<AddedPlace[]>("bd-travel-added", []);

export const useMarks = () => useSyncExternalStore(marksStore.subscribe, marksStore.read, marksStore.empty);
export const useReports = () => useSyncExternalStore(reportsStore.subscribe, reportsStore.read, reportsStore.empty);
export const useAdded = () => useSyncExternalStore(addedStore.subscribe, addedStore.read, addedStore.empty);

export function setMark(id: string, mark: Mark) {
  const next = { ...marksStore.read() };
  if (next[id] === mark) delete next[id];
  else next[id] = mark;
  marksStore.write(next);
}
