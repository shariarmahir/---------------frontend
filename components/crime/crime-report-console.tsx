import { Icon } from "@/components/ui/icon";
import { crimeCategories } from "@/data/crime-index";

/**
 * The citizen report console.
 *
 * ── Why this form is inert ───────────────────────────────────────────
 *
 * The reference design promises an encrypted link to police systems and
 * 100% anonymity. There is no backend, so shipping that copy over a form
 * that posts nowhere would be a false promise on exactly the input where
 * being believed is most dangerous: someone reporting a crime they
 * witnessed. A person who trusts an anonymity guarantee that does not
 * exist can be identified by whatever they upload.
 *
 * So the controls render at full visual weight — this is the real
 * layout, not a sketch — but submission is disabled and the notice says
 * plainly that it is not live yet.
 *
 * TODO(backend): POST /api/v1/crime-report. Before this is enabled it
 * needs, at minimum: transport encryption, EXIF/GPS stripping on upload,
 * no IP retention for anonymous submissions, a defined retention window,
 * and a named authority that receives the reports. Only once those hold
 * may the anonymity copy the reference asks for be shown.
 */
export function CrimeReportConsole() {
  return (
    <div className="flex flex-col gap-space-md">
      <form
        aria-labelledby="report-console-title"
        className="flex flex-col gap-space-sm rounded-xl border border-border bg-white p-space-md"
      >
        <div className="flex items-center justify-between gap-space-sm border-b border-border pb-space-sm">
          <h2
            id="report-console-title"
            className="flex items-center gap-1.5 font-display text-body-md font-bold text-bd-green"
          >
            <Icon name="upload_file" className="text-[20px]" />
            ঘটনার তথ্য জমা দিন
          </h2>
          <span className="shrink-0 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono text-[0.625rem] font-bold text-amber-800">
            প্রস্তুতিতে
          </span>
        </div>

        <p className="font-sans text-body-sm leading-relaxed text-slate-600">
          উন্মুক্ত স্থানে প্রস্রাব, চাঁদাবাজি বা যেকোনো বেআইনি ঘটনার তথ্য
          জানাতে এই ফর্মটি ব্যবহার করা যাবে।
        </p>

        <fieldset disabled className="flex flex-col gap-space-sm">
          <legend className="sr-only">ঘটনার বিবরণ</legend>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="report-category"
              className="font-mono text-[0.6875rem] font-semibold text-slate-600"
            >
              অপরাধের ক্যাটাগরি
            </label>
            <select
              id="report-category"
              name="category"
              defaultValue=""
              className="rounded-md border border-border bg-slate-50 p-2 font-sans text-body-sm text-slate-900 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              <option value="">ক্যাটাগরি নির্বাচন করুন</option>
              {crimeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.banglaLabel}
                  {c.statute ? ` (${c.statute})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="report-location"
              className="font-mono text-[0.6875rem] font-semibold text-slate-600"
            >
              ঘটনার স্থান ও জেলা
            </label>
            <input
              id="report-location"
              name="location"
              type="text"
              placeholder="যেমন: ধানমন্ডি ২৭ সংলগ্ন ফুটপাত, ঢাকা"
              className="rounded-md border border-border bg-slate-50 p-2 font-sans text-body-sm text-slate-900 placeholder:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[0.6875rem] font-semibold text-slate-600">
              ছবি বা ভিডিও প্রমাণ
            </span>
            <div className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-slate-50 p-space-md text-center">
              <Icon name="cloud_upload" className="text-[26px] text-slate-400" />
              <span className="font-sans text-[0.6875rem] font-semibold text-slate-600">
                MP4, MOV বা JPG — সর্বোচ্চ ৫০০ এমবি
              </span>
            </div>
          </div>
        </fieldset>

        {/* The honest notice, in place of the reference's anonymity
            guarantee. It names what is missing and what will change. */}
        <div className="flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 p-space-sm">
          <Icon
            name="info"
            className="mt-px shrink-0 text-[16px] text-amber-800"
          />
          <p className="font-sans text-[0.6875rem] leading-relaxed text-amber-900">
            <strong>সাবমিশন এখনো চালু হয়নি।</strong> নিরাপদ সার্ভার সংযোগ ও
            পরিচয় গোপন রাখার ব্যবস্থা সম্পন্ন হওয়ার আগে এই ফর্ম দিয়ে তথ্য
            পাঠানো যাবে না। জরুরি ঘটনা এখনই জানাতে{" "}
            <a href="tel:999" className="font-bold underline">
              ৯৯৯
            </a>{" "}
            নম্বরে কল করুন।
          </p>
        </div>

        <button
          type="submit"
          disabled
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-200 px-4 py-2.5 font-display text-label-md font-bold text-slate-500 disabled:cursor-not-allowed"
        >
          <Icon name="lock" className="text-[16px]" />
          শীঘ্রই চালু হচ্ছে
        </button>
      </form>

      {/* ── Helplines ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-white p-space-md">
        <div className="flex items-center justify-between gap-space-sm">
          <h2 className="font-display text-body-md font-bold text-slate-900">
            জরুরি হেল্পলাইন
          </h2>
          <span className="font-mono text-[0.625rem] font-semibold text-bd-green">
            ২৪/৭ চালু
          </span>
        </div>

        <Helpline
          href="tel:999"
          title="জাতীয় জরুরি সেবা"
          subtitle="পুলিশ, অ্যাম্বুলেন্স, ফায়ার সার্ভিস"
          number="৯৯৯"
          urgent
        />
        <Helpline
          href="tel:109"
          title="নারী ও শিশু নির্যাতন"
          subtitle="সহায়তা ও আইনি পরামর্শ"
          number="১০৯"
        />
        <Helpline
          href="tel:333"
          title="সরকারি তথ্য ও সেবা"
          subtitle="নাগরিক সেবা তথ্য"
          number="৩৩৩"
        />
      </div>
    </div>
  );
}

function Helpline({
  href,
  title,
  subtitle,
  number,
  urgent = false,
}: {
  href: string;
  title: string;
  subtitle: string;
  number: string;
  urgent?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        urgent
          ? "flex items-center justify-between gap-space-sm rounded-lg border border-red-200 bg-red-50 p-2.5 transition-colors hover:bg-red-100"
          : "flex items-center justify-between gap-space-sm rounded-lg border border-border bg-slate-50 p-2.5 transition-colors hover:bg-bdgreen-50"
      }
    >
      <span className="flex min-w-0 flex-col">
        <span
          className={
            urgent
              ? "font-display text-body-sm font-bold text-red-900"
              : "font-display text-body-sm font-bold text-slate-900"
          }
        >
          {title}
        </span>
        <span
          className={
            urgent
              ? "truncate font-sans text-[0.6875rem] text-red-700"
              : "truncate font-sans text-[0.6875rem] text-slate-600"
          }
        >
          {subtitle}
        </span>
      </span>
      <span
        className={
          urgent
            ? "shrink-0 rounded bg-national-crimson px-2.5 py-1 font-display text-body-md font-bold text-white"
            : "shrink-0 rounded bg-bd-green px-2.5 py-1 font-display text-body-sm font-bold text-white"
        }
      >
        {number}
      </span>
    </a>
  );
}
