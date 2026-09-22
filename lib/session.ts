"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { MOCK_EMAIL, MOCK_PASSWORD, SESSION_KEY } from "@/data/profile";

/**
 * Mock session handling for the member portal demo.
 *
 * This is deliberately not security: the credentials are in the client
 * bundle and the "session" is a localStorage flag anyone can set from the
 * console. It exists so the login → profile flow is navigable. Swap the
 * whole module for a real auth provider before shipping.
 */

export function verifyCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === MOCK_EMAIL && password === MOCK_PASSWORD;
}

export function startSession(): void {
  try {
    window.localStorage.setItem(SESSION_KEY, String(Date.now()));
  } catch {
    // Private browsing or blocked storage — the redirect still happens, the
    // profile just won't consider the visitor signed in on the next load.
  }
}

export function hasSession(): boolean {
  try {
    return window.localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

export function endSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

// No cross-tab/storage-event sync is needed — the gate only reads the flag
// once per mount — so the subscription is a no-op that never notifies.
function subscribeSession(): () => void {
  return () => {};
}

/** Server has no localStorage, so the session state is unknown until hydration. */
function getServerSession(): undefined {
  return undefined;
}

/**
 * Gate for client-only routes that require the mock session.
 *
 * `useSyncExternalStore` is what lets this read `hasSession()` (a
 * `window`-only external source) without the client's first render
 * diverging from the server's — the server snapshot is `undefined` and the
 * real value appears only once hydration resolves it. The `useEffect`
 * handles the one true side effect, redirecting away when signed out.
 */
export function useSessionGate(): boolean | undefined {
  const router = useRouter();
  const signedIn = useSyncExternalStore(
    subscribeSession,
    hasSession,
    getServerSession,
  );

  useEffect(() => {
    if (signedIn === false) router.replace("/login");
  }, [signedIn, router]);

  return signedIn;
}
