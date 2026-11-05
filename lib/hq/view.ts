/**
 * What one member's browser may see (HqView): the database minus the
 * server-only parts and minus what their access doesn't cover. Every API
 * response goes through this, so a page can never leak what a member isn't
 * allowed to read even if its own checks are wrong. Pure; tested in
 * view.test.ts.
 */
import { can, permsOf } from "./rules.ts";
import type { Channel, HqDb, HqView, Person } from "./types.ts";

export function channelVisible(c: Channel, personId: string): boolean {
  if (c.memberIds.length === 0 && !c.private) return true;
  return c.memberIds.includes(personId);
}

export function viewFor(db: HqDb, me: Person, now: number, faceEnrolled: boolean): HqView {
  const id = me.id;
  const isPrime = me.level === "prime";
  const seesClients = can(me, "clients.view") || can(me, "hr.manage") || can(me, "finance.view");
  const myTeams = new Set(db.teams.filter((t) => t.leaderId === id || t.memberIds.includes(id)).map((t) => t.id));
  const channels = db.channels.filter((c) => channelVisible(c, id));
  const channelIds = new Set(channels.map((c) => c.id));
  const visibleFile = (f: { visibleTo: "all" | string[] }) => f.visibleTo === "all" || f.visibleTo.includes(id) || isPrime;
  const seesWage = isPrime || can(me, "hr.manage");

  const people: Person[] = db.people.map((p) => (seesWage || p.id === id ? p : { ...p, wage: undefined }));
  const clients = seesClients
    ? db.clients
    : db.clients.filter((c) => c.managerId === id || c.leadId === id || (c.teamId && myTeams.has(c.teamId)));
  const clientIds = new Set(clients.map((c) => c.id));

  const view: HqView = {
    ...db,
    people,
    applications: can(me, "people.manage")
      ? db.applications.map((a) => ({ ...a, passHash: undefined, salt: undefined, face: undefined }))
      : [],
    audit: can(me, "audit.view") ? db.audit.slice(-500) : db.audit.filter((a) => a.actor === id).slice(-50),
    todos: db.todos.filter((t) => t.personId === id),
    notes: db.notes.filter((n) => n.personId === id),
    channels,
    messages: db.messages.filter((m) => channelIds.has(m.channelId)),
    reads: Object.fromEntries(Object.entries(db.reads).filter(([k]) => k.startsWith(`${id}:`))),
    notices: db.notices.filter((n) => n.to === id).slice(-200),
    leaves: can(me, "attendance.manage") ? db.leaves : db.leaves.filter((l) => l.personId === id),
    clients,
    projects: db.projects.filter((p) => clientIds.has(p.clientId)),
    docs: can(me, "hr.manage") || can(me, "finance.view") || can(me, "clients.manage") ? db.docs : [],
    txns: can(me, "finance.view") ? db.txns : [],
    content: can(me, "content.manage") ? db.content : db.content.filter((c) => c.status === "live"),
    orders: can(me, "content.manage") ? db.orders : [],
    approvals: db.approvals.filter((a) => a.by === id || can(me, a.perm)),
    files: db.files.filter(visibleFile),
    me: { person: me, perms: permsOf(me), isPrime, faceEnrolled },
    now: new Date(now).toISOString(),
  } as HqView & { accounts?: unknown };
  delete (view as { accounts?: unknown }).accounts;
  return view;
}
