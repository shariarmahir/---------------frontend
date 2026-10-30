"use client";

import { useMemo } from "react";
import { sampleMatches } from "@/data/media/team-matches";
import { teams } from "@/data/media/teams";
import type { Post, Team } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { FORMATS, outcome, resultCaption, sideOf, type TeamMatch } from "@/lib/media/team-match";
import { addStory, canEditRoom, TEAM_CATEGORY, nameTag } from "@/lib/media/team-room";
import { editTeamRoom } from "./use-team-room";

/** Every match: the samples as the viewer left them, then the viewer's own. */
export function useMatches(): TeamMatch[] {
  const mine = useMediaState((s) => s.teamMatches);
  return useMemo(() => {
    const sampleIds = new Set(sampleMatches.map((m) => m.id));
    return [...sampleMatches.map((m) => mine[m.id] ?? m), ...Object.values(mine).filter((m) => !sampleIds.has(m.id))];
  }, [mine]);
}

/** Copy-on-write, like team rooms: the first change copies the sample in. */
export function editMatch(id: string, fn: (m: TeamMatch) => TeamMatch): boolean {
  return updateMedia((s) => {
    const current = s.teamMatches[id] ?? sampleMatches.find((m) => m.id === id);
    return current ? { ...s, teamMatches: { ...s.teamMatches, [id]: fn(current) } } : s;
  });
}

export function addMatch(m: TeamMatch): boolean {
  return updateMedia((s) => ({ ...s, teamMatches: { ...s.teamMatches, [m.id]: m } }));
}

/** Every team the viewer made or sample, by id. */
export function useAllTeams(): Map<string, Team> {
  const made = useMediaState((s) => s.myTeams);
  return useMemo(() => new Map([...made, ...teams].map((t) => [t.id, t])), [made]);
}

/** Teams the viewer can speak for: lead, seed member, creator, or joined. */
export function useMyTeams(): Team[] {
  const all = useAllTeams();
  const status = useMediaState((s) => s.teamStatus);
  return useMemo(() => [...all.values()].filter((t) => canEditRoom(t, currentUser.handle, status[t.id])), [all, status]);
}

/** The viewer's team on one side of this match, if any (home first). */
export function mySide(m: TeamMatch, mine: Team[]): { team: Team; side: "home" | "away" } | undefined {
  for (const team of mine) {
    const side = sideOf(m, team.id);
    if (side) return { team, side };
  }
  return undefined;
}

const names = (m: TeamMatch, all: Map<string, Team>) => ({ home: all.get(m.home)?.name ?? "অজানা দল", away: all.get(m.away)?.name ?? "অজানা দল" });

/** Put a finished match on the feed, credited to the viewer's team. Returns the post id. */
export function shareResult(m: TeamMatch, team: Team, all: Map<string, Team>, num: (n: number) => string): string | undefined {
  const n = names(m, all);
  const post: Post = {
    id: newId("p"),
    kind: "project",
    topic: "team",
    author: currentUser.handle,
    category: TEAM_CATEGORY[team.kind],
    createdAt: new Date().toISOString(),
    caption: resultCaption(m, n, num),
    media: [],
    tags: ["#টিম_বনাম_টিম", `#${FORMATS[m.format].bn.replace(/\s+/g, "_")}`, `#${nameTag(n.home)}`, `#${nameTag(n.away)}`],
    stats: { likes: 0, shares: 0, views: 0 },
    comments: [],
    from: { kind: "team", id: team.id, name: team.name },
  };
  if (!updateMedia((s) => ({ ...s, posts: [post, ...s.posts] }))) return undefined;
  editMatch(m.id, (x) => ({ ...x, postId: post.id }));
  return post.id;
}

/** Write the result into the viewer's team journey: a win is a milestone, anything else a story. */
export function resultToJourney(m: TeamMatch, team: Team, all: Map<string, Team>, side: "home" | "away", num: (n: number) => string) {
  const o = outcome(m);
  if (!o || !m.score) return;
  const n = names(m, all);
  const other = side === "home" ? n.away : n.home;
  const won = o === side;
  const title = o === "draw" ? `${other}-এর সাথে ড্র` : won ? `${other}-কে হারালাম` : `${other}-এর কাছে হার — পরের বার`;
  const body = `${FORMATS[m.format].bn} · ${m.title}\n${n.home} ${num(m.score.home)} – ${num(m.score.away)} ${n.away}`;
  editTeamRoom(team.id, (r) =>
    addStory(r, { id: newId("st"), kind: won ? "journey" : "story", title, body, by: currentUser.handle, byName: currentUser.nameBn, at: new Date().toISOString() }),
  );
}
