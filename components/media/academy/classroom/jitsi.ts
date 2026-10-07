"use client";

/**
 * The few parts of the Jitsi Meet iframe API the live class uses. The room
 * runs on Jitsi's servers; we only load its script and drive it from our
 * own controls. Only the display name goes to it — never an email.
 */
export interface JitsiParticipant {
  participantId: string;
  displayName?: string;
  formattedDisplayName?: string;
}

export interface JitsiApi {
  executeCommand(command: string, ...args: unknown[]): void;
  addListener(event: string, listener: (e: Record<string, unknown>) => void): void;
  getParticipantsInfo(): JitsiParticipant[];
  dispose(): void;
}

type JitsiCtor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiCtor;
  }
}

/**
 * The Jitsi server. The free public meet.jit.si cuts embedded calls after a
 * few minutes and is meant for trying things out; a real academy points this
 * at its own Jitsi server.
 */
export const JITSI_DOMAIN = (process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si").replace(/^https?:\/\//, "").replace(/\/+$/, "");
export const PUBLIC_JITSI = JITSI_DOMAIN === "meet.jit.si";

let loading: Promise<JitsiCtor> | null = null;

/** Load the server's iframe API once per page. */
export function loadJitsi(): Promise<JitsiCtor> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve(window.JitsiMeetExternalAPI);
  loading ??= new Promise<JitsiCtor>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://${JITSI_DOMAIN}/external_api.js`;
    s.async = true;
    s.onload = () => (window.JitsiMeetExternalAPI ? resolve(window.JitsiMeetExternalAPI) : reject(new Error("no api")));
    s.onerror = () => {
      loading = null;
      s.remove();
      reject(new Error("script failed"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** The room in Jitsi's own page, for a new tab. */
export const jitsiUrl = (room: string) => `https://${JITSI_DOMAIN}/${encodeURIComponent(room)}`;
