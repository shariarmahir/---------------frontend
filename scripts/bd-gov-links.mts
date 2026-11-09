/**
 * Opens every official link in BD Guide's one-click directory and lists those that
 * failed. Links go stale: on 5 November 2026 about 80 of the 283 on the national
 * portal's own list did not open, and one had become a gambling site.
 * Run: node scripts/bd-gov-links.mts
 * A 403 or a timeout may only mean the site refuses scripts. A certificate error often
 * means the site sends an incomplete chain, which browsers repair and Node does not.
 * Open all of those by hand in a browser before removing the link.
 */
import { SERVICES } from "../data/bd-gov-services.ts";

const links = [...new Set(SERVICES.flatMap((s) => [s.href, ...(s.more ?? []).map((m) => m.href)]))];
const AT_ONCE = 10;

async function check(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(25_000), headers: { "User-Agent": "Mozilla/5.0 (BD Guide link check)" } });
    await res.body?.cancel();
    return res.ok ? null : `${res.status}`;
  } catch (error) {
    const cause = error instanceof Error ? (error.cause as { code?: string } | undefined) : undefined;
    return cause?.code ?? (error instanceof Error ? error.name : "failed");
  }
}

let failed = 0;
for (let i = 0; i < links.length; i += AT_ONCE) {
  const batch = links.slice(i, i + AT_ONCE);
  const results = await Promise.all(batch.map(check));
  results.forEach((problem, n) => {
    if (!problem) return;
    failed += 1;
    console.log(`${problem}\t${batch[n]}`);
  });
}
console.log(`${links.length - failed} of ${links.length} links opened.`);
process.exit(0);
