"use client";

import { useMemo } from "react";
import { sampleTeamRooms } from "@/data/media/team-rooms";
import { teamKindBn, teams } from "@/data/media/teams";
import type { Post, Team } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { EMPTY_ROOM, storyCaption, storyTags, TEAM_CATEGORY, type StoryKind, type TeamRoom, type TeamStory } from "@/lib/media/team-room";

/** A team the viewer made, or a sample one. */
export function useTeam(id: string): Team | undefined {
  const made = useMediaState((s) => s.myTeams);
  return made.find((t) => t.id === id) ?? teams.find((t) => t.id === id);
}

/** The room as the viewer last left it, else the sample, else empty. */
export function useTeamRoom(id: string): TeamRoom {
  const mine = useMediaState((s) => s.teamRooms[id]);
  return mine ?? sampleTeamRooms[id] ?? EMPTY_ROOM;
}

/** Copy-on-write: the first change copies the sample room into the store. */
export function editTeamRoom(id: string, fn: (room: TeamRoom) => TeamRoom): boolean {
  return updateMedia((s) => ({ ...s, teamRooms: { ...s.teamRooms, [id]: fn(s.teamRooms[id] ?? sampleTeamRooms[id] ?? EMPTY_ROOM) } }));
}

/** Lead or member of this team (by seed, by creating it, or by joining). */
export function useCanEdit(team: Team | undefined): boolean {
  const status = useMediaState((s) => (team ? s.teamStatus[team.id] : undefined));
  if (!team) return false;
  return team.lead === currentUser.handle || team.members.includes(currentUser.handle) || status === "member";
}

/**
 * Put a journey, story, mission or goal on the feed, credited to the team.
 * Returns the post id, or undefined when the browser could not save it.
 */
export function shareTeamPost(team: Team, s: { kind: StoryKind; title: string; body: string; photo?: string }): string | undefined {
  const post: Post = {
    id: newId("p"),
    kind: "project",
    topic: "team",
    author: currentUser.handle,
    category: TEAM_CATEGORY[team.kind],
    createdAt: new Date().toISOString(),
    caption: storyCaption(s, team.name),
    media: s.photo ? [{ kind: "image", label: s.title, ratio: "4/3", src: s.photo }] : [],
    tags: [...storyTags(s.kind, team.name, s.title), `#${teamKindBn[team.kind].replace(/\s+/g, "_")}`],
    stats: { likes: 0, shares: 0, views: 0 },
    comments: [],
    from: { kind: "team", id: team.id, name: team.name },
  };
  return updateMedia((st) => ({ ...st, posts: [post, ...st.posts] })) ? post.id : undefined;
}

export interface StoryAt {
  story: TeamStory;
  team: Team;
}

/** The newest journeys and stories across every team, for the hub's strip. */
export function useLatestStories(limit = 10): StoryAt[] {
  const rooms = useMediaState((s) => s.teamRooms);
  const made = useMediaState((s) => s.myTeams);
  return useMemo(() => {
    const all = [...made, ...teams];
    const out: StoryAt[] = [];
    for (const team of all) {
      const room = rooms[team.id] ?? sampleTeamRooms[team.id];
      if (room) for (const story of room.stories) out.push({ story, team });
    }
    return out.sort((a, b) => b.story.at.localeCompare(a.story.at)).slice(0, limit);
  }, [rooms, made, limit]);
}
