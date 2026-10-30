/**
 * The hero's mark (Mahir, 2026-10-24): his animated "Kandari Lab." wordmark,
 * cropped to the letters so its gold bar ends where they do, transparent
 * around it. It builds itself in about two seconds, holds for nearly three,
 * and builds again, for as long as the page is open (loop count 0).
 * Reduced motion: the finished mark, still. Both carry the name: the one not
 * shown is display:none, so only one is ever announced, and lazy, so it is
 * never fetched. No high fetch priority: the poster is the hero's LCP.
 *
 * Plain <img>: the image optimiser would flatten the animation. Cropped
 * from the 1386² GIF to 1200 × 179.
 */
export function HeroLogo() {
  return (
    <div className="hero-mark relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero/kandari-mark.webp" alt="Kandari Lab" width={1200} height={179} className="h-auto w-full motion-reduce:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero/kandari-mark.png" alt="Kandari Lab" width={1200} height={179} loading="lazy" className="hidden h-auto w-full motion-reduce:block" />
    </div>
  );
}
