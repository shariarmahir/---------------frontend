function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.365 1.43c0 1.14-.416 2.06-1.248 2.79-.914.79-1.97 1.24-3.032 1.15-.108-1.09.44-2.24 1.238-2.98.884-.83 2.06-1.29 3.042-1.36.01.13 0 .27 0 .4zm3.62 15.19c-.474 1.05-.7 1.52-1.31 2.45-.85 1.3-2.05 2.92-3.53 2.93-1.32.02-1.66-.86-3.45-.85-1.79.01-2.16.86-3.48.84-1.48-.02-2.62-1.48-3.47-2.78-2.38-3.63-2.63-7.89-1.16-10.16.94-1.46 2.44-2.32 3.85-2.32 1.43 0 2.33.86 3.51.86 1.15 0 1.85-.86 3.51-.86 1.26 0 2.6.69 3.55 1.87-3.12 1.71-2.61 6.18.98 8.02z" />
    </svg>
  );
}

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.6 2.6c-.3.3-.5.7-.5 1.2v16.4c0 .5.2.9.5 1.2l.1.1L13 12.2v-.4L3.7 2.5l-.1.1z" />
      <path d="M16.1 15.3l-3.1-3.1v-.4l3.1-3.1 3.9 2.2c1 .6 1 1.6 0 2.2l-3.9 2.2z" />
      <path d="M16.1 8.7 12.9 12l-9.3 9.4c.4.4 1 .4 1.7.1l10.8-6.8z" />
      <path d="M16.1 15.3 5.3 21.9c-.7.3-1.3.3-1.7-.1L12.9 12l3.2 3.3z" />
    </svg>
  );
}

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
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-black/80 px-5 py-3 text-sm font-medium">
              <AppleIcon className="h-5 w-5" />
              App Store
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-black/80 px-5 py-3 text-sm font-medium">
              <GooglePlayIcon className="h-4 w-4" />
              Google Play
            </div>
          </div>
          <div
            className="flex h-24 w-24 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-xs text-white/70"
            aria-label="QR code placeholder to download the app"
          >
            QR Code
          </div>
        </div>
      </div>
    </section>
  );
}
