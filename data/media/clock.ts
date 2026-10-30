/**
 * The demo's "now". Mock timestamps are written relative to this date, and
 * pages are prerendered, so relative times ("৩ ঘণ্টা আগে") use a fixed clock
 * instead of the build machine's — otherwise every build would age the feed.
 */
export const DEMO_NOW = new Date("2026-09-25T12:00:00Z");
