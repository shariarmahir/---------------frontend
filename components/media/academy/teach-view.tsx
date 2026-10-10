import { Band, BandTitle, Turn, twoDigits } from "./catalogue/band";
import { CatalogueNav } from "./catalogue/catalogue-nav";
import { CatalogueRoot } from "./catalogue/catalogue-root";
import { CatalogueRuler } from "./catalogue/ruler";
import { TeachApply } from "./teach-apply";

const CHECKED = [
  "পরিচয় যাচাই করা প্রোফাইল (এনআইডি বা পাসপোর্ট)।",
  "অন্তত ২ বছরের হাতে-কলমে কাজ।",
  "১০ মিনিটের নমুনা ক্লাস — বোঝানো যায় কি না।",
  "প্যানেলে একজন প্রধান শিক্ষক আর একজন বহিরাগত পেশাদার; আপনি ১৫ মিনিটে কিছু শিখিয়ে দেখান।",
  "কর্মশালা হলে প্যানেল গিয়ে জায়গার নিরাপত্তা দেখে।",
];
const TERMS = [
  "ফি আপনি ঠিক করেন; আপনি পান ৯৫%, ক্লাস হলে এসক্রো থেকে।",
  "চাইলে বিনা ফিতেও শেখাতে পারেন — দেশের দরকারে অনেকে তা-ই করছেন।",
  "র‍্যাংক ঠিক হয় পয়েন্টে: ইন্টারভিউ, রেটিং, গ্র্যাজুয়েট, সফলতার গল্প। তিনটি প্রমাণিত অভিযোগে শিক্ষকতা থামে।",
];

/**
 * একাডেমি খুলুন — the way in for teachers, in the catalogue's bands: the
 * call, then the application (and, once sent, its progress and the panel
 * slot) beside what the panel checks and what teaching pays and asks.
 */
export function TeachView({ dept }: { dept?: string }) {
  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="একাডেমি খুলুন" now note="শিক্ষক হোন">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            যিনি কাজ জানেন, তিনি <Turn>শেখান</Turn>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">
            দেশে দক্ষ মানুষের অভাব। মেকানিক, শেফ, প্রকৌশলী, শিল্পী — প্রমাণ দিন, প্যানেলে শিখিয়ে দেখান, তারপর নিজের নামে বা বন্ধুদের নিয়ে একাডেমি আর প্রথম ব্যাচ।
          </p>
        </div>
      </Band>

      <Band id="apply" n={2} label="আবেদন" note="তারপর প্যানেল ইন্টারভিউ">
        <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_22rem]">
          <TeachApply initialDept={dept} />
          <aside className="flex flex-col gap-px">
            {[
              { title: "যা দেখা হয়", items: CHECKED },
              { title: "আয় ও দায়", items: TERMS },
            ].map((box) => (
              <section key={box.title} className="flex-1 bg-(--c-bg) p-6 md:p-8">
                <h2 className="hud text-(--c-faint)">{box.title}</h2>
                <ol className="mt-4 border-t border-(--c-line)">
                  {box.items.map((t, i) => (
                    <li key={t} className="flex gap-3 border-b border-(--c-line) py-3 text-sm leading-relaxed text-(--c-ink)">
                      <span className="hud shrink-0 pt-0.5 text-(--c-faint)">{twoDigits(i + 1)}</span>
                      {t}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </aside>
        </div>
      </Band>

    </CatalogueRoot>
  );
}
