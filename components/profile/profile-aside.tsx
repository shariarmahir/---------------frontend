import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/feed/post-header";
import { footerLinks, profileTrends, youMightLike } from "@/data/profile";

/** Right rail — search, suggested accounts, trends, legal links. */
export function ProfileAside() {
  return (
    <aside className="hidden w-87.5 shrink-0 flex-col gap-space-md p-space-sm pl-space-lg select-none lg:flex">
      <div className="sticky top-0 z-20 bg-white/95 py-1 backdrop-blur-sm">
        <div className="relative flex items-center">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 text-xl text-text-muted"
          />
          <label htmlFor="profile-search" className="sr-only">
            অনুসন্ধান
          </label>
          <input
            id="profile-search"
            type="search"
            placeholder="অনুসন্ধান / Search"
            className="w-full rounded-full border border-transparent bg-mint-subtle py-2.5 pr-space-md pl-11 font-sans text-sm text-text-primary transition-all placeholder:text-text-muted focus:border-bd-green focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Suggested accounts. */}
      <section className="rounded-xl border border-card-border bg-mint-subtle/50 p-space-md shadow-sm">
        <h2 className="mb-space-sm font-grotesk text-base font-extrabold text-text-primary">
          আপনার পছন্দ হতে পারে
        </h2>

        <div className="flex flex-col gap-space-md">
          {youMightLike.map((account) => (
            <div
              key={account.handle}
              className="flex items-center justify-between gap-space-sm"
            >
              <div className="flex min-w-0 items-center gap-space-sm">
                <Avatar
                  initials={account.initials}
                  tone="mint"
                  className="size-10 text-[11px]"
                />
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-grotesk text-sm font-bold text-text-primary">
                      {account.name}
                    </span>
                    {account.verified ? (
                      <Icon
                        name="verified"
                        className="shrink-0 text-sm text-bd-green"
                        filled
                      />
                    ) : null}
                  </div>
                  <span className="truncate font-sans text-xs text-text-muted">
                    {account.handle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-full bg-text-primary px-space-md py-1.5 font-sans text-xs font-semibold text-white transition-colors hover:bg-bd-green"
              >
                অনুসরণ
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-space-sm font-sans text-xs font-semibold text-bd-green hover:underline"
        >
          আরও দেখুন
        </button>
      </section>

      {/* Trends. */}
      <section className="rounded-xl border border-card-border bg-mint-subtle/50 p-space-md shadow-sm">
        <h2 className="mb-space-xs font-grotesk text-base font-extrabold text-text-primary">
          যা ঘটছে
        </h2>

        <div className="flex flex-col divide-y divide-card-border">
          {profileTrends.map((trend) => (
            <div
              key={trend.title}
              className="flex items-start justify-between gap-space-sm py-2.5"
            >
              <div className="min-w-0">
                <p className="font-sans text-[11px] text-text-muted">
                  {trend.category}
                </p>
                <button
                  type="button"
                  className="text-left font-grotesk text-sm font-bold text-text-primary hover:underline"
                >
                  {trend.title}
                </button>
                <p className="font-sans text-[11px] text-text-muted">
                  {trend.meta}
                </p>
              </div>

              <button
                type="button"
                aria-label={`${trend.title} — বিকল্প`}
                className="shrink-0 rounded-full p-1 text-text-muted transition-colors hover:bg-white hover:text-text-primary"
              >
                <Icon name="more_horiz" className="text-base" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-space-xs font-sans text-xs font-semibold text-bd-green hover:underline"
        >
          আরও দেখুন
        </button>
      </section>

      <footer className="flex flex-wrap gap-x-space-sm gap-y-1 px-space-xs font-sans text-[11px] text-text-muted">
        {footerLinks.map((link) => (
          <button key={link} type="button" className="hover:underline">
            {link}
          </button>
        ))}
        <span>© ২০২৬ কাণ্ডারী-ল্যাব</span>
      </footer>
    </aside>
  );
}
