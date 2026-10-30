"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NONE: Record<string, string> = {};

/**
 * Filters that live in the URL. `setParams` changes some query parameters and
 * keeps the rest (including ?case=); an empty value, or one equal to that
 * parameter's default, removes the parameter. Pass `defaults` as a module-level
 * constant. Uses useSearchParams: render the page inside <Suspense>.
 *
 * router.replace lands a moment later (the new URL is only visible once the
 * navigation commits), so a second change made in that gap must start from
 * the URL the first one asked for, not from window.location: `pending` holds
 * it until the navigation commits.
 */
export function useUrlFilters(defaults: Record<string, string> = NONE) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = params.toString();
  const pending = useRef<{ value: string; from: string } | null>(null);
  /** The last q written to the URL by the search box or Clear (see useSearchBox). */
  const writtenRef = useRef(params.get("q")?.trim() ?? "");

  // Any change of the committed URL means the navigation (ours or another) has landed.
  useEffect(() => {
    if (pending.current && pending.current.from !== current) pending.current = null;
  }, [current]);

  const setParams = useCallback(
    (patch: Record<string, string>) => {
      const from = pending.current ? pending.current.from : window.location.search.replace(/^\?/, "");
      const q = new URLSearchParams(pending.current ? pending.current.value : from);
      for (const [k, v] of Object.entries(patch)) {
        if (v === "" || v === defaults[k]) q.delete(k);
        else q.set(k, v);
      }
      if ("q" in patch) writtenRef.current = patch.q.trim();
      const s = q.toString();
      pending.current = { value: s, from };
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [defaults, pathname, router],
  );
  return { params, setParams, writtenRef };
}

/**
 * A search box kept in step with ?q=. It types locally and reaches the URL after a short pause. A
 * change to ?q= that did not come from this box (a link, back/forward) is copied into the box; what
 * the box itself wrote is never copied back, so a keystroke made in the gap is not overwritten.
 * `clear()` empties the box at once and cancels a write still waiting for its pause; the caller
 * then removes ?q= (with the other filters) through setParams.
 */
export function useSearchBox(qUrl: string, filters: Pick<ReturnType<typeof useUrlFilters>, "setParams" | "writtenRef">): [string, (v: string) => void, () => void] {
  const { setParams, writtenRef } = filters;
  const [text, setText] = useState(qUrl);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (qUrl === writtenRef.current) return;
    writtenRef.current = qUrl;
    setText(qUrl);
  }, [qUrl, writtenRef]);
  useEffect(() => {
    // Nothing to write when the box already holds what was last written (a Clear, or a typed value that landed).
    if (text.trim() === writtenRef.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      setParams({ q: text.trim() });
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [text, setParams, writtenRef]);
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    writtenRef.current = "";
    setText("");
  }, [writtenRef]);
  return [text, setText, clear];
}
