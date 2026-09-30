/**
 * The mock account gateway, as pure state transitions: every function takes
 * the current AuthDb (plus the clock and a random source) and returns a new
 * one. lib/auth/client.ts persists it in the browser; a real backend would
 * implement the same operations server-side, so the forms do not change.
 *
 * Mock only: the "SMS" code is returned to the caller so the page can show
 * it, and passwords are hashed with a fast non-cryptographic hash so they
 * are not stored as plain text — a real server uses argon2/bcrypt.
 */

import { AUTH_RULES, DEMO_ACCOUNTS, type Account, type NotifyPrefs, type RoleId, type SectorId } from "../../data/auth.ts";
import { identifierKind, isEmail, normalizeEmail, normalizePhone, passwordIssues, toAsciiDigits, validName } from "./validate.ts";

export interface StoredAccount extends Account {
  passwordHash: string;
}

export type SignInMethod = "otp" | "password" | "link" | "signup";

export interface Session {
  accountId: string;
  method: SignInMethod;
  at: number;
  expiresAt: number;
}

export type OtpPurpose = "login" | "signup";

export interface OtpTicket {
  code: string;
  purpose: OtpPurpose;
  sentAt: number;
  expiresAt: number;
  attempts: number;
}

export interface AuthDb {
  version: 1;
  accounts: StoredAccount[];
  session: Session | null;
  /** Pending codes, by normalised phone. */
  otp: Record<string, OtpTicket>;
  /** Phones verified for sign-up → proof expiry. */
  verifiedPhones: Record<string, number>;
  /** One-time sign-in links, by token. */
  links: Record<string, { accountId: string; expiresAt: number }>;
  /** Failed password attempts, by normalised identifier. */
  failures: Record<string, { count: number; until: number }>;
}

export type AuthError =
  | "phone_invalid"
  | "email_invalid"
  | "identifier_invalid"
  | "no_account"
  | "phone_taken"
  | "email_taken"
  | "otp_wrong"
  | "otp_expired"
  | "otp_locked"
  | "otp_cooldown"
  | "phone_unverified"
  | "credentials_wrong"
  | "locked"
  | "password_weak"
  | "name_invalid"
  | "district_missing"
  | "sectors_missing"
  | "link_invalid"
  | "link_expired"
  | "photo_invalid"
  | "not_signed_in";

export const AUTH_ERROR_BN: Record<AuthError, string> = {
  phone_invalid: "সঠিক মোবাইল নম্বর দিন — ১১ অঙ্ক, ০১ দিয়ে শুরু।",
  email_invalid: "সঠিক ইমেইল ঠিকানা দিন।",
  identifier_invalid: "মোবাইল নম্বর বা ইমেইল ঠিকভাবে লিখুন।",
  no_account: "এই নম্বরে কোনো অ্যাকাউন্ট নেই। নতুন অ্যাকাউন্ট খুলুন।",
  phone_taken: "এই নম্বরে আগেই অ্যাকাউন্ট আছে — সাইন ইন করুন।",
  email_taken: "এই ইমেইল আরেকটি অ্যাকাউন্টে ব্যবহৃত।",
  otp_wrong: "কোডটি মেলেনি।",
  otp_expired: "কোডের মেয়াদ শেষ — নতুন কোড নিন।",
  otp_locked: "অনেকবার ভুল কোড দেওয়া হয়েছে — নতুন কোড নিন।",
  otp_cooldown: "একটু অপেক্ষা করুন, তারপর আবার কোড চান।",
  phone_unverified: "আগে মোবাইল নম্বর যাচাই করুন।",
  credentials_wrong: "নম্বর/ইমেইল বা পাসওয়ার্ড মেলেনি।",
  locked: "অনেকবার ভুল পাসওয়ার্ড — কিছুক্ষণ পর চেষ্টা করুন, অথবা কোড দিয়ে ঢুকুন।",
  password_weak: "পাসওয়ার্ড আরও শক্ত করুন।",
  name_invalid: "পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)।",
  district_missing: "জেলা বেছে নিন।",
  sectors_missing: "অন্তত একটি খাত বেছে নিন।",
  link_invalid: "লিংকটি সঠিক নয় বা আগেই ব্যবহার হয়েছে।",
  link_expired: "লিংকের মেয়াদ শেষ — নতুন লিংক নিন।",
  photo_invalid: "ছবিটি নেওয়া গেল না — JPG, PNG বা WebP ছবি দিন।",
  not_signed_in: "আগে সাইন ইন করুন।",
};

export type Result<T> =
  | { ok: true; db: AuthDb; value: T }
  | { ok: false; db: AuthDb; error: AuthError; retryIn?: number; attemptsLeft?: number };

const ok = <T>(db: AuthDb, value: T): Result<T> => ({ ok: true, db, value });
const fail = <T>(db: AuthDb, error: AuthError, extra: { retryIn?: number; attemptsLeft?: number } = {}): Result<T> => ({ ok: false, db, error, ...extra });

/** cyrb53 — a fast 53-bit string hash. Obfuscation for the mock, not security. */
function cyrb53(str: string, seed: number): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function hashPassword(password: string, salt: string): string {
  const s = `${salt}:${password}`;
  return `m1$${cyrb53(s, 1).toString(36)}${cyrb53(s, 7).toString(36)}`;
}

export function publicAccount(stored: StoredAccount): Account {
  const account: Partial<StoredAccount> = { ...stored };
  delete account.passwordHash;
  return account as Account;
}

export function seed(): AuthDb {
  return {
    version: 1,
    accounts: DEMO_ACCOUNTS.map(({ password, ...a }) => ({ ...a, passwordHash: hashPassword(password, a.id) })),
    session: null,
    otp: {},
    verifiedPhones: {},
    links: {},
    failures: {},
  };
}

/** Accepts saved data only if it has the expected shape; otherwise null. */
export function parseDb(raw: unknown): AuthDb | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<AuthDb>;
  if (d.version !== 1 || !Array.isArray(d.accounts)) return null;
  // Demo accounts saved before profile pictures existed pick up their seeded
  // photo; an account that has set or removed one keeps its choice.
  const accounts = (d.accounts as StoredAccount[]).map((a) => {
    const demo = DEMO_ACCOUNTS.find((x) => x.id === a.id);
    return demo && !("photo" in a) && demo.photo ? { ...a, photo: demo.photo } : a;
  });
  return { ...seed(), ...d, accounts } as AuthDb;
}

export const findByPhone = (db: AuthDb, phone: string) => db.accounts.find((a) => a.phone === phone);
export const findByEmail = (db: AuthDb, email: string) => db.accounts.find((a) => a.email === normalizeEmail(email));
export const findById = (db: AuthDb, id: string) => db.accounts.find((a) => a.id === id);

function startSession(db: AuthDb, accountId: string, method: SignInMethod, now: number): AuthDb {
  return { ...db, session: { accountId, method, at: now, expiresAt: now + AUTH_RULES.sessionMs } };
}

export function currentAccount(db: AuthDb, now: number): Account | null {
  const s = db.session;
  if (!s || s.expiresAt <= now) return null;
  const a = findById(db, s.accountId);
  return a ? publicAccount(a) : null;
}

function omit<V>(rec: Record<string, V>, key: string): Record<string, V> {
  return Object.fromEntries(Object.entries(rec).filter(([k]) => k !== key));
}

function randomDigits(n: number, rand: () => number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(rand() * 10);
  return out;
}

function randomToken(rand: () => number): string {
  let out = "";
  for (let i = 0; i < 24; i++) out += Math.floor(rand() * 36).toString(36);
  return out;
}

/* ── Phone OTP ─────────────────────────────────────────────────────── */

export function requestOtp(db: AuthDb, rawPhone: string, purpose: OtpPurpose, now: number, rand: () => number): Result<{ phone: string; code: string; expiresAt: number }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return fail(db, "phone_invalid");
  const exists = !!findByPhone(db, phone);
  if (purpose === "login" && !exists) return fail(db, "no_account");
  if (purpose === "signup" && exists) return fail(db, "phone_taken");
  const prev = db.otp[phone];
  const since = prev ? now - prev.sentAt : Infinity;
  if (since < AUTH_RULES.otpResendMs) return fail(db, "otp_cooldown", { retryIn: Math.ceil((AUTH_RULES.otpResendMs - since) / 1000) });
  const code = randomDigits(AUTH_RULES.otpLength, rand);
  const expiresAt = now + AUTH_RULES.otpTtlMs;
  const next = { ...db, otp: { ...db.otp, [phone]: { code, purpose, sentAt: now, expiresAt, attempts: 0 } } };
  return ok(next, { phone, code, expiresAt });
}

export function verifyOtp(db: AuthDb, rawPhone: string, rawCode: string, now: number): Result<{ purpose: OtpPurpose; account: Account | null }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return fail(db, "phone_invalid");
  const ticket = db.otp[phone];
  if (!ticket || ticket.expiresAt <= now) return fail({ ...db, otp: omit(db.otp, phone) }, "otp_expired");
  const code = toAsciiDigits(rawCode).replace(/\D/g, "");
  if (code !== ticket.code) {
    const attempts = ticket.attempts + 1;
    const left = AUTH_RULES.otpMaxAttempts - attempts;
    if (left <= 0) return fail({ ...db, otp: omit(db.otp, phone) }, "otp_locked");
    return fail({ ...db, otp: { ...db.otp, [phone]: { ...ticket, attempts } } }, "otp_wrong", { attemptsLeft: left });
  }
  const cleared = { ...db, otp: omit(db.otp, phone) };
  if (ticket.purpose === "signup") {
    return ok({ ...cleared, verifiedPhones: { ...cleared.verifiedPhones, [phone]: now + AUTH_RULES.phoneProofMs } }, { purpose: "signup", account: null });
  }
  const account = findByPhone(cleared, phone);
  if (!account) return fail(cleared, "no_account");
  return ok(startSession(cleared, account.id, "otp", now), { purpose: "login", account: publicAccount(account) });
}

/* ── Sign-up ───────────────────────────────────────────────────────── */

export interface SignupInput {
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  role: RoleId;
  district: string;
  sectors: SectorId[];
  products: string[];
  notify: NotifyPrefs;
}

export function register(db: AuthDb, input: SignupInput, now: number, rand: () => number): Result<Account> {
  if (!validName(input.name)) return fail(db, "name_invalid");
  const phone = normalizePhone(input.phone);
  if (!phone) return fail(db, "phone_invalid");
  if (findByPhone(db, phone)) return fail(db, "phone_taken");
  const proof = db.verifiedPhones[phone];
  if (!proof || proof <= now) return fail(db, "phone_unverified");
  const email = input.email?.trim() ? normalizeEmail(input.email) : null;
  if (email && !isEmail(email)) return fail(db, "email_invalid");
  if (email && findByEmail(db, email)) return fail(db, "email_taken");
  if (passwordIssues(input.password, AUTH_RULES.passwordMin, AUTH_RULES.passwordMax).length) return fail(db, "password_weak");
  if (!input.district) return fail(db, "district_missing");
  if (!input.sectors.length) return fail(db, "sectors_missing");

  const id = `acc-${now.toString(36)}${randomToken(rand).slice(0, 4)}`;
  const account: StoredAccount = {
    id,
    name: input.name.trim(),
    phone,
    email,
    role: input.role,
    district: input.district,
    sectors: [...new Set(input.sectors)],
    products: [...new Set(input.products)],
    notify: input.notify,
    mediaHandle: null,
    createdAt: new Date(now).toISOString(),
    passwordHash: hashPassword(input.password, id),
  };
  const next = { ...db, accounts: [...db.accounts, account], verifiedPhones: omit(db.verifiedPhones, phone) };
  return ok(startSession(next, id, "signup", now), publicAccount(account));
}

/* ── Password ──────────────────────────────────────────────────────── */

export function passwordLogin(db: AuthDb, identifier: string, password: string, now: number): Result<Account> {
  const kind = identifierKind(identifier);
  const key = kind === "email" ? (isEmail(identifier) ? normalizeEmail(identifier) : null) : normalizePhone(identifier);
  if (!key) return fail(db, "identifier_invalid");
  const lock = db.failures[key];
  if (lock && lock.until > now) return fail(db, "locked", { retryIn: Math.ceil((lock.until - now) / 1000) });

  const account = kind === "email" ? findByEmail(db, key) : findByPhone(db, key);
  if (!account || hashPassword(password, account.id) !== account.passwordHash) {
    // `until` is 0 while counting; a lockout that has run out starts afresh.
    const count = (lock?.until === 0 ? lock.count : 0) + 1;
    if (count >= AUTH_RULES.passwordMaxFailures) {
      return fail({ ...db, failures: { ...db.failures, [key]: { count: 0, until: now + AUTH_RULES.lockoutMs } } }, "locked", { retryIn: AUTH_RULES.lockoutMs / 1000 });
    }
    return fail({ ...db, failures: { ...db.failures, [key]: { count, until: 0 } } }, "credentials_wrong", { attemptsLeft: AUTH_RULES.passwordMaxFailures - count });
  }
  return ok(startSession({ ...db, failures: omit(db.failures, key) }, account.id, "password", now), publicAccount(account));
}

/* ── One-time email link ───────────────────────────────────────────── */

/**
 * Always succeeds for a well-formed email so the page cannot be used to
 * learn who has an account; `token` is null when nobody does.
 */
export function requestLink(db: AuthDb, rawEmail: string, now: number, rand: () => number): Result<{ token: string | null; expiresAt: number }> {
  if (!isEmail(rawEmail)) return fail(db, "email_invalid");
  const expiresAt = now + AUTH_RULES.linkTtlMs;
  const live = Object.fromEntries(Object.entries(db.links).filter(([, l]) => l.expiresAt > now));
  const account = findByEmail(db, rawEmail);
  if (!account) return ok({ ...db, links: live }, { token: null, expiresAt });
  const token = randomToken(rand);
  return ok({ ...db, links: { ...live, [token]: { accountId: account.id, expiresAt } } }, { token, expiresAt });
}

export function consumeLink(db: AuthDb, token: string, now: number): Result<Account> {
  const link = db.links[token];
  if (!link) return fail(db, "link_invalid");
  const rest = { ...db, links: omit(db.links, token) };
  if (link.expiresAt <= now) return fail(rest, "link_expired");
  const account = findById(rest, link.accountId);
  if (!account) return fail(rest, "link_invalid");
  return ok(startSession(rest, account.id, "link", now), publicAccount(account));
}

/* ── Signed-in account ─────────────────────────────────────────────── */

export function signOut(db: AuthDb): AuthDb {
  return { ...db, session: null };
}

export type AccountPatch = Partial<Pick<Account, "name" | "email" | "role" | "district" | "sectors" | "products" | "notify" | "mediaHandle" | "photo">>;

/** Largest uploaded picture kept, as a data URL (~300 KB of JPEG). */
export const PHOTO_MAX_CHARS = 400_000;

/** A picture is a site path, a small image data URL, or null (placeholder). */
export function validPhoto(photo: string | null): boolean {
  if (photo === null) return true;
  if (/^\/team\/[\w.-]+\.(png|jpe?g|webp)$/i.test(photo)) return true;
  return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) && photo.length <= PHOTO_MAX_CHARS;
}

export function updateAccount(db: AuthDb, now: number, patch: AccountPatch): Result<Account> {
  const me = currentAccount(db, now);
  if (!me) return fail(db, "not_signed_in");
  if (patch.name !== undefined && !validName(patch.name)) return fail(db, "name_invalid");
  let email = me.email;
  if (patch.email !== undefined) {
    email = patch.email?.trim() ? normalizeEmail(patch.email) : null;
    if (email && !isEmail(email)) return fail(db, "email_invalid");
    const other = email ? findByEmail(db, email) : undefined;
    if (other && other.id !== me.id) return fail(db, "email_taken");
  }
  if (patch.district !== undefined && !patch.district) return fail(db, "district_missing");
  if (patch.sectors !== undefined && !patch.sectors.length) return fail(db, "sectors_missing");
  if (patch.photo !== undefined && !validPhoto(patch.photo)) return fail(db, "photo_invalid");
  const accounts = db.accounts.map((a) => (a.id === me.id ? { ...a, ...patch, name: (patch.name ?? a.name).trim(), email } : a));
  const next = { ...db, accounts };
  return ok(next, publicAccount(findById(next, me.id)!));
}

export function changePassword(db: AuthDb, now: number, current: string, nextPassword: string): Result<true> {
  const me = currentAccount(db, now);
  if (!me) return fail(db, "not_signed_in");
  const stored = findById(db, me.id)!;
  if (hashPassword(current, me.id) !== stored.passwordHash) return fail(db, "credentials_wrong");
  if (passwordIssues(nextPassword, AUTH_RULES.passwordMin, AUTH_RULES.passwordMax).length) return fail(db, "password_weak");
  const accounts = db.accounts.map((a) => (a.id === me.id ? { ...a, passwordHash: hashPassword(nextPassword, me.id) } : a));
  return ok({ ...db, accounts }, true);
}

/** Deletes the signed-in account after re-checking its password. */
export function deleteAccount(db: AuthDb, now: number, password: string): Result<true> {
  const me = currentAccount(db, now);
  if (!me) return fail(db, "not_signed_in");
  if (hashPassword(password, me.id) !== findById(db, me.id)!.passwordHash) return fail(db, "credentials_wrong");
  const links = Object.fromEntries(Object.entries(db.links).filter(([, l]) => l.accountId !== me.id));
  return ok({ ...db, accounts: db.accounts.filter((a) => a.id !== me.id), links, session: null }, true);
}
