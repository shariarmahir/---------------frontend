"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QuestionContext } from "@/lib/media/tutor";

export interface Built {
  text: string;
  /** Which one wrote it: Claude, or the offline template. */
  mode: "claude" | "offline";
}

/**
 * Ask the tutor route to turn a student's rough draft into one clear question
 * for the teacher. The words stream in through `onText` as they are written.
 * Resolves to null when nothing came back (offline, a bad request); stopping
 * early keeps what was written so far.
 */
export function useQuestionBuilder() {
  const [building, setBuilding] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const build = useCallback(async (ctx: QuestionContext, onText: (text: string) => void): Promise<Built | null> => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setBuilding(true);
    let text = "";
    let mode: Built["mode"] = "claude";
    try {
      const res = await fetch("/media/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "question", question: ctx }),
        signal: ctrl.signal,
      });
      const header = res.headers.get("X-Tutor-Mode");
      if (!res.ok || !res.body || !header) return null;
      mode = header === "offline" ? "offline" : "claude";
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        onText(text);
      }
      text += dec.decode();
      return { text: text.trim(), mode };
    } catch {
      return ctrl.signal.aborted && text.trim() ? { text: text.trim(), mode } : null;
    } finally {
      if (abort.current === ctrl) {
        abort.current = null;
        setBuilding(false);
      }
    }
  }, []);

  const stop = useCallback(() => abort.current?.abort(), []);
  useEffect(() => () => abort.current?.abort(), []);

  return { building, build, stop };
}
