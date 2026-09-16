export function DownloadCtaSection() {
  return (
    <section id="download" className="bg-primary py-16 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold text-title sm:text-3xl">
          Get the Kandari App
        </h2>
        <p className="max-w-xl text-white/90">
          Track your training, connect with mentors, and follow your impact —
          all from your phone.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="rounded-lg bg-black/80 px-5 py-3 text-sm font-medium">
             App Store
          </div>
          <div className="rounded-lg bg-black/80 px-5 py-3 text-sm font-medium">
            ▶ Google Play
          </div>
        </div>
      </div>
    </section>
  );
}
