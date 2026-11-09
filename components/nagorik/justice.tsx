import { Card, type Surface } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { helplines } from "@/data/complaints";
import { ARTICLE_21, CIVIC_LAWS } from "@/data/nagorik";
import { cn } from "@/lib/utils";

/** Only the short codes verified in data/complaints.ts. */
const LINES = helplines.filter((l) => ["999", "109", "106", "333"].includes(l.number));

const STEPS: { title: string; icon: string; body: string; surface: Surface }[] = [
  {
    title: "Document it",
    icon: "edit_note",
    body: "Write down what happened, when, where and who was there. Keep photos, receipts, letters and the names of witnesses.",
    surface: "navy",
  },
  {
    title: "Report it",
    icon: "description",
    body: "Complain in writing to the office responsible, or file a General Diary at the police station. Keep a copy or the receipt number.",
    surface: "ink",
  },
  {
    title: "Call the helpline",
    icon: "call",
    body: "Free national short codes. In danger, call 999 first.",
    surface: "navy",
  },
  {
    title: "Get legal aid",
    icon: "volunteer_activism",
    body: "Under the Legal Aid Services Act, 2000, people who cannot afford a lawyer get one at the state's cost. Ask at the legal aid office of your district court.",
    surface: "cobalt",
  },
  {
    title: "Go to court",
    icon: "gavel",
    body: "For a fundamental right, a lawyer can file a writ petition in the High Court Division (Articles 44 and 102). District courts hear other civil and criminal cases.",
    surface: "ink",
  },
];

/** When a right is denied: five steps, the helplines inside the third, then the laws to use and the duty that comes with every right. */
export function Justice() {
  return (
    <>
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex">
            <Card surface={s.surface} className="flex w-full flex-col sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-grotesk text-4xl leading-none font-bold text-bdnavy-300 tabular-nums">
                  <span className="sr-only">Step </span>
                  {i + 1}
                </span>
                <Icon name={s.icon} className="text-2xl! text-signal-orange" />
              </div>
              <h3 className="mt-5 font-grotesk text-xl font-bold text-signal-orange">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{s.body}</p>
              {i === 2 && (
                <ul className="mt-4 grid gap-1">
                  {LINES.map((l) => (
                    <li key={l.number}>
                      <a
                        href={`tel:${l.number}`}
                        className="-mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-black/30 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none"
                      >
                        <span className={cn("w-12 shrink-0 font-grotesk text-2xl font-bold tabular-nums", l.number === "999" ? "text-crimson-bright" : "text-white")}>{l.number}</span>
                        <span className="text-sm leading-snug text-white/80">{l.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6">
        <Card surface="cobalt">
          <h3 className="font-grotesk text-lg font-bold text-white">Constitution, Article 21: duties of citizens and of public servants</h3>
          <blockquote className="mt-5">
            <p className="font-grotesk text-xl leading-snug font-bold text-pretty text-signal-orange sm:text-2xl">&ldquo;{ARTICLE_21.citizen}&rdquo;</p>
            <p className="mt-4 text-base leading-relaxed text-white/80">&ldquo;{ARTICLE_21.servant}&rdquo;</p>
          </blockquote>
        </Card>
        <Card surface="navy">
          <h3 className="font-grotesk text-lg font-bold text-white">Laws you can use without a lawyer</h3>
          <ul className="mt-5 grid gap-4">
            {CIVIC_LAWS.map((l) => (
              <li key={l.name} className="border-l-2 border-signal-orange pl-4">
                <p className="text-base font-semibold text-white">{l.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">{l.use}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
