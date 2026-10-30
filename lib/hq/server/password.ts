/**
 * Password hashing (scrypt) for কাণ্ডারী HQ. Server-only, and kept apart from
 * crypto.ts so the store can hash the demo password without importing it.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): { salt: string; hash: string } {
  return { salt, hash: scryptSync(password.normalize("NFKC"), salt, 64, SCRYPT).toString("hex") };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  if (!salt || !hash) {
    // Same work either way, so a wrong username takes as long as a wrong password.
    hashPassword(password, "0".repeat(32));
    return false;
  }
  const got = Buffer.from(hashPassword(password, salt).hash, "hex");
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}
