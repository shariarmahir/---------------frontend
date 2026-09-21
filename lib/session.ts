"use client";

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
