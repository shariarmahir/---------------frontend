"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageSquareText, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { districts } from "@/data/districts";
import { AUTH_RULES, FOLLOWABLE_PRODUCTS, ROLES, SECTORS, type RoleId, type SectorId } from "@/data/auth";
import { isEmailTaken, register, requestOtp, verifyOtp, type ActionResult } from "@/lib/auth/client";
import { isEmail, maskPhone, normalizePhone, passwordIssues, safeNext, toBanglaDigits, validName } from "@/lib/auth/validate";
import { cn } from "@/lib/utils";
import { AuthHeading } from "./auth-shell";
import { Chip, DemoMessage, FieldError, OtpInput, PasswordField, SubmitButton, TextButton, TextField, Toggle, useCountdown } from "./fields";

const STEPS = ["আপনার তথ্য", "মোবাইল যাচাই", "আগ্রহ ও সম্মতি"];

type Errors = Partial<Record<"name" | "phone" | "email" | "password" | "district" | "sectors" | "consent" | "form", string>>;

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);

export function SignupFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/account?welcome=1");

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [phoneTaken, setPhoneTaken] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleId>(pick(params.get("role"), ROLES.map((r) => r.id), "citizen"));
  const [district, setDistrict] = useState<string>(pick(params.get("district"), districts as readonly string[], ""));

  const [sent, setSent] = useState<{ phone: string; code: string; resendAt: number } | null>(null);
  const [otp, setOtp] = useState("");
  const resendIn = useCountdown(sent?.resendAt ?? null);

  const [sectors, setSectors] = useState<SectorId[]>(role === "provider" || role === "citizen" ? ["health"] : []);
  const [products, setProducts] = useState<string[]>([]);
  const [notify, setNotify] = useState({ sms: true, email: true });
  const [consent, setConsent] = useState(false);

  async function act<T>(p: Promise<ActionResult<T>>, onOk: (v: T) => void, field: keyof Errors = "form") {
    setBusy(true);
    setErrors({});
    const r = await p;
    setBusy(false);
    setPhoneTaken(!r.ok && r.error === "phone_taken");
    if (r.ok) onOk(r.value);
    else setErrors({ [field]: r.message });
  }

  function sendCode() {
    act(
      requestOtp(phone, "signup"),
      (v) => {
        setSent({ phone: v.phone, code: v.code, resendAt: Date.now() + AUTH_RULES.otpResendMs });
        setOtp("");
        setStep(1);
      },
      "phone",
    );
  }

  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (!validName(name)) errs.name = "পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)।";
    if (!normalizePhone(phone)) errs.phone = "সঠিক মোবাইল নম্বর দিন — ১১ অঙ্ক, ০১ দিয়ে শুরু।";
    if (email.trim() && !isEmail(email)) errs.email = "সঠিক ইমেইল ঠিকানা দিন, অথবা ঘরটি খালি রাখুন।";
    else if (email.trim() && isEmailTaken(email)) errs.email = "এই ইমেইলে আগেই অ্যাকাউন্ট আছে — সাইন ইন করুন।";
    if (passwordIssues(password, AUTH_RULES.passwordMin, AUTH_RULES.passwordMax).length) errs.password = "পাসওয়ার্ডের শর্তগুলো পূরণ করুন।";
    if (!district) errs.district = "জেলা বেছে নিন।";
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    // Same number, code still fresh: go straight back to entering it.
    if (sent && sent.phone === normalizePhone(phone)) setStep(1);
    else sendCode();
  }

  function submitInterests(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (!sectors.length) errs.sectors = "অন্তত একটি খাত বেছে নিন।";
    if (!consent) errs.consent = "চালিয়ে যেতে শর্তে সম্মতি দিন।";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    act(
      register({ name, phone, email: email.trim() || null, password, role, district, sectors, products, notify: { sms: notify.sms, email: notify.email && !!email.trim() } }),
      () => router.replace(next),
    );
  }

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="flex flex-col gap-space-lg">
      <AuthHeading eyebrow="Kandari Profile" title="নতুন অ্যাকাউন্ট খুলুন" subtitle="গবেষণা, পণ্য ও আপনার এলাকার আপডেট পেতে — বিনামূল্যে, দুই মিনিটে।" />

      <ol className="grid grid-cols-3 gap-2" aria-label="ধাপ">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className={cn("block h-2 rounded-full transition-colors duration-300", i < step ? "bg-text-primary" : i === step ? "bg-white" : "bg-text-primary/15")} />
            <span className={cn("mt-1.5 flex items-center gap-1 font-sans text-body-sm", i === step ? "font-bold text-text-primary" : "text-text-primary/70")}>
              {i < step ? <Check className="size-3.5" aria-hidden /> : <span aria-hidden>{toBanglaDigits(i + 1)}.</span>}
              {s}
              <span className="sr-only">{i < step ? " (সম্পন্ন)" : i === step ? " (চলছে)" : ""}</span>
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form noValidate onSubmit={submitDetails} className="flex flex-col gap-space-md">
          <TextField label="পূর্ণ নাম" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
          <TextField
            label="মোবাইল নম্বর"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="০১XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            hint="এই নম্বরে যাচাই-কোড যাবে; সাইন ইনও হবে এই নম্বরে।"
            required
          />
          {phoneTaken && errors.phone ? (
            <Link href={`/login?phone=${encodeURIComponent(normalizePhone(phone) ?? phone)}`} className="-mt-space-sm font-sans text-body-sm font-bold text-text-primary underline decoration-2 underline-offset-2">
              এই নম্বরে সাইন ইন করুন →
            </Link>
          ) : null}
          <TextField
            label="ইমেইল (ঐচ্ছিক)"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint="দিলে ইমেইলেও সাইন ইন ও রিলিজের খবর পাবেন।"
          />
          <PasswordField label="পাসওয়ার্ড" name="new-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} showRules required />

          <fieldset className="grid gap-space-sm">
            <legend className="mb-space-sm font-sans text-label-sm font-bold tracking-wide text-text-primary">আপনি কে</legend>
            {ROLES.map((r) => (
              <label
                key={r.id}
                className={cn(
                  "flex cursor-pointer gap-space-sm rounded-2xl border-2 p-space-sm [-webkit-tap-highlight-color:transparent] transition-[background-color,border-color,scale] duration-200 active:scale-[0.98] has-focus-visible:ring-2 has-focus-visible:ring-text-primary/40",
                  role === r.id ? "border-text-primary bg-text-primary text-white shadow-ink" : "border-text-primary/25 hover:border-text-primary/60",
                )}
              >
                <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} className={cn("mt-1 size-4 shrink-0", role === r.id ? "accent-signal-orange" : "accent-text-primary")} />
                <span className="font-sans">
                  <span className={cn("block text-body-md font-bold", role === r.id ? "text-signal-orange" : "text-text-primary")}>{r.bn}</span>
                  <span className={cn("block text-body-sm", role === r.id ? "text-white/80" : "text-text-primary/70")}>{r.blurb}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="grid gap-space-sm">
            <Label htmlFor="signup-district" className="font-bold text-text-primary">
              জেলা
            </Label>
            <select
              id="signup-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              aria-invalid={errors.district ? true : undefined}
              autoComplete="address-level2"
              className="h-11 w-full rounded-xl border border-text-primary/25 bg-white px-space-md font-sans text-body-md text-text-primary shadow-clean hover:border-text-primary/50 focus-visible:border-text-primary focus-visible:ring-2 focus-visible:ring-text-primary/25 focus-visible:outline-none aria-invalid:border-national-crimson"
            >
              <option value="">বেছে নিন</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.district ? <FieldError>{errors.district}</FieldError> : null}
          </div>

          <SubmitButton busy={busy}>
            <MessageSquareText className="size-4" aria-hidden /> যাচাই-কোড পাঠান
          </SubmitButton>
        </form>
      )}

      {step === 1 && sent && (
        <form
          noValidate
          className="flex flex-col gap-space-md"
          onSubmit={(e) => {
            e.preventDefault();
            act(verifyOtp(sent.phone, otp), () => {
              setErrors({});
              setStep(2);
            });
          }}
        >
          <p className="font-sans text-body-md text-text-primary/85">
            <span className="font-semibold text-text-primary">{maskPhone(sent.phone)}</span> নম্বরে ৬ অঙ্কের কোড পাঠানো হয়েছে।
          </p>
          <DemoMessage kind="sms">
            কাণ্ডারী-ল্যাব: নতুন অ্যাকাউন্টের যাচাই-কোড <strong className="font-mono text-base tracking-widest">{toBanglaDigits(sent.code)}</strong>। ৫ মিনিট কার্যকর।{" "}
            <TextButton onClick={() => setOtp(sent.code)} className="text-signal-orange decoration-signal-orange/50 hover:text-white">
              বসিয়ে দিন
            </TextButton>
          </DemoMessage>
          <OtpInput label="৬ অঙ্কের কোড" value={otp} onChange={setOtp} invalid={!!errors.form} autoFocus />
          {errors.form ? <FieldError>{errors.form}</FieldError> : null}
          <SubmitButton busy={busy} disabled={otp.length < 6}>
            নম্বর যাচাই করুন <ArrowRight className="size-4" aria-hidden />
          </SubmitButton>
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <TextButton onClick={() => { setStep(0); setErrors({}); }}>
              <ArrowLeft className="mr-1 inline size-4" aria-hidden />
              তথ্য বদলান
            </TextButton>
            <TextButton disabled={resendIn > 0 || busy} onClick={sendCode}>
              {resendIn > 0 ? `আবার পাঠান (${toBanglaDigits(resendIn)} সে.)` : "আবার কোড পাঠান"}
            </TextButton>
          </div>
        </form>
      )}

      {step === 2 && (
        <form noValidate onSubmit={submitInterests} className="flex flex-col gap-space-lg">
          <p className="live-in flex items-center gap-space-xs rounded-2xl bg-bd-green p-space-sm font-sans text-body-sm font-semibold text-white shadow-ink">
            <ShieldCheck className="size-5 shrink-0" aria-hidden /> মোবাইল নম্বর যাচাই হয়েছে। শেষ ধাপ: কোন খবর চান?
          </p>

          <fieldset aria-describedby={errors.sectors ? "sectors-err" : undefined}>
            <legend className="mb-space-sm font-sans text-label-sm font-bold tracking-wide text-text-primary">যে খাতের খবর চান</legend>
            <div className="flex flex-wrap gap-space-xs">
              {SECTORS.map((s) => (
                <Chip key={s.id} on={sectors.includes(s.id)} onChange={() => setSectors((xs) => toggle(xs, s.id))}>
                  {s.bn}
                </Chip>
              ))}
            </div>
            {errors.sectors ? <div className="mt-space-sm"><FieldError id="sectors-err">{errors.sectors}</FieldError></div> : null}
          </fieldset>

          <fieldset>
            <legend className="mb-space-sm font-sans text-label-sm font-bold tracking-wide text-text-primary">যে পণ্য অনুসরণ করবেন (ঐচ্ছিক)</legend>
            <div className="flex flex-wrap gap-space-xs">
              {FOLLOWABLE_PRODUCTS.map((p) => (
                <Chip key={p.slug} on={products.includes(p.slug)} onChange={() => setProducts((xs) => toggle(xs, p.slug))}>
                  {p.bn} <span className="font-normal opacity-70">{p.en}</span>
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-space-sm">
            <legend className="mb-space-sm font-sans text-label-sm font-bold tracking-wide text-text-primary">কীভাবে জানাব</legend>
            <Toggle checked={notify.sms} onChange={(v) => setNotify((n) => ({ ...n, sms: v }))} label="এসএমএস" />
            <Toggle checked={notify.email && !!email.trim()} disabled={!email.trim()} onChange={(v) => setNotify((n) => ({ ...n, email: v }))} label={email.trim() ? "ইমেইল" : "ইমেইল (আগের ধাপে ইমেইল দিলে)"} />
          </fieldset>

          <label className="flex cursor-pointer items-start gap-space-sm rounded-2xl bg-text-primary/10 p-space-sm font-sans text-body-sm text-text-primary">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={errors.consent ? true : undefined} className="mt-0.5 size-5 shrink-0 accent-text-primary" />
            <span>আমি কাণ্ডারী-ল্যাবের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত। আমার নম্বর ও ইমেইল কারও কাছে বিক্রি বা হস্তান্তর করা হবে না।</span>
          </label>
          {errors.consent ? <FieldError>{errors.consent}</FieldError> : null}
          {errors.form ? <FieldError>{errors.form}</FieldError> : null}

          <div className="flex flex-col-reverse gap-space-sm sm:flex-row">
            <button type="button" onClick={() => { setStep(0); setErrors({}); }} className="inline-flex h-12 items-center justify-center gap-space-xs rounded-xl border-2 border-text-primary/30 px-space-md font-sans text-body-sm font-bold text-text-primary transition-[background-color,scale] duration-200 hover:bg-text-primary/10 active:scale-95">
              <ArrowLeft className="size-4" aria-hidden /> আগের ধাপ
            </button>
            <SubmitButton busy={busy} className="sm:flex-1">
              অ্যাকাউন্ট তৈরি করুন
            </SubmitButton>
          </div>
        </form>
      )}

      <p className="text-center font-sans text-body-md text-text-primary/85">
        আগেই অ্যাকাউন্ট আছে?{" "}
        <Link href={params.get("next") ? `/login?next=${encodeURIComponent(safeNext(params.get("next")))}` : "/login"} className="rounded font-bold text-text-primary underline decoration-text-primary/30 decoration-2 underline-offset-4 hover:text-bd-green-dark hover:decoration-bd-green-dark">
          সাইন ইন করুন
        </Link>
      </p>
    </div>
  );
}
