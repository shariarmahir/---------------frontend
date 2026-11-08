import type { Metadata } from "next";
import { CONTAINER, Crumbs, LINK } from "@/components/bd-gov/kit";
import { guidePhotos } from "@/data/bd-gov-credits";

export const metadata: Metadata = {
  alternates: { canonical: "/bangladesh/government/credits" },
  title: "Photo credits | BD Guide",
  description: "Who took the photographs in BD Guide, and the licence each one is used under.",
};

/** Every photograph in the guide, its author and its licence, linked to its source. */
export default function CreditsPage() {
  const photos = guidePhotos();
  return (
    <>
      <Crumbs trail={[{ label: "Home", href: "/bangladesh/government" }, { label: "Photo credits", href: "/bangladesh/government/credits" }]} />
      <div className={CONTAINER}>
        <h1 className="font-ml-serif text-[clamp(2.4rem,4.2vw,3.6rem)] leading-[1.06] font-normal tracking-[-0.01em] text-ml-night">Photo credits</h1>
        <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-gv-ink/80">
          The photographs in this guide come from Wikimedia Commons and Unsplash. Each is used under the licence named here; follow a link to see the original and its author.
        </p>
        <ul className="mt-10 grid gap-x-10 border-t border-gv-line md:grid-cols-2">
          {photos.map((p) => (
            <li key={p.src} className="flex flex-col gap-1 border-b border-gv-line py-4">
              <span className="leading-snug text-ml-night">{p.alt}</span>
              <span className="text-[0.95rem] text-gv-ink/75">
                <a href={p.credit.sourceUrl} className={LINK}>
                  {p.credit.author}
                </a>
                {", "}
                {p.credit.licenseUrl ? (
                  <a href={p.credit.licenseUrl} className={LINK}>
                    {p.credit.license}
                  </a>
                ) : (
                  p.credit.license
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
