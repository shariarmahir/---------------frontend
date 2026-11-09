"use client";

import { useSyncExternalStore } from "react";
import { parseRequests, type AccessRequest } from "./access";

/**
 * The browser side of research access requests: kept in localStorage until
 * a backend exists, read through useSyncExternalStore (server render and
 * hydration see none, the saved ones arrive right after), and shared
 * between tabs through the storage event.
 */

const KEY = "kandari-research-access-v1";

let requests: Record<string, AccessRequest> = {};
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    requests = raw ? parseRequests(JSON.parse(raw)) : {};
  } catch {
    // Blocked or broken storage: start empty.
    requests = {};
  }
}

const emit = () => listeners.forEach((l) => l());

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  loaded = false;
  load();
  emit();
}

function subscribe(listener: () => void) {
  if (!loaded) {
    load();
    queueMicrotask(emit);
  }
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** This browser's request for a project, if one was sent. */
export function useAccessRequest(project: string): AccessRequest | undefined {
  return useSyncExternalStore(
    subscribe,
    () => requests[project],
    () => undefined,
  );
}

/** Save a request; false when the browser would not store it. */
export function saveAccessRequest(request: AccessRequest): boolean {
  load();
  const next = { ...requests, [request.project]: request };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  requests = next;
  emit();
  return true;
}
