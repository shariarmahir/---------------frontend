import { isEmail, normalizeEmail, normalizePhone, validName } from "../auth/validate.ts";

/**
 * Requests to read an R&D project's full research, made from the home
 * page's R&D rows: who is asking, how to reach them, and why. A request is
 * pending until the lab approves it.
 *
 * No backend yet, so the mock gateway stands in for the lab's review: a
 * request counts as approved once REVIEW_MS has passed. Swap statusOf for
 * the server's answer when there is one; the rest is the contract.
 */

export const ACCESS_ROLES = {
  student: "Student",
  researcher: "Researcher / faculty",
  industry: "Industry partner",
  investor: "Investor",
  press: "Press",
  other: "Other",
} as const;

export type AccessRole = keyof typeof ACCESS_ROLES;
export type AccessStatus = "none" | "pending" | "approved";

export interface AccessInput {
  name: string;
  /** An email address or a Bangladeshi mobile number. */
  contact: string;
  role: AccessRole | "";
  reason: string;
}

export interface AccessRequest {
  project: string;
  name: string;
  contact: string;
  role: AccessRole;
  reason: string;
  /** When it was sent, ms since the epoch. */
  at: number;
}

export type AccessErrors = Partial<Record<keyof AccessInput, string>>;

/** The mock review time. */
export const REVIEW_MS = 2 * 60_000;
export const REASON_MIN = 20;
export const REASON_MAX = 500;

export const isAccessRole = (v: unknown): v is AccessRole => typeof v === "string" && Object.hasOwn(ACCESS_ROLES, v);

/** The contact in canonical form (lower-case email, 01XXXXXXXXX), or null if it is neither. */
export function normalizeContact(raw: string): string | null {
  const v = raw.trim();
  if (v.includes("@")) return isEmail(v) ? normalizeEmail(v) : null;
  return normalizePhone(v);
}

export function checkAccess(input: AccessInput): AccessErrors {
  const errors: AccessErrors = {};
  if (!validName(input.name)) errors.name = "Enter your full name.";
  if (!normalizeContact(input.contact)) errors.contact = "Enter an email address or a Bangladeshi mobile number.";
  if (!isAccessRole(input.role)) errors.role = "Choose who you are.";
  const reason = input.reason.trim();
  if (reason.length < REASON_MIN) errors.reason = `Tell us why in a sentence or two (at least ${REASON_MIN} characters).`;
  else if (reason.length > REASON_MAX) errors.reason = `Keep it under ${REASON_MAX} characters.`;
  return errors;
}

export function makeRequest(
  project: string,
  input: AccessInput,
  now: number,
): { ok: true; request: AccessRequest } | { ok: false; errors: AccessErrors } {
  const errors = checkAccess(input);
  const contact = normalizeContact(input.contact);
  if (Object.keys(errors).length > 0 || !contact || !isAccessRole(input.role)) return { ok: false, errors };
  return {
    ok: true,
    request: { project, name: input.name.trim(), contact, role: input.role, reason: input.reason.trim(), at: now },
  };
}

export function statusOf(request: AccessRequest | undefined, now: number): AccessStatus {
  if (!request) return "none";
  return now - request.at >= REVIEW_MS ? "approved" : "pending";
}

/** Saved requests by project, keeping only well-formed entries (storage is not trusted). */
export function parseRequests(raw: unknown): Record<string, AccessRequest> {
  const out: Record<string, AccessRequest> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [key, v] of Object.entries(raw)) {
    if (!v || typeof v !== "object") continue;
    const r = v as Record<string, unknown>;
    if (
      r.project === key &&
      typeof r.name === "string" &&
      typeof r.contact === "string" &&
      typeof r.reason === "string" &&
      isAccessRole(r.role) &&
      typeof r.at === "number" &&
      Number.isFinite(r.at)
    ) {
      out[key] = { project: key, name: r.name, contact: r.contact, role: r.role, reason: r.reason, at: r.at };
    }
  }
  return out;
}
