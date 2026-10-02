"use client";

import { useMemo } from "react";
import { DEMO_NOW } from "@/data/media/clock";
import { sampleClassroom } from "@/data/media/classroom";
import { sampleLab } from "@/data/media/labs";
import { sampleProject, sampleProjects } from "@/data/media/research";
import { defaultMilestones, emptyWrite, type ResearchProject } from "@/lib/media/research-project";
import type { RoomRef } from "@/lib/media/showcase";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";

/** Sample rooms are dated round the demo clock; rooms people make run on real time. */
export const roomClock = (from: RoomRef) => (sampleLab(from.id) || sampleClassroom(from.id) ? DEMO_NOW : new Date());

/** Today in Bangladesh, YYYY-MM-DD. */
export const bdToday = (now: Date) => new Date(now.getTime() + 6 * 3_600_000).toISOString().slice(0, 10);

export function useProject(id: string): ResearchProject | undefined {
  const mine = useMediaState((s) => s.projects[id]);
  return mine ?? sampleProject(id);
}

/** A room's research workspaces: the viewer's, then the samples they have not touched. */
export function useRoomProjects(roomId: string): ResearchProject[] {
  const mine = useMediaState((s) => s.projects);
  return useMemo(
    () => [...Object.values(mine).filter((p) => p.from.id === roomId), ...sampleProjects.filter((p) => p.from.id === roomId && !mine[p.id])],
    [mine, roomId],
  );
}

/** Edit a workspace; a sample is copied into the viewer's state first. False if the browser could not save. */
export function editProject(id: string, fn: (p: ResearchProject) => ResearchProject): boolean {
  return updateMedia((s) => {
    const p = s.projects[id] ?? sampleProject(id);
    return p ? { ...s, projects: { ...s.projects, [id]: fn(p) } } : s;
  });
}

/** Start from scratch: the room's members, the viewer leading, a topic poll open until `deadline`. */
export function startProject(input: { from: RoomRef; members: { id: string; name: string }[]; deadline: string; idea?: { title: string; why: string } }, me: { id: string; name: string }): string {
  const id = newId("rp");
  const now = roomClock(input.from);
  const today = bdToday(now);
  const members = input.members.some((m) => m.id === me.id) ? input.members : [{ id: me.id, name: me.name }, ...input.members];
  const project: ResearchProject = {
    id,
    from: input.from,
    members,
    leadId: me.id,
    createdAt: now.toISOString(),
    topicDeadline: input.deadline,
    ideas: input.idea ? [{ id: newId("i"), title: input.idea.title, why: input.idea.why, by: me.id, votes: { [me.id]: "agree" } }] : [],
    milestones: defaultMilestones(today).map((m) => ({ ...m, id: newId("m") })),
    tasks: [],
    files: [],
    write: { ...emptyWrite },
  };
  updateMedia((s) => ({ ...s, projects: { ...s.projects, [id]: project } }));
  return id;
}
