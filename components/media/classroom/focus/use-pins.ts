"use client";

import { samplePins } from "@/data/media/class-chat";
import { withMark, type Marks, type Pin } from "@/lib/media/class-pins";
import type { NoteColor } from "@/lib/media/notices";
import { updateMedia, useMediaState } from "@/lib/media/store";

const NONE: Pin[] = [];
const NO_MARKS: Marks = {};

/** A room's pins: the viewer's copy once they change anything, else the sample's. */
export function usePins(roomId: string | undefined): Pin[] {
  const mine = useMediaState((s) => (roomId ? s.classPins[roomId] : undefined));
  return mine ?? (roomId ? samplePins[roomId] : undefined) ?? NONE;
}

/** Change a room's pins; a sample's are copied into the viewer's state first. False if the browser could not save. */
export function editPins(roomId: string, fn: (pins: Pin[]) => Pin[]): boolean {
  return updateMedia((s) => ({ ...s, classPins: { ...s.classPins, [roomId]: fn(s.classPins[roomId] ?? samplePins[roomId] ?? []) } }));
}

/** The colour markers the viewer put on a room's messages. */
export function useMarks(roomId: string | undefined): Marks {
  return useMediaState((s) => (roomId ? s.classMarks[roomId] : undefined)) ?? NO_MARKS;
}

/** Mark a message with a colour, or clear it (null, or the same colour again). */
export function markMessage(roomId: string, msgId: string, color: NoteColor | null): boolean {
  return updateMedia((s) => ({ ...s, classMarks: { ...s.classMarks, [roomId]: withMark(s.classMarks[roomId] ?? {}, msgId, color) } }));
}
