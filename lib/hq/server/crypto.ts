/**
 * Passwords (scrypt), signed session tokens (HMAC-SHA256) and face
 * signature matching for কাণ্ডারী HQ. Server-only.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./store";

export { hashPassword, verifyPassword } from "./password";

/** HQ_SESSION_SECRET; in development one is made once and kept beside the data. */
function secret(): Buffer {
  const env = process.env.HQ_SESSION_SECRET;
  if (env && env.length >= 32) return Buffer.from(env);
  if (process.env.NODE_ENV === "production") throw new Error("HQ_SESSION_SECRET (32+ characters) must be set in production.");
  const file = path.join(DATA_DIR, "session-secret");
  if (!existsSync(file)) {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(file, randomBytes(48).toString("hex"), "utf8");
  }
  return Buffer.from(readFileSync(file, "utf8").trim());
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function signToken(payload: Record<string, unknown>): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(createHmac("sha256", secret()).update(body).digest())}`;
}

/** The payload if the signature holds and `x` (expiry, ms) is in the future. */
export function readToken<T extends { x: number }>(token: string | undefined, now = Date.now()): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const want = createHmac("sha256", secret()).update(body).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return typeof p.x === "number" && p.x > now ? p : null;
  } catch {
    return null;
  }
}

/* ───────────── faces ───────────── */

export const FACE_LEN = 128;
/** face-api's recognition net: same person is usually under 0.45; we accept up to 0.5. */
export const FACE_MATCH = 0.5;

export function validDescriptor(d: unknown): d is number[] {
  return Array.isArray(d) && d.length === FACE_LEN && d.every((x) => typeof x === "number" && Number.isFinite(x) && Math.abs(x) < 2);
}

export function faceDistance(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < FACE_LEN; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

/** Several captures of one face → their mean, or null when they don't agree (two people, or a bad frame). */
export function enrolFace(captures: number[][]): number[] | null {
  if (captures.length < 3 || !captures.every(validDescriptor)) return null;
  for (let i = 0; i < captures.length; i++) for (let j = i + 1; j < captures.length; j++) if (faceDistance(captures[i], captures[j]) > 0.45) return null;
  return Array.from({ length: FACE_LEN }, (_, k) => captures.reduce((s, c) => s + c[k], 0) / captures.length);
}
