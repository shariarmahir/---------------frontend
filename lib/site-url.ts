/** The live address, for links that must be absolute: set NEXT_PUBLIC_SITE_URL, or Vercel's production address is used. */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
);
