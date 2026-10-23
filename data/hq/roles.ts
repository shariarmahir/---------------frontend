import type { Level } from "../../lib/hq/types.ts";

/**
 * What each level is for: the headline of its Command Center and the "Role"
 * card on a profile. The super prime admin is the founder alone and holds
 * every permission; the other levels start from LEVEL_PRESET (lib/hq/rules.ts)
 * and the prime admin adds or removes single permissions per person.
 */
export interface RoleBrief {
  /** The Command Center's name for this level. */
  room: string;
  /** One line: what this person is answerable for. */
  mission: string;
  duties: string[];
}

export const ROLE_BRIEF: Record<Level, RoleBrief> = {
  prime: {
    room: "Command Room",
    mission: "Runs Kandari Lab: every decision, every permission, every number.",
    duties: [
      "Sets direction and decides what waits for approval",
      "Grants and removes access, promotes and demotes",
      "Watches money, clients and the team's pace",
      "Hears Shongbidhan appeals",
    ],
  },
  chief: {
    room: "Operations",
    mission: "Keeps the work moving across every team and unblocks what stalls.",
    duties: [
      "Publishes and prioritises tickets",
      "Reviews submitted work and awards merits",
      "Approves teams and solo TaskBook tasks",
      "Chases overdue and at-risk work",
    ],
  },
  hr: {
    room: "People & Paperwork",
    mission: "Looks after people, office time and every company document.",
    duties: [
      "Attendance, late counts and leave",
      "Member ID applications and personnel records",
      "Project rooms, quotations, invoices, challans and Mushok",
      "The weekly report to the CEO",
    ],
  },
  lead: {
    room: "Team Desk",
    mission: "Leads a team to an early, well-rated delivery.",
    duties: [
      "Builds the team and hands out the work",
      "Reviews the team's submissions",
      "Keeps the client informed",
      "Raises crisis notes before they become late work",
    ],
  },
  "client-manager": {
    room: "Client Desk",
    mission: "Owns each client from the first meeting to the final review.",
    duties: [
      "Moves clients through the pipeline",
      "Keeps follow-ups on time",
      "Turns confirmed clients into projects",
      "Asks every finished client for a review",
    ],
  },
  member: {
    room: "My Desk",
    mission: "Takes tickets that fit, delivers early and helps others.",
    duties: [
      "Takes tickets that match your skills",
      "Submits early and writes the daily report",
      "Answers help requests you can solve",
    ],
  },
  intern: {
    room: "Learning Desk",
    mission: "Learns by shipping real work in a two-and-a-half-month cycle.",
    duties: [
      "Takes learning tickets and weekly learning projects",
      "Writes a daily report every working day",
      "Asks for help early",
      "Earns a paid place with the season's points",
    ],
  },
};

/** An intern cycle (CLAUDE.md §2: rotating interns, 2.5 months). */
export const INTERN_CYCLE_DAYS = 75;
