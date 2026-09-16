const FOOTER_LINKS = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Mission", href: "#mission" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Services", href: "#services" },
      { label: "Team", href: "#team" },
      { label: "Community", href: "#community" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.5 21.75v-8.1h2.72l.41-3.15h-3.13V8.49c0-.91.25-1.53 1.56-1.53h1.67V4.14c-.29-.04-1.28-.13-2.44-.13-2.42 0-4.07 1.47-4.07 4.17v2.32H7.5v3.15h2.72v8.1z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "#", Icon: LinkedinIcon },
  { label: "Twitter / X", href: "#", Icon: TwitterIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <p className="font-heading text-lg font-bold text-primary">
              কাণ্ডারী-ল্যাব
            </p>
            <p className="text-sm text-slate-500">
              Building opportunity for every Kandari in Bangladesh.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="transition-colors hover:text-primary"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="text-sm text-slate-500">
              <p>hello@kandarilab.com</p>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.heading} className="flex flex-col items-center gap-3 sm:items-start">
              <h3 className="font-heading text-sm font-semibold text-title">
                {column.heading}
              </h3>
              <ul className="flex flex-col items-center gap-2 sm:items-start">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-black/5 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Kandari Lab. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
