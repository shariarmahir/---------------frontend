/**
 * What a deployed HQ needs from the host's environment (.env.local is never
 * uploaded, so on Vercel these are set under Settings → Environment
 * Variables). Only the names are ever shown, never the values.
 */
export function missingSetup(): string[] {
  const missing: string[] = [];
  // Development makes and keeps its own session secret (crypto.ts).
  if (process.env.NODE_ENV === "production" && (process.env.HQ_SESSION_SECRET ?? "").length < 32) missing.push("HQ_SESSION_SECRET");
  if (!process.env.HQ_PRIME_EMAIL?.trim()) missing.push("HQ_PRIME_EMAIL");
  if (!process.env.HQ_PRIME_PASSWORD_HASH?.trim().startsWith("scrypt:")) missing.push("HQ_PRIME_PASSWORD_HASH");
  return missing;
}
