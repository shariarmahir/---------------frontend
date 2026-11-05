import Link from "next/link";

/** Any address that does not exist: say so plainly and offer the two ways back. */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-bdnavy-900 px-6 text-center text-white">
      <h1 className="text-4xl font-bold text-signal-orange sm:text-5xl">This page is not here</h1>
      <p className="max-w-xl text-lg leading-relaxed text-white/85">The link may be old or mistyped.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/bangladesh" className="inline-flex min-h-12 items-center rounded-full bg-signal-orange px-7 font-semibold text-bdnavy-900 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Explore Bangladesh
        </Link>
        <Link href="/" className="inline-flex min-h-12 items-center rounded-full px-7 font-semibold ring-2 ring-white ring-inset transition-colors hover:bg-white hover:text-bdnavy-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Kandari-Lab home
        </Link>
      </div>
    </main>
  );
}
