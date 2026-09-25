"use client";

import * as React from "react";
import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { verifyCredentials, startSession } from "@/lib/session";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typewriter } from "@/components/ui/typewriter";
import { cn } from "@/lib/utils";

/* ── Password field ──────────────────────────────────────────────────── */

export interface PasswordInputProps
  extends React.ComponentProps<"input"> {
  label?: string;
  /** Rendered inline with the label, e.g. a "forgot password" link. */
  labelAction?: React.ReactNode;
}

function PasswordInput({
  className,
  label,
  labelAction,
  ...props
}: PasswordInputProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid w-full items-center gap-space-sm">
      {label ? (
        <div className="flex items-baseline justify-between gap-space-sm">
          <Label htmlFor={id}>{label}</Label>
          {labelAction}
        </div>
      ) : null}

      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className={cn("pe-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 inset-e-0 flex h-full w-11 items-center justify-center rounded-r-lg text-text-muted transition-colors hover:text-bd-green focus-visible:text-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/30 focus-visible:outline-none"
          aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Shared form chrome ──────────────────────────────────────────────── */

function FormHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center gap-space-sm text-center">
      <span className="inline-flex items-center gap-space-xs rounded-full border border-bd-green/20 bg-bd-green-light px-space-md py-1 font-mono text-label-xs font-bold tracking-widest text-bd-green uppercase">
        <span className="radar-indicator size-1.5 rounded-full bg-bd-green" />
        {eyebrow}
      </span>
      <h1 className="font-display text-headline-md font-bold tracking-tight text-text-primary">
        {title}
      </h1>
      <p className="max-w-[20rem] text-balance font-sans text-body-md text-text-secondary">
        {subtitle}
      </p>
    </div>
  );
}

/** Primary action — the sovereign-green fill used across the site. */
function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-space-xs inline-flex h-11 w-full items-center justify-center gap-space-sm rounded-lg bg-bd-green px-space-lg font-display text-label-md font-bold text-white shadow-sm transition-all hover:bg-bd-green-dark hover:shadow-md focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px"
    >
      {children}
      <Icon name="arrow_forward" className="text-[18px]" />
    </button>
  );
}

/* ── Forms ───────────────────────────────────────────────────────────── */

function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    if (!verifyCredentials(email, password)) {
      setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
      return;
    }

    setError(undefined);
    startSession();
    router.push("/media/me");
  };

  return (
    <form
      onSubmit={handleSignIn}
      autoComplete="on"
      className="flex flex-col gap-space-lg"
    >
      <FormHeading
        eyebrow="Sovereign Access"
        title="কাণ্ডারী পোর্টালে প্রবেশ"
        subtitle="আপনার নিবন্ধিত ইমেইল দিয়ে সদস্য পোর্টালে সাইন ইন করুন।"
      />

      <div className="grid gap-space-md">
        <div className="grid gap-space-sm">
          <Label htmlFor="signin-email">ইমেইল</Label>
          <Input
            id="signin-email"
            name="email"
            type="email"
            placeholder="name@kandari-lab.com"
            required
            autoComplete="email"
            aria-invalid={error ? true : undefined}
          />
        </div>

        <PasswordInput
          name="password"
          label="পাসওয়ার্ড"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={error ? true : undefined}
          labelAction={
            <Link
              href="/login"
              className="font-sans text-label-xs font-semibold text-bd-green normal-case transition-colors hover:text-bd-green-dark hover:underline"
            >
              ভুলে গেছেন?
            </Link>
          }
        />

        {error ? (
          <p
            role="alert"
            className="flex items-center gap-space-xs font-sans text-body-sm text-national-crimson"
          >
            <Icon name="error" className="text-base" />
            {error}
          </p>
        ) : null}

        <SubmitButton>সাইন ইন</SubmitButton>
      </div>
    </form>
  );
}

function SignUpForm() {
  const router = useRouter();

  // No enrolment backend exists yet (see lib/session.ts) — this starts the
  // same mock session as sign-in so the rest of the portal stays reachable,
  // rather than a submit button that silently does nothing.
  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startSession();
    router.push("/media/me");
  };

  return (
    <form
      onSubmit={handleSignUp}
      autoComplete="on"
      className="flex flex-col gap-space-lg"
    >
      <FormHeading
        eyebrow="Member Enrolment"
        title="কাণ্ডারী সদস্য হন"
        subtitle="জাতীয় উদ্ভাবন নেটওয়ার্কে যোগ দিতে আপনার তথ্য দিন।"
      />

      <div className="grid gap-space-md">
        <div className="grid gap-space-sm">
          <Label htmlFor="signup-name">পূর্ণ নাম</Label>
          <Input
            id="signup-name"
            name="name"
            type="text"
            placeholder="মাহির শারিয়ার মাহিন"
            required
            autoComplete="name"
          />
        </div>

        <div className="grid gap-space-sm">
          <Label htmlFor="signup-email">ইমেইল</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="name@kandari.gov.bd"
            required
            autoComplete="email"
          />
        </div>

        <PasswordInput
          name="password"
          label="পাসওয়ার্ড"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
        />

        <SubmitButton>অ্যাকাউন্ট তৈরি করুন</SubmitButton>

        {/* The quick form above opens an account; full member access needs
            NID/passport verification, which lives on its own page. */}
        <Link
          href="/signup"
          className="flex items-center justify-center gap-space-xs rounded-lg border border-card-border bg-mint-subtle px-space-md py-space-sm font-sans text-body-sm font-semibold text-text-primary transition-colors hover:border-bd-green/40 hover:bg-bd-green-light"
        >
          <Icon name="verified_user" className="text-base text-bd-green" />
          সম্পূর্ণ পরিচয় ও রিজিউমে ভেরিফিকেশন
        </Link>
      </div>
    </form>
  );
}

/* ── Form column ─────────────────────────────────────────────────────── */

function AuthFormContainer({
  isSignIn,
  onToggle,
}: {
  isSignIn: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-95 flex-col gap-space-md">
      {/* Brand lockup, moved here from the image panel so the photograph
          can be shown clear. */}
      <Link
        href="/"
        className="mx-auto flex w-fit items-center gap-space-sm rounded-xl px-space-sm py-space-xs transition-colors hover:bg-mint-subtle"
      >
        <Image
          src="/logo/logo.png"
          alt="কাণ্ডারী-ল্যাব"
          width={1432}
          height={2000}
          priority
          sizes="32px"
          className="h-11 w-auto shrink-0 object-contain"
        />
        <span className="flex flex-col text-left">
          <span className="font-bengali text-headline-sm leading-tight font-bold text-text-primary">
            কাণ্ডারী ল্যাব
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-bd-green uppercase">
            Sovereign Tech
          </span>
        </span>
      </Link>

      {isSignIn ? <SignInForm /> : <SignUpForm />}

      <div className="text-center font-sans text-body-md text-text-secondary">
        {isSignIn ? "অ্যাকাউন্ট নেই?" : "ইতিমধ্যে অ্যাকাউন্ট আছে?"}{" "}
        <button
          type="button"
          onClick={onToggle}
          className="rounded font-semibold text-bd-green underline-offset-4 transition-colors hover:text-bd-green-dark hover:underline focus-visible:ring-2 focus-visible:ring-bd-green/30 focus-visible:outline-none"
        >
          {isSignIn ? "নিবন্ধন করুন" : "সাইন ইন করুন"}
        </button>
      </div>

      <p className="text-center font-sans text-body-sm leading-relaxed text-text-muted">
        চালিয়ে যাওয়ার মাধ্যমে আপনি কাণ্ডারী নাগরিক ট্রাস্ট ও তথ্য সততা
        নীতিমালায় সম্মতি দিচ্ছেন।
      </p>
    </div>
  );
}

/* ── Brand panel ─────────────────────────────────────────────────────── */

interface AuthContentProps {
  quote?: { text: string; author: string };
  stats?: { label: string; value: string }[];
}

interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
}

const defaultSignInContent = {
  quote: {
    text: "ফাঁসির মঞ্চে গেয়ে গেল যারা জীবনের জয়গান",
    author: "কাজী নজরুল ইসলাম",
  },
  stats: [
    { label: "সক্রিয় নোড", value: "৬৪" },
    { label: "গ্রিড আপটাইম", value: "৯৯.৯৮%" },
    { label: "সিঙ্ক", value: "২৪ms" },
  ],
};

const defaultSignUpContent = {
  quote: {
    text: "কারার ঐ লৌহ কপাট, ভেঙ্গে ফেল কর রে লোপাট",
    author: "কাজী নজরুল ইসলাম",
  },
  stats: [
    { label: "গবেষণা ল্যাব", value: "০৩" },
    { label: "উদ্ভাবক", value: "১.২K" },
    { label: "ওপেন পিআর", value: "৩৪৭" },
  ],
};

/**
 * Right-hand identity panel. The upstream component used a remote stock
 * photograph; this build draws the panel from the project's own palette and
 * logo instead, so nothing depends on an external image host and the screen
 * stays on-brand.
 */
function BrandPanel({
  content,
}: {
  content: Required<AuthContentProps>;
}) {
  return (
    <div className="relative hidden overflow-hidden md:block">
      {/* The photograph is the panel — shown clear, with no colour wash
          over it. The logo now sits above the form instead. */}
      <Image
        src="/login/login.jpg"
        alt="বর্ষার জলে ডুবে থাকা মাঠের মাঝে একাকী বটগাছ, পাশ দিয়ে যাত্রীবোঝাই নৌকা"
        fill
        priority
        sizes="(min-width: 768px) 55vw, 0px"
        quality={90}
        className="object-cover object-center"
      />

      {/* Scrim only where the text sits: the lower third. The sky above
          stays untouched so the image reads clearly. */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/55 via-45% to-transparent" />

      <div className="relative z-10 flex h-full flex-col gap-space-xl p-space-xl">
        {/* Pushes the quote down so it anchors against the stats rather
            than floating in the middle of a tall column. */}
        <div className="flex-1" />

        {/* Quote. */}
        <blockquote className="flex max-w-md flex-col gap-space-md">
          <Icon
            name="format_quote"
            className="text-[40px] leading-none text-signal-orange"
            filled
          />
          <p
            className="font-bengali text-headline-md leading-snug font-semibold text-white"
            aria-label={content.quote.text}
          >
            <Typewriter
              key={content.quote.text}
              text={content.quote.text}
              speed={55}
            />
          </p>
          <cite className="font-sans text-body-md font-light text-emerald-200/90 not-italic">
            — {content.quote.author}
          </cite>
        </blockquote>

        {/* Live grid readout. */}
        <dl className="grid grid-cols-3 gap-space-md border-t border-white/15 pt-space-lg">
          {content.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="font-sans text-label-xs tracking-wide text-emerald-200/70 uppercase">
                {stat.label}
              </dt>
              <dd className="font-mono text-headline-sm font-bold text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */

export function AuthUI({ signInContent, signUpContent }: AuthUIProps = {}) {
  const [isSignIn, setIsSignIn] = useState(true);

  const content = isSignIn
    ? { ...defaultSignInContent, ...signInContent }
    : { ...defaultSignUpContent, ...signUpContent };

  return (
    <div className="w-full md:grid md:min-h-screen md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Native reveal controls duplicate the custom eye toggle in Edge. */}
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Min-height keeps the form optically centred on mobile, where the
          brand panel is hidden and the column is the whole screen. The top
          padding clears the absolutely-positioned back link. */}
      <div className="flex min-h-screen items-center justify-center bg-white px-gutter pt-space-2xl pb-space-xl md:min-h-0 md:px-space-xl md:py-space-xl">
        <AuthFormContainer
          isSignIn={isSignIn}
          onToggle={() => setIsSignIn((prev) => !prev)}
        />
      </div>

      <BrandPanel content={content} />
    </div>
  );
}
