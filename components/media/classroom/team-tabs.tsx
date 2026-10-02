"use client";

import { useState } from "react";
import { classDuties } from "@/lib/media/teamwork";
import { DutyBoard } from "./duty-board";
import type { ClassTab } from "./room";
import { ShareDialog, ShowcasePanel, type SharePreset } from "./share-work";
import { classNow, classRota, editClassRota, editClassroom } from "./use-classroom";

export const DutyTab: ClassTab = ({ room, me, member, leader }) => (
  <DutyBoard
    team={room.name}
    members={room.members}
    rota={classRota(room)}
    seed={room.id}
    now={classNow(room.id)}
    meId={me?.id}
    member={member}
    leader={leader}
    onChange={(fn) => editClassRota(room.id, fn)}
    defaults={classDuties(room.routine.map((s) => s.day))}
  />
);

export const ShowTab: ClassTab = ({ room, me, member }) => {
  const [sharing, setSharing] = useState<SharePreset | null>(null);
  return (
    <>
      <ShowcasePanel shares={room.shares ?? []} canShare={member} onShare={() => setSharing({ kind: "innovation" })} />
      <ClassShareDialog room={room} me={me} preset={sharing} onClose={() => setSharing(null)} />
    </>
  );
};

/** The share dialog bound to a classroom: credits go to its members, the record to its shares. */
export function ClassShareDialog({ room, me, preset, onClose }: Pick<Parameters<ClassTab>[0], "room" | "me"> & { preset: SharePreset | null; onClose: () => void }) {
  return (
    <ShareDialog
      open={preset !== null}
      onOpenChange={(o) => !o && onClose()}
      from={{ kind: "classroom", id: room.id, name: room.name }}
      members={room.members}
      meId={me?.id}
      preset={preset ?? undefined}
      onShared={(ref) => editClassroom(room.id, (r) => ({ ...r, shares: [ref, ...(r.shares ?? [])] }))}
    />
  );
}
