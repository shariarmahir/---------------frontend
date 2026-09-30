"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { KeyRound, Link2, Mail, MessageSquareText, Smartphone, UserRound } from "lucide-react";
import { AUTH_RULES, DEMO_ACCOUNTS, ROLES } from "@/data/auth";
import { consumeLink, passwordLogin, requestLink, requestOtp, verifyOtp, type ActionResult } from "@/lib/auth/client";
import { formatPhone, maskPhone, normalizePhone, safeNext, toBanglaDigits } from "@/lib/auth/validate";
import { cn } from "@/lib/utils";
import { AuthHeading } from "./auth-shell";
import { DemoMessage, FieldError, OtpInput, PasswordField, SubmitButton, TextButton, TextField, useCountdown } from "./fields";

type Tab = "phone" | "email";

interface Sent {
  phone: string;
  code: string;
  expiresAt: number;
  resendAt: number;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const token = params.get("token");

  const [tab, setTab] = useState<Tab>("phone");
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Phone + code.
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [sent, setSent] = useState<Sent | null>(null);
  const [otp, setOtp] = useState("");
  const resendIn = useCountdown(sent?.resendAt ?? null);

  // Email + password, or a one-time link.
  const [emailMode, setEmailMode] = useState<"password" | "link">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [link, setLink] = useState<{ email: string; token: string | null } | null>(null);

  const done = () => router.replace(next);

  // Arriving from a sign-in link.
  const consumed = useRef(false);
  const [linkState, setLinkState] = useState<"checking" | "failed" | null>(token ? "checking" : null);
  useEffect(() => {
    if (!token || consumed.current) return;
    consumed.current = true;
    consumeLink(token).then((r) => {
      if (r.ok) router.replace(next);
      else {
        setLinkState("failed");
        setTab("email");
        setEmailMode("link");
        setError({ message: r.message, code: r.error });
      }
    });
  }, [token, next, router]);

  async function act<T>(p: Promise<ActionResult<T>>, onOk: (v: T) => void) {
    setBusy(true);
    setError(null);
    const r = await p;
    setBusy(false);
    if (r.ok) onOk(r.value);
    else setError({ message: r.message, code: r.error });
  }

  const switchTab = (t: Tab) => {
    setTab(t);
    setError(null);
  };

  if (linkState === "checking") {
    return (
      <div role="status" className="flex flex-col items-center gap-space-md py-space-2xl text-center">
        <span className="size-10 animate-spin rounded-full border-4 border-text-primary/20 border-t-text-primary motion-reduce:animate-none" aria-hidden />
        <p className="font-sans text-body-md text-text-primary/85">লিংক যাচাই হচ্ছে…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <AuthHeading
        eyebrow="Kandari Profile"
        title="সাইন ইন করুন"
        subtitle={
          next.startsWith("/media")
            ? "শিক্ষিতদের মিডিয়া শুধু সদস্যদের জন্য — ফিড, বাজার ও কাজ দেখতে সাইন ইন করুন।"
            : next !== "/account"
              ? "এই পাতাটি দেখতে আগে সাইন ইন করুন।"
              : "এক অ্যাকাউন্টে কাণ্ডারী-ল্যাব, শিক্ষিতদের মিডিয়া ও আপনার আপডেট।"
        }
      />

      <div role="tablist" aria-label="সাইন ইনের উপায়" className="grid grid-cols-2 gap-1 rounded-2xl bg-text-primary/10 p-1">
        {([
          ["phone", "মোবাইল কোড", Smartphone],
          ["email", "ইমেইল", Mail],
        ] as const).map(([id, label, TabIcon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => switchTab(id)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-space-xs rounded-xl font-sans text-body-sm font-bold [-webkit-tap-highlight-color:transparent] transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-text-primary/40 focus-visible:outline-none active:scale-95",
              tab === id ? "bg-text-primary text-signal-orange shadow-ink" : "text-text-primary/80 hover:bg-text-primary/10 hover:text-text-primary",
            )}
          >
            <TabIcon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === "phone" ? (
        <div role="tabpanel" id="panel-phone" aria-labelledby="tab-phone">
          {!sent ? (
            <form
              noValidate
              className="flex flex-col gap-space-md"
              onSubmit={(e) => {
                e.preventDefault();
                act(requestOtp(phone, "login"), (v) => {
                  setSent({ ...v, resendAt: Date.now() + AUTH_RULES.otpResendMs });
                  setOtp("");
                });
              }}
            >
              <TextField
                label="মোবাইল নম্বর"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="০১XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                hint="আপনার নম্বরে ৬ অঙ্কের একটি কোড যাবে।"
              />
              {error ? (
                <FieldError>
                  {error.message}{" "}
                  {error.code === "no_account" ? (
                    <Link href={`/signup?phone=${encodeURIComponent(normalizePhone(phone) ?? phone)}${next !== "/account" ? `&next=${encodeURIComponent(next)}` : ""}`} className="font-bold underline underline-offset-2">
                      অ্যাকাউন্ট খুলুন
                    </Link>
                  ) : null}
                </FieldError>
              ) : null}
              <SubmitButton busy={busy}>
                <MessageSquareText className="size-4" aria-hidden /> কোড পাঠান
              </SubmitButton>
            </form>
          ) : (
            <form
              noValidate
              className="flex flex-col gap-space-md"
              onSubmit={(e) => {
                e.preventDefault();
                act(verifyOtp(sent.phone, otp), done);
              }}
            >
              <p className="font-sans text-body-md text-text-primary/85">
                <span className="font-semibold text-text-primary">{maskPhone(sent.phone)}</span> নম্বরে কোড পাঠানো হয়েছে।{" "}
                <TextButton
                  onClick={() => {
                    setSent(null);
                    setError(null);
                  }}
                >
                  নম্বর বদলান
                </TextButton>
              </p>
              <DemoMessage kind="sms">
                কাণ্ডারী-ল্যাব: আপনার সাইন-ইন কোড <strong className="font-mono text-base tracking-widest">{toBanglaDigits(sent.code)}</strong>। ৫ মিনিট কার্যকর। কাউকে জানাবেন না।{" "}
                <TextButton onClick={() => setOtp(sent.code)} className="text-signal-orange decoration-signal-orange/50 hover:text-white">
                  বসিয়ে দিন
                </TextButton>
              </DemoMessage>
              <OtpInput label="৬ অঙ্কের কোড" value={otp} onChange={setOtp} invalid={!!error} autoFocus />
              {error ? <FieldError>{error.message}</FieldError> : null}
              <SubmitButton busy={busy} disabled={otp.length < 6}>
                যাচাই করে ঢুকুন
              </SubmitButton>
              <p className="text-center font-sans text-body-sm text-text-primary/75">
                কোড আসেনি?{" "}
                <TextButton
                  disabled={resendIn > 0 || busy}
                  onClick={() =>
                    act(requestOtp(sent.phone, "login"), (v) => {
                      setSent({ ...v, resendAt: Date.now() + AUTH_RULES.otpResendMs });
                      setOtp("");
                    })
                  }
                >
                  {resendIn > 0 ? `আবার পাঠান (${toBanglaDigits(resendIn)} সে.)` : "আবার পাঠান"}
                </TextButton>
              </p>
            </form>
          )}
        </div>
      ) : (
        <div role="tabpanel" id="panel-email" aria-labelledby="tab-email">
          {emailMode === "password" ? (
            <form
              noValidate
              className="flex flex-col gap-space-md"
              onSubmit={(e) => {
                e.preventDefault();
                act(passwordLogin(identifier, password), done);
              }}
            >
              <TextField
                label="ইমেইল বা মোবাইল নম্বর"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="name@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <PasswordField
                label="পাসওয়ার্ড"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                labelAction={
                  <TextButton
                    onClick={() => {
                      setEmailMode("link");
                      setError(null);
                    }}
                  >
                    ভুলে গেছেন?
                  </TextButton>
                }
              />
              {error ? <FieldError>{error.message}</FieldError> : null}
              <SubmitButton busy={busy}>
                <KeyRound className="size-4" aria-hidden /> সাইন ইন
              </SubmitButton>
              <TextButton
                className="mx-auto"
                onClick={() => {
                  setEmailMode("link");
                  setError(null);
                }}
              >
                পাসওয়ার্ড ছাড়া, ইমেইলে লিংক নিন
              </TextButton>
            </form>
          ) : (
            <form
              noValidate
              className="flex flex-col gap-space-md"
              onSubmit={(e) => {
                e.preventDefault();
                act(requestLink(identifier), (v) => setLink({ email: identifier.trim(), token: v.token }));
              }}
            >
              <p className="font-sans text-body-md text-text-primary/85">ইমেইলে একবার-ব্যবহারযোগ্য একটি লিংক যাবে — খুললেই সাইন ইন। পাসওয়ার্ড ভুলে গেলেও এভাবে ঢুকে পরে বদলে নিতে পারবেন।</p>
              <TextField
                label="ইমেইল"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setLink(null);
                }}
                required
              />
              {error ? <FieldError>{error.message}</FieldError> : null}
              {link ? (
                <DemoMessage kind="email">
                  {link.token ? (
                    <>
                      <span className="block">প্রাপক: {link.email}</span>
                      <span className="block">বিষয়: কাণ্ডারী-ল্যাবে সাইন ইন (১৫ মিনিট কার্যকর)</span>
                      <Link
                        href={`/login?token=${link.token}${next !== "/account" ? `&next=${encodeURIComponent(next)}` : ""}`}
                        className="mt-space-sm inline-flex min-h-10 items-center gap-space-xs rounded-xl bg-signal-orange px-space-md font-bold text-text-primary transition-[scale] duration-150 active:scale-95"
                      >
                        <Link2 className="size-4" aria-hidden /> লিংক খুলে সাইন ইন করুন
                      </Link>
                    </>
                  ) : (
                    <>এই ঠিকানায় কোনো অ্যাকাউন্ট থাকলে লিংক পাঠানো হয়েছে। (ডেমো: এই ইমেইলে কোনো অ্যাকাউন্ট নেই, তাই কিছু যায়নি।)</>
                  )}
                </DemoMessage>
              ) : null}
              <SubmitButton busy={busy}>
                <Mail className="size-4" aria-hidden /> {link ? "আবার লিংক পাঠান" : "লিংক পাঠান"}
              </SubmitButton>
              <TextButton
                className="mx-auto"
                onClick={() => {
                  setEmailMode("password");
                  setError(null);
                  setLink(null);
                }}
              >
                পাসওয়ার্ড দিয়ে ঢুকুন
              </TextButton>
            </form>
          )}
        </div>
      )}

      <p className="text-center font-sans text-body-md text-text-primary/85">
        অ্যাকাউন্ট নেই?{" "}
        <Link href={next !== "/account" ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="rounded font-bold text-text-primary underline decoration-text-primary/30 decoration-2 underline-offset-4 hover:text-bd-green-dark hover:decoration-bd-green-dark">
          নতুন অ্যাকাউন্ট খুলুন
        </Link>
      </p>

      <DemoAccounts
        onPick={(a, how) => {
          setError(null);
          if (how === "phone") {
            setTab("phone");
            setSent(null);
            setPhone(a.phone);
          } else {
            setTab("email");
            setEmailMode("password");
            setIdentifier(a.email ?? a.phone);
            setPassword(a.password);
          }
        }}
      />
    </div>
  );
}

function DemoAccounts({ onPick }: { onPick: (a: (typeof DEMO_ACCOUNTS)[number], how: "phone" | "password") => void }) {
  return (
    <details className="group rounded-2xl bg-text-primary p-space-md font-sans text-body-sm text-white shadow-ink">
      <summary className="flex min-h-8 cursor-pointer list-none items-center gap-space-xs font-bold text-white marker:hidden">
        <UserRound className="size-4 text-signal-orange" aria-hidden />
        ডেমো অ্যাকাউন্ট দিয়ে দেখুন
        <span className="ml-auto text-signal-orange transition-transform group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <ul className="mt-space-sm grid gap-space-sm">
        {DEMO_ACCOUNTS.map((a) => (
          <li key={a.id} className="rounded-xl bg-signal-orange p-space-sm text-text-primary">
            <p className="font-bold text-text-primary">
              {a.name} <span className="font-normal text-text-primary/75">· {ROLES.find((r) => r.id === a.role)?.bn}</span>
            </p>
            <p className="mt-0.5 break-all text-text-primary/85">
              {formatPhone(a.phone)} · {a.email} · পাসওয়ার্ড <code className="rounded bg-text-primary/10 px-1 font-mono">{a.password}</code>
            </p>
            <div className="mt-space-xs flex flex-wrap gap-x-space-md gap-y-1">
              <TextButton onClick={() => onPick(a, "password")}>পাসওয়ার্ডে ঢুকুন</TextButton>
              <TextButton onClick={() => onPick(a, "phone")}>কোডে ঢুকুন</TextButton>
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
