import { Icon } from "@/components/ui/icon";
import type { Service } from "@/data/bd-gov-services";
import { hostOf } from "@/lib/bd-gov-services";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;
const SMALL_LINK = "font-semibold text-gv-navy underline underline-offset-2 hover:decoration-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green";

/** One service: what it does, what to have ready, and one button to the official page, whose address it shows. */
export function ServiceCard({ service: s, as: Title = "h3" }: { service: Service; as?: "h2" | "h3" | "h4" }) {
  const hasDetails = Boolean(s.ready?.length || s.note || s.more?.length || s.call);
  return (
    <article id={`service-${s.id}`} className="flex h-full w-full scroll-mt-6 flex-col rounded-xl bg-white p-5 shadow-[0_1px_2px_rgb(11_24_73/0.05)] ring-1 ring-gv-navy/10 transition-shadow duration-200 hover:shadow-[0_14px_30px_-18px_rgb(11_24_73/0.4)]">
      <Title className="text-[1.13rem] leading-snug font-bold text-balance text-gv-navy">{s.name}</Title>
      <p lang="bn" className="mt-1 font-bengali text-[0.95rem] leading-snug text-gv-ink/70">
        {s.bn}
      </p>
      <p className="mt-3 text-[0.98rem] leading-normal text-pretty text-gv-ink/85">{s.what}</p>

      {hasDetails ? (
        <details className="group mt-3 text-[0.95rem]">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm font-semibold text-gv-green focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green [&::-webkit-details-marker]:hidden">
            {s.ready?.length ? "What to have ready" : "More details"}
            <Icon name="expand_more" className="text-xl! transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="mt-2 flex flex-col gap-2.5 leading-normal">
            {s.ready?.length ? (
              <ul className="list-disc space-y-1 pl-5 marker:text-gv-green">
                {s.ready.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : null}
            {s.note ? <p>{s.note}</p> : null}
            {s.call ? (
              <p>
                {s.call.label}:{" "}
                <a href={`tel:${s.call.tel}`} className={SMALL_LINK}>
                  {s.call.tel}
                </a>
              </p>
            ) : null}
            {s.more?.length ? (
              <ul className="flex flex-col gap-1">
                {s.more.map((m) => (
                  <li key={m.href}>
                    <a href={m.href} {...EXTERNAL} className={SMALL_LINK}>
                      {m.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
        <span className="min-w-0 text-sm break-all text-gv-ink/65">{hostOf(s.href)}</span>
        <a
          href={s.href}
          {...EXTERNAL}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-gv-gold px-4 font-bold text-gv-navy transition-colors duration-200 hover:bg-gv-navy hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green"
        >
          {s.verb}
          <Icon name="open_in_new" className="text-lg!" />
          <span className="sr-only">: {s.name} (opens the official page in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
