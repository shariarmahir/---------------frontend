import { notFound } from "next/navigation";

/**
 * Catch-all for addresses under /protibad/command that match no page (for
 * example /protibad/command/zzz). Without it Next renders the site-wide 404
 * outside the dashboard; calling notFound() here shows ../not-found.tsx inside
 * the dashboard frame. Static and [id] routes are more specific and win over it.
 */
export default function UnmatchedCommandPage(): never {
  notFound();
}
