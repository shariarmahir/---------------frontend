"use client";

import Link from "next/link";

/** A part of a page failed to draw: say so plainly and offer another try, with no technical detail. */
export default function BangladeshError({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="flex min-h-svh flex-col items-center justify-center gap-6 bg-white px-6 text-center text-bdnavy-900">
      <h1 className="text-4xl font-bold">This page could not load</h1>
      <p className="max-w-xl text-lg leading-relaxed">Please try again. If it keeps happening, the home page will still work.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="min-h-12 rounded-full bg-signal-orange px-7 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">
          Try again
        </button>
        <Link href="/bangladesh" className="inline-flex min-h-12 items-center rounded-full px-7 font-semibold ring-2 ring-bdnavy-900 ring-inset focus-visible:outline-2 focus-visible:outline-offset-4">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
