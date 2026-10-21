/**
 * কাণ্ডারী HQ — the company's own control room (Mahir, 2026-10-21): the
 * super prime admin's command centre, every member's TaskBook, teams, chat,
 * calendars, HR, clients, finance, the site's content and the
 * Kandari Shongbidhan. Self-contained under /hq (app/hq, components/hq,
 * lib/hq, data/hq) like /media, so it can move to its own repo.
 *
 * These types are the one contract every page and domain builds on. The
 * whole database is one JSON document on the server (lib/hq/server/store.ts)
 * until the FastAPI + Postgres backend exists; a member's browser only ever
 * sees `HqView`, the slice their access allows (lib/hq/view.ts).
 */

/** An ISO-8601 timestamp. */
export type Iso = string;
/** A Dhaka calendar day, "2026-10-21". */
export type Day = string;

/* ───────────────────────── people & access ───────────────────────── */

/**
 * What a member may do beyond their own TaskBook. The super prime admin has
 * every permission always and is the only one who may grant them
 * (`access.grant` can never be granted).
 */
export type Perm =
  | "people.manage" // designations, promote/demote, approve ID applications
  | "tasks.publish" // post task tickets
  | "tasks.approve" // approve solo TaskBooks and task plans
  | "tasks.review" // review submissions, award merits
  | "teams.approve" // approve new teams
  | "attendance.manage" // leave, late counts, office hours
  | "finance.view"
  | "finance.edit"
  | "clients.view"
  | "clients.manage"
  | "hr.manage" // HR CRM: project rooms, documents, groups, reports to the CEO
  | "content.manage" // the public site's ads, images, cards, videos, products
  | "shongbidhan.judge" // decide Shongbidhan cases
  | "reports.view" // company-wide reports and analytics
  | "audit.view"; // the security log

/** Where someone sits; the designation text itself is free (set by the prime admin). */
export type Level = "prime" | "chief" | "hr" | "lead" | "client-manager" | "member" | "intern";

export type Dept = "leadership" | "creative" | "dev" | "iot" | "ops" | "hr" | "client" | "rnd" | "finance";

export interface DesignationChange {
  at: Iso;
  from: string;
  to: string;
  fromLevel: Level;
  toLevel: Level;
  by: string;
  note?: string;
}

export interface Person {
  id: string;
  /** Latin name as on the team page. */
  name: string;
  nameBn: string;
  /** "kandari-ishtiak-001-26": name, serial, year joined. */
  memberId: string;
  /** "kandari@ishtiak-creatives": the sign-in username. */
  handle: string;
  designation: string;
  level: Level;
  dept: Dept;
  skills: string[];
  /** Skills they want to learn through weekly projects. */
  learning: string[];
  photo?: string | null;
  email?: string | null;
  phone?: string | null;
  /** Monthly wage in BDT, for the Shongbidhan's fine cap; prime/HR only see it. */
  wage?: number;
  perms: Perm[];
  status: "active" | "suspended" | "left";
  joinedAt: Iso;
  /** Accepted connections (every Kandari is everyone's friend, but they still say yes). */
  connections: string[];
  /** Connection requests they have sent and not had answered. */
  asked: string[];
  history: DesignationChange[];
  /** Has a sign-in account (applied and was approved, or the prime admin). */
  hasAccount: boolean;
  sample?: true;
}

/** Server-only: never leaves lib/hq/server. */
export interface Account {
  id: string;
  personId: string;
  email: string;
  handle: string;
  /** scrypt, hex. */
  passHash: string;
  salt: string;
  /** The enrolled 128-number face signature (face-api), never a photo. */
  face: number[] | null;
  faceAt: Iso | null;
  failures: number;
  lockedUntil: Iso | null;
  createdAt: Iso;
  lastLoginAt: Iso | null;
  /** Bumped by "sign out everywhere"; sessions carry the epoch they were made in. */
  epoch: number;
}

/** A request for a member ID and password (CLAUDE: only the prime admin sets designations). */
export interface Application {
  id: string;
  name: string;
  nameBn: string;
  email: string;
  phone: string;
  /** Proposed username, "kandari@name-dept". */
  handle: string;
  dept: Dept;
  skills: string[];
  note: string;
  /** Server-only fields, stripped from every view. */
  passHash?: string;
  salt?: string;
  face?: number[] | null;
  at: Iso;
  status: "pending" | "approved" | "rejected";
  decidedBy?: string;
  decidedAt?: Iso;
  reason?: string;
  /** Approved into this person. */
  personId?: string;
}

export type AuditKind =
  | "login"
  | "login-fail"
  | "locked"
  | "face-ok"
  | "face-fail"
  | "face-enrolled"
  | "logout"
  | "apply"
  | "perm"
  | "designation"
  | "approve"
  | "reject"
  | "export"
  | "delete";

export interface AuditEntry {
  id: string;
  at: Iso;
  kind: AuditKind;
  actor?: string;
  target?: string;
  ip?: string;
  ua?: string;
  detail?: string;
}

/* ───────────────────────── tasks & the TaskBook ───────────────────────── */

/** The task board's lanes, most pressing first. */
export type Priority = "immediate" | "urgent" | "today" | "tomorrow" | "this-week" | "next-week" | "later";
export type Risk = "low" | "medium" | "high";
export type TaskKind = "work" | "client" | "research" | "learning";
export type TaskStatus = "open" | "taken" | "in-progress" | "submitted" | "client-review" | "done" | "cancelled";

export type MilestoneKind = "meeting" | "discussion" | "build" | "testing" | "review" | "submit" | "custom";
export interface Milestone {
  id: string;
  kind: MilestoneKind;
  title: string;
  at: Iso;
  done: boolean;
  doneAt?: Iso;
}

export type NoteKind = "text" | "heading" | "check" | "code" | "file" | "link" | "quote";
export interface NoteBlock {
  id: string;
  kind: NoteKind;
  text: string;
  checked?: boolean;
  fileId?: string;
  by: string;
  at: Iso;
}

export type MeritKind =
  | "risk-taken"
  | "accuracy"
  | "responsibility"
  | "uniqueness"
  | "brilliant"
  | "best-way"
  | "kindness"
  | "teamwork"
  | "leadership"
  | "never-give-up";

export interface Merit {
  kind: MeritKind;
  points: number;
  to: string;
  by: string;
  at: Iso;
  note?: string;
}

export interface Review {
  by: string;
  /** 0–5 overall. */
  score: number;
  /** 0–5: did it do what was asked, correctly. */
  accuracy: number;
  note?: string;
  at: Iso;
}

export interface Task {
  id: string;
  /** "KT-0012". */
  code: string;
  title: string;
  brief: string;
  kind: TaskKind;
  priority: Priority;
  risk: Risk;
  skills: string[];
  mode: "solo" | "team" | "either";
  createdBy: string;
  createdAt: Iso;
  due: Iso;
  estimateHours: number;
  clientId?: string;
  projectId?: string;
  status: TaskStatus;
  /** Solo taker, or the team's leader. */
  takenBy?: string;
  teamId?: string;
  takenAt?: Iso;
  milestones: Milestone[];
  notebook: NoteBlock[];
  fileIds: string[];
  /** Members the taker shared the notebook with. */
  sharedWith: string[];
  submittedAt?: Iso;
  submission?: { summary: string; link?: string; fileIds: string[] };
  review?: Review;
  clientReview?: { score: number; note?: string; at: Iso };
  merits: Merit[];
  /** Final points, set when the task is done (lib/hq/scoring.ts). */
  awarded?: number;
  /** A member's self-made solo TaskBook task waits for a lead's approval. */
  approval?: "pending" | "approved" | "rejected";
  /** A weekly learning project for a skill the taker is learning. */
  learningSkill?: string;
  sample?: true;
}

export type PointKind = "task" | "merit" | "badge" | "penalty" | "daily" | "help" | "season";
export interface PointEntry {
  id: string;
  personId: string;
  at: Iso;
  points: number;
  kind: PointKind;
  reason: string;
  taskId?: string;
  caseId?: string;
}

/**
 * Quick Silver: three tasks in a row submitted ahead of time (a hat-trick).
 * Iron Man: a team leader whose team delivered to a client who rated it 4.5+.
 * Man of the day: the best daily report. Luther King: the week's highest
 * Shongbidhan crime points. Shield: a clean, complete week.
 */
export type BadgeKind = "quick-silver" | "iron-man" | "man-of-the-day" | "luther-king" | "shield" | "helper";
export interface Badge {
  id: string;
  personId: string;
  kind: BadgeKind;
  day: Day;
  note?: string;
  taskId?: string;
}

export interface DailyReport {
  id: string;
  personId: string;
  day: Day;
  done: string;
  blockers: string;
  tomorrow: string;
  /** 1–5. */
  mood: number;
  taskIds: string[];
  at: Iso;
  /** 0–10, set by a reviewer. */
  score?: number;
}

export interface Todo {
  id: string;
  personId: string;
  text: string;
  done: boolean;
  due?: Day;
  urgent?: boolean;
  at: Iso;
}

export interface PersonalNote {
  id: string;
  personId: string;
  title: string;
  body: string;
  pinned: boolean;
  color: "navy" | "ink" | "cobalt";
  at: Iso;
}

/* ───────────────────────── teams & help ───────────────────────── */

export interface Invite {
  personId: string;
  at: Iso;
  status: "pending" | "accepted" | "declined";
  /** A decline needs a reasoned note of at least 150 words (DECLINE_MIN_WORDS). */
  reason?: string;
  decidedAt?: Iso;
}

export interface Sticky {
  id: string;
  text: string;
  level: "info" | "urgent" | "crisis";
  by: string;
  at: Iso;
  resolved?: boolean;
}

export interface Team {
  id: string;
  name: string;
  purpose: string;
  leaderId: string;
  memberIds: string[];
  invites: Invite[];
  taskIds: string[];
  clientId?: string;
  status: "pending" | "active" | "archived" | "rejected";
  createdAt: Iso;
  approvedBy?: string;
  /** The team's chat room. */
  channelId?: string;
  stickies: Sticky[];
  /** What the leader told the client, newest last. */
  clientUpdates: { id: string; text: string; by: string; at: Iso }[];
}

export interface HelpRequest {
  id: string;
  by: string;
  taskId?: string;
  title: string;
  detail: string;
  skills: string[];
  /** Everyone whose skills match, asked at once. */
  capable: string[];
  /** Capable members who opened it. */
  seen: string[];
  helperId?: string;
  status: "open" | "helping" | "solved" | "expired";
  at: Iso;
  deadline: Iso;
}

/* ───────────────────────── chat ───────────────────────── */

export type ChannelKind = "channel" | "dm" | "team" | "project" | "issue" | "group";
export interface Channel {
  id: string;
  kind: ChannelKind;
  name: string;
  topic: string;
  /** Empty on a public channel means everyone. */
  memberIds: string[];
  private: boolean;
  createdBy: string;
  at: Iso;
  /** The team, project, issue or client it belongs to. */
  refId?: string;
  archived?: boolean;
}

export interface Message {
  id: string;
  channelId: string;
  by: string;
  text: string;
  at: Iso;
  editedAt?: Iso;
  /** A reply in the thread of this message. */
  threadOf?: string;
  fileIds: string[];
  /** emoji → person ids. */
  reactions: Record<string, string[]>;
  mentions: string[];
  /** "@urgent" or "!জরুরি": shown red and pushed as an alert. */
  urgent: boolean;
  pinned?: boolean;
  deleted?: boolean;
}

/* ───────────────────────── calendar, attendance, alerts ───────────────────────── */

export type EventKind = "meeting" | "deadline" | "client" | "training" | "holiday" | "leave" | "personal";
export interface CalEvent {
  id: string;
  kind: EventKind;
  title: string;
  start: Iso;
  end: Iso;
  allDay: boolean;
  attendees: string[];
  by: string;
  location?: string;
  link?: string;
  /** Alarm minutes before the start, e.g. [30, 5]. */
  alerts: number[];
  taskId?: string;
  teamId?: string;
  note?: string;
  sample?: true;
}

export type NoticeKind = "mention" | "urgent" | "invite" | "approval" | "meeting" | "help" | "task" | "case" | "badge" | "system";
export interface Notice {
  id: string;
  to: string;
  at: Iso;
  kind: NoticeKind;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
}

export interface Checkin {
  id: string;
  personId: string;
  day: Day;
  in: Iso;
  out?: Iso;
  late: boolean;
  /** Minutes after the office start (with grace) they came in. */
  lateMins: number;
}

export interface LeaveRequest {
  id: string;
  personId: string;
  from: Day;
  to: Day;
  kind: "casual" | "sick" | "annual" | "unpaid";
  reason: string;
  status: "pending" | "approved" | "rejected";
  at: Iso;
  decidedBy?: string;
}

export interface OfficeSettings {
  /** "10:00", Dhaka time. */
  start: string;
  end: string;
  graceMins: number;
  /** Day numbers off each week, 0 = Sunday … 5 = Friday, 6 = Saturday. */
  weekend: number[];
  holidays: { day: Day; name: string }[];
  leaveDays: { casual: number; sick: number; annual: number };
}

/* ───────────────────────── Shongbidhan ───────────────────────── */

export type PenaltyKind = "warning" | "points" | "treat" | "duty" | "fine";
export interface Article {
  id: string;
  /** Part (অধ্যায়), e.g. "ক". */
  part: string;
  /** Article number (অনুচ্ছেদ) and section (ধারা): "৩", "১০৪". */
  article: string;
  section: string;
  title: string;
  text: string;
  penalty: { kind: PenaltyKind; text: string; amount?: number };
  /** Crime points a guilty verdict adds. */
  crimePoints: number;
}

export interface Case {
  id: string;
  articleId: string;
  accusedId: string;
  byId: string;
  at: Iso;
  evidence: string;
  fileIds: string[];
  /** The accused's answer: every case gets one before a verdict. */
  showCause?: { text: string; at: Iso };
  verdict?: { guilty: boolean; by: string; at: Iso; note: string; fine?: number };
  appeal?: { text: string; at: Iso; outcome?: "upheld" | "overturned"; by?: string };
  status: "filed" | "answered" | "decided" | "appealed" | "closed";
  /** From an unanswered help request. */
  helpId?: string;
}

/* ───────────────────────── issues ───────────────────────── */

export interface Issue {
  id: string;
  title: string;
  detail: string;
  by: string;
  at: Iso;
  memberIds: string[];
  channelId?: string;
  status: "open" | "discussing" | "solved";
  solution?: string;
  lesson?: string;
  solvedAt?: Iso;
}

/* ───────────────────────── clients, HR documents ───────────────────────── */

export type Stage = "lead" | "first-meeting" | "proposal" | "confirmed" | "in-progress" | "delivered" | "reviewed" | "lost";
export interface Client {
  id: string;
  name: string;
  org: string;
  contact: { name: string; phone: string; email: string };
  sector: string;
  stage: Stage;
  /** Expected or agreed value, BDT. */
  value: number;
  source: string;
  notes: string;
  createdAt: Iso;
  stageAt: Iso;
  managerId?: string;
  leadId?: string;
  teamId?: string;
  onboarding: { id: string; item: string; done: boolean }[];
  review?: { score: number; text: string; at: Iso };
  sample?: true;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  budget: number;
  start: Day;
  due: Day;
  teamId?: string;
  managerId?: string;
  status: "setup" | "running" | "delivered" | "closed";
  /** HR's discussion room, opened the moment the client confirms. */
  channelId?: string;
  /** HR → client manager and team leader handover. */
  handedOver?: { at: Iso; by: string; to: string[] };
  sample?: true;
}

export type DocKind = "quotation" | "invoice" | "challan" | "mushok-6.3" | "contract" | "receipt";
export interface Doc {
  id: string;
  kind: DocKind;
  /** "INV-2026-0007". */
  number: string;
  clientId: string;
  projectId?: string;
  date: Day;
  lines: { item: string; qty: number; rate: number }[];
  vatPct: number;
  status: "draft" | "sent" | "paid" | "void";
  by: string;
  at: Iso;
  sample?: true;
}

/* ───────────────────────── finance ───────────────────────── */

export type PayMethod = "bank" | "cash" | "bkash" | "nagad" | "card";
export interface Txn {
  id: string;
  day: Day;
  kind: "income" | "expense";
  category: string;
  amount: number;
  clientId?: string;
  projectId?: string;
  note: string;
  method: PayMethod;
  by: string;
  at: Iso;
  sample?: true;
}

/* ───────────────────────── site content, orders, approvals ───────────────────────── */

export type ContentKind = "ad" | "banner" | "image" | "card" | "section" | "video" | "product" | "service" | "category" | "email";
export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  body: string;
  fileId?: string;
  url?: string;
  categoryId?: string;
  price?: number;
  /** Where on the site it belongs ("home/hero", "products"…). */
  slot?: string;
  status: "draft" | "pending" | "live" | "archived";
  order: number;
  by: string;
  at: Iso;
  approvedBy?: string;
  sample?: true;
}

export interface Order {
  id: string;
  itemId: string;
  customer: string;
  phone: string;
  qty: number;
  amount: number;
  status: "new" | "accepted" | "rejected" | "delivered";
  at: Iso;
  sample?: true;
}

/** One inbox for everything that waits on a yes or no. */
export type RequestKind = "application" | "team" | "solo-taskbook" | "research" | "service" | "leave" | "content" | "designation";
export interface Approval {
  id: string;
  kind: RequestKind;
  title: string;
  detail?: string;
  /** The application, team, task, leave, content item… it decides. */
  refId: string;
  by: string;
  at: Iso;
  /** Who may decide: a permission (the prime admin always may). */
  perm: Perm;
  status: "pending" | "accepted" | "rejected";
  decidedBy?: string;
  decidedAt?: Iso;
  note?: string;
}

/* ───────────────────────── the wall ───────────────────────── */

export interface Story {
  id: string;
  title: string;
  taskId?: string;
  teamId?: string;
  clientId?: string;
  challenge: string;
  solution: string;
  why: string;
  moments: { at: Iso; text: string }[];
  fileIds: string[];
  by: string;
  at: Iso;
  cheers: string[];
  sample?: true;
}

/* ───────────────────────── files ───────────────────────── */

export interface FileMeta {
  id: string;
  name: string;
  type: string;
  size: number;
  by: string;
  at: Iso;
  /** Who may download it: everyone signed in, or these people. */
  visibleTo: "all" | string[];
}

/* ───────────────────────── the database ───────────────────────── */

export interface HqDb {
  version: number;
  seededAt: Iso;
  /** Next serial per prefix ("KT", "INV", "member"). */
  seq: Record<string, number>;
  people: Person[];
  accounts: Account[];
  applications: Application[];
  audit: AuditEntry[];
  tasks: Task[];
  points: PointEntry[];
  badges: Badge[];
  reports: DailyReport[];
  todos: Todo[];
  notes: PersonalNote[];
  teams: Team[];
  help: HelpRequest[];
  channels: Channel[];
  messages: Message[];
  /** `${personId}:${channelId}` → when they last read it. */
  reads: Record<string, Iso>;
  events: CalEvent[];
  notices: Notice[];
  checkins: Checkin[];
  leaves: LeaveRequest[];
  office: OfficeSettings;
  articles: Article[];
  cases: Case[];
  issues: Issue[];
  clients: Client[];
  projects: Project[];
  docs: Doc[];
  txns: Txn[];
  content: ContentItem[];
  orders: Order[];
  approvals: Approval[];
  stories: Story[];
  files: FileMeta[];
}

/** The signed-in member as their browser knows them. */
export interface Me {
  person: Person;
  /** Every permission they hold (all of them for the prime admin). */
  perms: Perm[];
  isPrime: boolean;
  faceEnrolled: boolean;
}

/**
 * What one member's browser receives: the database minus the server-only
 * parts (accounts, password hashes, face signatures) and minus what their
 * access doesn't cover (finance, clients, audit, other people's DMs…).
 */
export type HqView = Omit<HqDb, "accounts"> & { me: Me; now: Iso };
