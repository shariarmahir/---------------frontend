"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/** The slice of the Web Speech API the helper uses (Chrome, Edge, Safari; not Firefox). */
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

type SpeechWindow = { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

const recognizer = () => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const noop = () => () => {};

export const VOICE_LANGS = [
  { id: "bn-BD", label: "বাংলা" },
  { id: "en-US", label: "English" },
] as const;

/**
 * Speak instead of typing: words appear in the box as they are heard
 * (`onHeard`), and `onDone` gets the whole sentence when the speaker stops.
 */
export function useVoice({ lang, onHeard, onDone, onError }: { lang: string; onHeard: (t: string) => void; onDone: (t: string) => void; onError: (msg: string) => void }) {
  const supported = useSyncExternalStore(noop, () => recognizer() !== null, () => false);
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const said = useRef("");
  const handlers = useRef({ onHeard, onDone, onError });
  useEffect(() => {
    handlers.current = { onHeard, onDone, onError };
  });

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = recognizer();
    if (!Ctor || rec.current) return;
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    said.current = "";
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      said.current = text;
      handlers.current.onHeard(text);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") handlers.current.onError("মাইক্রোফোনের অনুমতি দিন — ব্রাউজারের ঠিকানার ঘরের পাশের তালার চিহ্নে।");
      else if (e.error === "no-speech") handlers.current.onError("কিছু শোনা যায়নি — আবার বলুন।");
      else if (e.error !== "aborted") handlers.current.onError("ভয়েস চালু করা গেল না।");
    };
    r.onend = () => {
      rec.current = null;
      setListening(false);
      const t = said.current.trim();
      if (t) handlers.current.onDone(t);
    };
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      rec.current = null;
      setListening(false);
    }
  }, [lang]);

  useEffect(() => () => rec.current?.abort(), []);

  return { supported, listening, start, stop };
}

/** Read a reply aloud in a Bangla voice when the device has one. */
export function useSpeaker() {
  const supported = useSyncExternalStore(noop, () => typeof window !== "undefined" && "speechSynthesis" in window, () => false);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(null);
  }, []);

  const speak = useCallback((id: string, text: string) => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const bangla = /[ঀ-৿]/.test(text);
    const u = new SpeechSynthesisUtterance(text.replace(/[•*#]/g, ""));
    u.lang = bangla ? "bn-BD" : "en-US";
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(bangla ? "bn" : "en"));
    if (voice) u.voice = voice;
    u.rate = bangla ? 0.95 : 1;
    u.onend = u.onerror = () => setSpeaking((s) => (s === id ? null : s));
    setSpeaking(id);
    synth.speak(u);
  }, []);

  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, stop };
}
