import { LEVEL_LABEL, LEVEL_PRESET } from "../../lib/hq/rules.ts";
import type { Dept, Level, Person } from "../../lib/hq/types.ts";

/**
 * The people of কাণ্ডারী HQ on day one: the roster from the team page
 * (data/team.ts, CLAUDE.md §2) plus Mehek from Mahir's brief. Only the
 * founder has a sign-in account at first; everyone else applies for a member
 * ID and password at /hq/apply and the prime admin links the application
 * to their record. Usernames and member IDs follow Mahir's examples:
 * "kandari@ishtiak-creatives", "kandari-ishtiak-001-26".
 */
interface Seat {
  id: string;
  name: string;
  nameBn: string;
  serial: number;
  handle: string;
  designation: string;
  level: Level;
  dept: Dept;
  skills: string[];
  learning: string[];
  photo?: string;
}

const SEATS: Seat[] = [
  {
    id: "p-mahir",
    name: "Mahir Shariar Mahin",
    nameBn: "মাহির শারিয়ার মাহিন",
    serial: 0,
    handle: "kandari@mahir-ceo",
    designation: "Founder & CEO",
    level: "prime",
    dept: "leadership",
    skills: ["leadership", "iot", "healthcare", "product", "operations"],
    learning: ["finance"],
    photo: "/team/mahir_shariar_mahin.png",
  },
  {
    id: "p-ishtiak",
    name: "Istiake Ahmed",
    nameBn: "ইশতিয়াক আহমেদ",
    serial: 1,
    handle: "kandari@ishtiak-creatives",
    designation: "Idea & Creative Lead",
    level: "lead",
    dept: "creative",
    skills: ["design", "branding", "ideation", "video"],
    learning: ["motion", "3d"],
  },
  {
    id: "p-safia",
    name: "Safia Mubassara Ruzba",
    nameBn: "সাফিয়া মুবাশ্শারা রুজবা",
    serial: 2,
    handle: "kandari@safia-iot",
    designation: "Idea & Creative · IoT",
    level: "member",
    dept: "iot",
    skills: ["iot", "design", "sensors", "research"],
    learning: ["firmware"],
  },
  {
    id: "p-sadman",
    name: "Sadman bin Arif",
    nameBn: "সাদমান বিন আরিফ",
    serial: 3,
    handle: "kandari@sadman-coo",
    designation: "Chief Operating Officer",
    level: "chief",
    dept: "ops",
    skills: ["operations", "planning", "client", "procurement"],
    learning: ["finance"],
    photo: "/team/sadman-bin-arif.jpg",
  },
  {
    id: "p-nabeel",
    name: "Nabeel Shadad",
    nameBn: "নাবিল শাদাদ",
    serial: 4,
    handle: "kandari@nabeel-cmo",
    designation: "Chief Marketing Officer",
    level: "chief",
    dept: "leadership",
    skills: ["marketing", "content", "sales", "branding"],
    learning: ["analytics"],
    photo: "/team/nabeel-shadad.jpg",
  },
  {
    id: "p-luban",
    name: "Luban Ahmed",
    nameBn: "লুবান আহমেদ",
    serial: 5,
    handle: "kandari@luban-dev",
    designation: "Developer — Web, AI & IoT",
    level: "member",
    dept: "dev",
    skills: ["web", "react", "ai", "iot", "backend"],
    learning: ["devops"],
  },
  {
    id: "p-mehek",
    name: "Mehek",
    nameBn: "মেহেক",
    serial: 6,
    handle: "kandari@mehek-dev",
    designation: "Developer",
    level: "member",
    dept: "dev",
    skills: ["web", "react", "testing"],
    learning: ["ai", "backend"],
  },
  {
    id: "p-shabbin",
    name: "Shabbin Ahmed",
    nameBn: "শাব্বিন আহমেদ",
    serial: 7,
    handle: "kandari@shabbin-dev",
    designation: "Developer — App, AI & IoT",
    level: "member",
    dept: "dev",
    skills: ["mobile", "react-native", "ai", "iot"],
    learning: ["design"],
  },
  {
    id: "p-sharul",
    name: "Sharul Bhuiya",
    nameBn: "শারুল ভূঁইয়া",
    serial: 8,
    handle: "kandari@sharul-ops",
    designation: "IoT Engineer · Operations",
    level: "member",
    dept: "iot",
    skills: ["iot", "hardware", "pcb", "operations"],
    learning: ["firmware", "ai"],
  },
  {
    id: "p-jamil",
    name: "Jamil Hossan",
    nameBn: "জামিল হোসেন",
    serial: 9,
    handle: "kandari@jamil-hr",
    designation: "HR & Client Lead",
    level: "hr",
    dept: "hr",
    skills: ["hr", "client", "documentation", "communication"],
    learning: ["finance"],
  },
  {
    id: "p-janassor",
    name: "Janassor Ahmed",
    nameBn: "জানাস্সর আহমেদ",
    serial: 10,
    handle: "kandari@janassor-iot",
    designation: "IoT Engineer",
    level: "member",
    dept: "iot",
    skills: ["iot", "embedded", "sensors", "hardware"],
    learning: ["pcb"],
  },
];

const JOINED = "2026-01-01T04:00:00.000Z";

export function seedPeople(): Person[] {
  const ids = SEATS.map((s) => s.id);
  return SEATS.map((s) => ({
    id: s.id,
    name: s.name,
    nameBn: s.nameBn,
    memberId: `kandari-${s.handle.slice(8).split("-")[0]}-${String(s.serial).padStart(3, "0")}-26`,
    handle: s.handle,
    designation: s.designation,
    level: s.level,
    dept: s.dept,
    skills: s.skills,
    learning: s.learning,
    photo: s.photo ?? null,
    perms: LEVEL_PRESET[s.level],
    status: "active" as const,
    joinedAt: JOINED,
    // Mahir's rule: every Kandari is connected to every other.
    connections: ids.filter((x) => x !== s.id),
    asked: [],
    history: [],
    hasAccount: s.level === "prime",
  }));
}

export const PRIME_ID = "p-mahir";

/**
 * One demo sign-in per level below the super prime admin (that seat is the
 * founder's alone), for trying HQ as each role before the real team has
 * accounts. They exist only while HQ_DEMO_PASSWORD is set
 * (lib/hq/server/demo.ts), share that password, and are marked `demo` so
 * ranks leave them out.
 */
const DEMO: { level: Level; key: string; dept: Dept; skills: string[] }[] = [
  { level: "chief", key: "chief", dept: "leadership", skills: ["leadership", "operations"] },
  { level: "hr", key: "hr", dept: "hr", skills: ["hr", "documentation"] },
  { level: "lead", key: "lead", dept: "creative", skills: ["design", "planning"] },
  { level: "client-manager", key: "client", dept: "client", skills: ["client", "communication"] },
  { level: "member", key: "member", dept: "dev", skills: ["web", "design"] },
  { level: "intern", key: "intern", dept: "rnd", skills: ["research"] },
];

export const DEMO_LOGINS = DEMO.map((d) => ({ level: d.level, handle: `kandari@demo-${d.key}`, email: `demo-${d.key}@kandari-lab.test` }));

export function demoPeople(): Person[] {
  const ids = [...SEATS.map((s) => s.id), ...DEMO.map((d) => `p-demo-${d.key}`)];
  return DEMO.map((d, i) => {
    const id = `p-demo-${d.key}`;
    const name = `Demo ${LEVEL_LABEL[d.level]}`;
    return {
      id,
      name,
      nameBn: name,
      memberId: `kandari-demo-${String(91 + i).padStart(3, "0")}-26`,
      handle: `kandari@demo-${d.key}`,
      designation: `${LEVEL_LABEL[d.level]} (demo)`,
      level: d.level,
      dept: d.dept,
      skills: d.skills,
      learning: [],
      photo: null,
      email: `demo-${d.key}@kandari-lab.test`,
      perms: LEVEL_PRESET[d.level],
      status: "active" as const,
      joinedAt: JOINED,
      connections: ids.filter((x) => x !== id),
      asked: [],
      history: [],
      hasAccount: true,
      demo: true as const,
    };
  });
}

/** Everyone's skill words, for the skill pickers (tasks, help requests, applications). */
export const SKILLS = [
  "leadership",
  "operations",
  "planning",
  "product",
  "design",
  "branding",
  "ideation",
  "video",
  "motion",
  "3d",
  "content",
  "marketing",
  "sales",
  "analytics",
  "web",
  "react",
  "react-native",
  "mobile",
  "backend",
  "devops",
  "testing",
  "ai",
  "iot",
  "embedded",
  "firmware",
  "sensors",
  "hardware",
  "pcb",
  "healthcare",
  "research",
  "client",
  "procurement",
  "hr",
  "documentation",
  "communication",
  "finance",
] as const;
