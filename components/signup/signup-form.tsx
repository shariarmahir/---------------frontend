"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Panel, PanelHead } from "@/components/signup/signup-masthead";
import {
  bloodGroups,
  careerRoles,
  consentLines,
  districts,
  divisions,
  docTypes,
  engineeringDomains,
  livenessChecks,
} from "@/data/signup";
import { cn } from "@/lib/utils";

/** Section 1 — account, contact, and health identity. */
export function SectionAccount() {
  return (
    <Panel>
      <PanelHead
        icon="badge"
        title="১. একাউন্ট, যোগাযোগ ও স্বাস্থ্য-পরিচয় তথ্য"
        chip="প্রাথমিক প্রোফাইল"
      />

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <Field
          label="Full Legal Name (English as per NID/Passport)"
          htmlFor="legal_name_en"
          required
        >
          <Input
            id="legal_name_en"
            name="legal_name_en"
            placeholder="Enter name in English"
            defaultValue="Mahir Shariar Mahin"
            autoComplete="name"
          />
        </Field>

        <Field
          label="পূর্ণ নাম (পাসপোর্টের তথ্যমতে বাংলায়)"
          htmlFor="legal_name_bn"
          required
        >
          <Input
            id="legal_name_bn"
            name="legal_name_bn"
            placeholder="বাংলায় নাম লিখুন"
            defaultValue="মাহির শারিয়ার মাহিন"
          />
        </Field>

        <GenderPicker />

        <Field
          label="রক্তের গ্রুপ (Blood Group)"
          htmlFor="blood_group"
          required
        >
          <Select id="blood_group" name="blood_group" defaultValue={bloodGroups[0]}>
            {bloodGroups.map((group) => (
              <option key={group}>{group}</option>
            ))}
          </Select>
        </Field>

        <Field
          label="অফিসিয়াল / প্রফেশনাল ইমেইল"
          htmlFor="official_email"
          required
        >
          <div className="relative flex items-center">
            <Input
              id="official_email"
              name="official_email"
              type="email"
              className="pr-28"
              placeholder="researcher@institute.edu.bd"
              defaultValue="mahir@kandarilab.gov.bd"
              autoComplete="email"
            />
            <span className="absolute right-2 flex items-center gap-1 rounded bg-bd-green-light px-2 py-0.5 font-grotesk text-[10px] font-bold text-bd-green">
              <Icon name="verified" className="text-xs" />
              যাচাইকৃত
            </span>
          </div>
        </Field>

        <Field
          label="বাংলাদেশ মোবাইল নম্বর (OTP যাচাইয়ের জন্য)"
          htmlFor="bd_mobile"
          required
        >
          <div className="relative flex items-center">
            <Input
              id="bd_mobile"
              name="bd_mobile"
              type="tel"
              className="pr-32"
              placeholder="+880 1XXX-XXXXXX"
              defaultValue="+880 1712-984251"
              autoComplete="tel"
            />
            <span className="absolute right-2 flex items-center gap-1 rounded bg-bd-green-light px-2 py-0.5 font-grotesk text-[10px] font-bold text-bd-green">
              <Icon name="check_circle" className="text-xs" />
              OTP Verified
            </span>
          </div>
        </Field>

        <Field
          className="sm:col-span-2"
          label="নিরাপদ পাসওয়ার্ড (PQC-Compliant 256-Bit)"
          htmlFor="pqc_password"
          required
          hint={
            <span className="font-grotesk text-[10px] font-bold text-bd-green">
              এনক্রিপশন স্কোর: ১০০% (সর্বোচ্চ)
            </span>
          }
        >
          <Input
            id="pqc_password"
            name="pqc_password"
            type="password"
            placeholder="কমপক্ষে ১০ অক্ষর, বিশেষ চিহ্ন ও সংখ্যা"
            defaultValue="Kandari#BioSec2025!"
            autoComplete="new-password"
          />
          <div
            role="img"
            aria-label="পাসওয়ার্ড শক্তি: ১০০ শতাংশ"
            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-mint-subtle"
          >
            <div className="h-full w-full bg-bd-green" />
          </div>
        </Field>
      </div>
    </Panel>
  );
}

function GenderPicker() {
  const [gender, setGender] = useState("male");
  const options = [
    { id: "male", label: "পুরুষ (Male)" },
    { id: "female", label: "নারী (Female)" },
  ];

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="font-grotesk text-label-sm font-semibold text-text-primary">
        লিঙ্গ (Gender)
        <span className="text-national-crimson" aria-hidden>
          {" "}
          *
        </span>
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-grotesk text-label-sm transition-all",
              gender === opt.id
                ? "border-bd-green bg-bd-green-light text-bd-green shadow-sm"
                : "border-card-border bg-white text-text-primary hover:bg-mint-subtle",
            )}
          >
            <input
              type="radio"
              name="user_gender"
              value={opt.id}
              checked={gender === opt.id}
              onChange={() => setGender(opt.id)}
              className="size-4 accent-bd-green"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Section 2 — NID / passport verification engine. */
export function SectionIdentity() {
  const [docType, setDocType] = useState("nid");

  return (
    <Panel>
      <PanelHead
        icon="verified_user"
        title="২. জাতীয় পরিচয়পত্র / পাসপোর্ট ভেরিফিকেশন ইঞ্জিন"
        chip="সরকারি সার্ভার সক্রিয়"
        chipTone="neutral"
      />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1 font-grotesk text-label-sm font-semibold text-text-primary">
          ভেরিফিকেশনের জন্য ডকুমেন্ট টাইপ নির্বাচন করুন
          <span className="text-national-crimson" aria-hidden>
            {" "}
            *
          </span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {docTypes.map((doc) => (
            <label
              key={doc.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg p-space-sm shadow-sm transition-all",
                docType === doc.id
                  ? "border-2 border-bd-green bg-bd-green-light"
                  : "border border-card-border bg-white hover:bg-mint-subtle",
              )}
            >
              <input
                type="radio"
                name="id_doc_type"
                value={doc.id}
                checked={docType === doc.id}
                onChange={() => setDocType(doc.id)}
                className="size-4 shrink-0 accent-bd-green"
              />
              <span className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    "font-grotesk text-label-sm font-bold",
                    docType === doc.id ? "text-text-primary" : "text-text-primary",
                  )}
                >
                  {doc.title}
                </span>
                <span
                  className={cn(
                    "font-sans text-[10px]",
                    docType === doc.id ? "text-bd-green" : "text-text-secondary",
                  )}
                >
                  {doc.note}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-3">
        <Field label="এনআইডি / পাসপোর্ট নম্বর" htmlFor="nid_number" required>
          <div className="relative flex items-center">
            <Input
              id="nid_number"
              name="nid_number"
              className="pr-10 font-semibold tracking-widest"
              placeholder="5918239014"
              defaultValue="5918239014"
            />
            <Icon
              name="task_alt"
              className="absolute right-3 text-lg text-bd-green"
            />
          </div>
        </Field>

        <Field label="জন্ম তারিখ (Date of Birth)" htmlFor="dob_input" required>
          <Input id="dob_input" name="dob" type="date" defaultValue="1998-04-14" />
        </Field>

        <Field label="মেয়াদোত্তীর্ণ / ইস্যু ডেট" htmlFor="doc_expiry">
          <Input
            id="doc_expiry"
            name="doc_expiry"
            type="date"
            defaultValue="2032-11-20"
          />
        </Field>
      </div>

      <div className="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <UploadSlot
          title="NID সম্মুখভাগ / পাসপোর্ট বায়ো পেজ"
          badge="OCR ম্যাচ ১০০%"
          badgeIcon="auto_awesome"
          icon="contact_emergency"
          file="Smart_NID_Front_Scan.jpg"
          meta="১.৮ এমবি • 300 DPI রিয়েল-টাইম এক্সট্রাক্ট"
          note="✓ নির্বাচন কমিশন ও পাসপোর্ট ডাটাবেজ সিঙ্ক"
        />
        <UploadSlot
          title="NID পেছনের ভাগ / পাসপোর্ট ব্যাক পেজ"
          badge="MRZ ও QR ডিকোড সম্পন্ন"
          badgeIcon="qr_code_scanner"
          icon="qr_code_2"
          file="Smart_NID_Back_Address.jpg"
          meta="১.৫ এমবি • ঠিকানা: মৌলভীবাজার সদর"
          note="✓ জেলা নোড ও পোস্টাল কোড স্বয়ংক্রিয় সিঙ্ক"
        />
      </div>

      <p className="mt-space-md flex items-start gap-2 rounded-lg bg-mint-subtle p-space-sm font-sans text-body-sm text-text-secondary">
        <Icon name="security_update_good" className="text-xl text-bd-green" />
        <span>
          OCR &amp; MRZ স্ট্যাটাস: অপটিক্যাল ক্যারেক্টার ও মেশিন-রিডেবল জোনের
          মাধ্যমে আপনার নাম, পিতা-মাতার নাম ও স্থায়ী ঠিকানা জাতীয়
          পরিচয়পত্র/ই-পাসপোর্ট ডাটাবেজের সাথে নির্ভুলভাবে মিল পাওয়া গেছে।
        </span>
      </p>
    </Panel>
  );
}

function UploadSlot({
  title,
  badge,
  badgeIcon,
  icon,
  file,
  meta,
  note,
}: {
  title: string;
  badge: string;
  badgeIcon: string;
  icon: string;
  file: string;
  meta: string;
  note: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-mint-subtle p-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-xs">
        <span className="font-grotesk text-label-sm font-bold text-text-primary">
          {title}
        </span>
        <span className="flex items-center gap-1 font-grotesk text-[10px] font-semibold text-bd-green">
          <Icon name={badgeIcon} className="text-xs" />
          {badge}
        </span>
      </div>

      <div className="flex min-h-[130px] flex-col items-center justify-center rounded-lg border border-dashed border-bd-green/40 bg-white p-space-md text-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-12 shrink-0 items-center justify-center rounded bg-mint-subtle text-bd-green">
            <Icon name={icon} className="text-3xl" />
          </span>
          <span className="flex flex-col text-left">
            <span className="font-grotesk text-label-sm font-semibold text-text-primary">
              {file}
            </span>
            <span className="font-sans text-body-sm text-text-secondary">
              {meta}
            </span>
            <span className="mt-0.5 font-grotesk text-[10px] text-bd-green">
              {note}
            </span>
          </span>
        </div>
        <button
          type="button"
          className="mt-2.5 rounded bg-mint-subtle px-space-sm py-1 font-grotesk text-[10px] font-semibold text-text-primary transition-colors hover:bg-bd-green-light"
        >
          পুনরায় আপলোড করুন
        </button>
      </div>
    </div>
  );
}

/** Section 3 — career domain and resume fields. */
export function SectionCareer() {
  const [role, setRole] = useState("engineer");

  return (
    <Panel>
      <PanelHead
        icon="engineering"
        title="৩. পেশাগত যোগ্যতা ও ক্যারিয়ার ডোমেইন নির্বাচন"
        chip="রিজিউমে ক্যাটাগরি"
      />

      <fieldset>
        <legend className="sr-only">ক্যারিয়ার ডোমেইন</legend>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 lg:grid-cols-3">
          {careerRoles.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer flex-col justify-between rounded-lg p-space-md shadow-sm transition-all",
                role === item.id
                  ? "border-2 border-bd-green bg-bd-green-light"
                  : "border border-card-border bg-white hover:bg-mint-subtle",
              )}
            >
              <span className="flex items-start justify-between gap-space-xs">
                <span className="flex items-center gap-2">
                  <Icon name={item.icon} className="text-xl text-bd-green" />
                  <span className="font-grotesk text-label-md font-semibold text-text-primary">
                    {item.title}
                  </span>
                </span>
                <input
                  type="radio"
                  name="academic_role"
                  value={item.id}
                  checked={role === item.id}
                  onChange={() => setRole(item.id)}
                  className="mt-1 size-4 shrink-0 accent-bd-green"
                />
              </span>
              <span
                className={cn(
                  "mt-2 font-sans text-body-sm",
                  role === item.id
                    ? "font-medium text-text-primary"
                    : "text-text-secondary",
                )}
              >
                {item.note}
              </span>

              {item.id === "student" && role === "student" ? (
                <span className="mt-3 flex flex-col gap-2 border-t border-card-border pt-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-bd-green bg-white px-space-sm py-1.5 font-grotesk text-[10px] font-semibold text-bd-green shadow-sm transition-all hover:bg-bd-green-light"
                  >
                    <Icon name="upload_file" className="text-base" />
                    রিসার্চ বা উদ্ভাবন আপলোড করুন
                  </button>
                </span>
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Engineer specification block. */}
      <div className="mt-space-md flex flex-col gap-space-md rounded-lg border border-card-border bg-mint-subtle p-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <span className="font-grotesk text-label-sm font-bold text-text-primary">
            প্রকৌশলী ও উদ্ভাবক স্পেসিফিকেশন (সিভি ও পিয়ার ভেরিফিকেশন)
          </span>
          <span className="font-grotesk text-[10px] text-bd-green">
            IEB / IEEE / গিটহাব লিঙ্কিং
          </span>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <Field label="মূল প্রকৌশল ও প্রযুক্তি ডোমেইন" htmlFor="core_spec" required>
            <Select id="core_spec" name="core_spec">
              {engineeringDomains.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>

          <Field
            label="পেশাগত লাইসেন্স / রেজিস্ট্রেশন নম্বর"
            htmlFor="ieb_membership"
          >
            <Input
              id="ieb_membership"
              name="ieb_membership"
              defaultValue="M/42981-IEB (Dhaka Centre)"
            />
          </Field>

          <Field label="পদবী বা বর্তমান ক্যারিয়ার রোল" htmlFor="current_title" required>
            <Input
              id="current_title"
              name="current_title"
              defaultValue="Lead Deep-Tech Systems Engineer"
            />
          </Field>

          <Field
            label="বর্তমান প্রতিষ্ঠান / ল্যাবরেটরি"
            htmlFor="institution_affiliation"
            required
          >
            <Input
              id="institution_affiliation"
              name="institution_affiliation"
              defaultValue="Kandari Autonomous Lab & BUET R&D Hub"
            />
          </Field>
        </div>
      </div>

      {/* Others / freelancer skillset block. */}
      <div className="mt-space-md flex flex-col gap-space-sm rounded-lg border border-card-border bg-mint-subtle p-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <span className="flex items-center gap-2">
            <Icon name="badge" className="text-lg text-bd-green" />
            <span className="font-grotesk text-label-sm font-bold text-text-primary">
              অন্যান্য পেশা ও স্কিলসেট আর্কিটেকচার
            </span>
          </span>
          <span className="rounded bg-bd-green-light px-2 py-0.5 font-grotesk text-[10px] font-semibold text-bd-green">
            রিজিউমে জেনারেটর ফিড
          </span>
        </div>

        <div className="mt-1 grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <Field label="পেশা / কর্মক্ষেত্রের ধরণ" htmlFor="other_occupation">
            <Input
              id="other_occupation"
              name="other_occupation"
              placeholder="যেমন: UX/UI ডিজাইনার, ডেটা অ্যানালিস্ট"
              defaultValue="Hardware Architect & Research Fellow"
            />
          </Field>

          <Field label="মূল দক্ষতা ও কি-ওয়ার্ডস (Skills Tags)" htmlFor="core_skills">
            <Input
              id="core_skills"
              name="core_skills"
              placeholder="কমা দিয়ে লিখুন, যেমন: Verilog, FPGA, AI"
              defaultValue="RISC-V, Embedded C, Bio-Sensors, Telemetry, Edge-AI"
            />
          </Field>

          <Field
            className="sm:col-span-2"
            label="সংক্ষিপ্ত প্রফেশনাল বায়ো বা ক্যারিয়ার অবজেক্টিভ"
            htmlFor="career_bio"
          >
            <Textarea
              id="career_bio"
              name="career_bio"
              rows={2}
              defaultValue="ডিপ-টেক ও হেলথকেয়ার হার্ডওয়্যারে ৫+ বছরের গবেষণার অভিজ্ঞতা। দেশীয় সেমিকন্ডাক্টর ও সার্বভৌম টেলিমেডিসিন নেটওয়ার্ক গড়ে তুলতে নিবেদিতপ্রাণ।"
            />
          </Field>
        </div>
      </div>
    </Panel>
  );
}

/** Section 4 — portfolio and social links. */
export function SectionLinks() {
  return (
    <Panel className="border-2 border-bd-green/20">
      <PanelHead
        icon="language"
        title="৪. ওয়েবসাইট, পোর্টফোলিও ও সোশ্যাল নেটওয়ার্ক লিঙ্ক"
        chip="⚡ অটো-রিজিউমে সিঙ্ক"
      />

      <div className="flex items-center gap-3 rounded-lg border border-bd-green/30 bg-bd-green-light p-space-sm">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bd-green text-white">
          <Icon name="bolt" className="text-base" />
        </span>
        <p className="font-sans text-body-sm text-text-primary">
          <strong className="font-semibold">
            স্বয়ংক্রিয় রিজিউমে বিল্ডার প্রস্তুত:
          </strong>{" "}
          এই তথ্যগুলো সরাসরি আপনার কাণ্ডারী পাবলিক সিভি, গবেষক প্রোফাইল ও
          আন্তর্জাতিক প্রযুক্তি নেটওয়ার্কে প্রদর্শিত হবে।
        </p>
      </div>

      <div className="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <Field
          label={
            <span className="inline-flex items-center gap-1.5">
              <Icon name="public" className="text-base text-bd-green" />
              ব্যক্তিগত ওয়েবসাইট বা পোর্টফোলিও URL
            </span>
          }
          htmlFor="personal_website"
        >
          <div className="relative flex items-center">
            <span className="absolute left-3 font-grotesk text-label-sm text-text-muted select-none">
              https://
            </span>
            <Input
              id="personal_website"
              name="personal_website"
              className="pl-16"
              placeholder="mahirshariar.dev"
              defaultValue="mahir-innovations.bd"
            />
          </div>
        </Field>

        <Field
          label={
            <span className="inline-flex items-center gap-1.5">
              <Icon name="code" className="text-base text-bd-green" />
              গিটহাব / রিসার্চগেট / ক্যাগল প্রোফাইল
            </span>
          }
          htmlFor="github_profile"
        >
          <div className="relative flex items-center">
            <Input
              id="github_profile"
              name="github_profile"
              type="url"
              className="pr-10"
              defaultValue="https://github.com/mahir-kandari"
            />
            <Icon
              name="open_in_new"
              className="absolute right-3 text-base text-bd-green"
            />
          </div>
        </Field>

        <Field
          label={
            <span className="inline-flex items-center gap-1.5">
              <Icon name="business_center" className="text-base text-bd-green" />
              লিংকডইন প্রফেশনাল প্রোফাইল
            </span>
          }
          htmlFor="linkedin_profile"
        >
          <div className="relative flex items-center">
            <Input
              id="linkedin_profile"
              name="linkedin_profile"
              type="url"
              className="pr-10"
              defaultValue="https://linkedin.com/in/mahir-shariar-mahin"
            />
            <Icon
              name="check_circle"
              className="absolute right-3 text-base text-bd-green"
            />
          </div>
        </Field>

        <Field
          label={
            <span className="inline-flex items-center gap-1.5">
              <Icon name="share" className="text-base text-bd-green" />
              এক্স (Twitter) বা সোশ্যাল হ্যান্ডেল
            </span>
          }
          htmlFor="x_profile"
        >
          <div className="relative flex items-center">
            <span className="absolute left-3 font-grotesk text-label-sm text-text-muted select-none">
              @
            </span>
            <Input
              id="x_profile"
              name="x_profile"
              className="pl-8"
              placeholder="mahir_kandari"
              defaultValue="mahir_kandari_bd"
            />
          </div>
        </Field>
      </div>
    </Panel>
  );
}

/** Section 5 — facial biometric / liveness. */
export function SectionBiometric() {
  return (
    <Panel>
      <PanelHead
        icon="face"
        title="৫. ফেসিয়াল বায়োমেট্রিক ও লাইভ সেলফি যাচাই"
        chip="অ্যান্টি-স্পুফিং সক্রিয়"
      />

      <div className="grid grid-cols-1 items-center gap-space-md md:grid-cols-12">
        <div className="flex flex-col items-center md:col-span-5">
          {/* Capture frame — a schematic, since no camera is wired. */}
          <div className="relative flex aspect-square w-full max-w-60 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-emerald-950 via-slate-900 to-emerald-950 shadow-inner">
            <div className="bg-grid-subtle absolute inset-0 opacity-30" />
            <Icon
              name="person"
              className="text-[110px] text-emerald-300/40"
              filled
            />
            <div className="pointer-events-none absolute inset-0 m-6 animate-pulse rounded-full border-2 border-dashed border-bd-green/70" />

            <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-slate-950/80 px-2 py-0.5 font-grotesk text-[10px] text-white backdrop-blur-sm">
              <span className="size-2 animate-ping rounded-full bg-bd-green" />
              লাইভ ফেস ডিটেকশন
            </span>
            <span className="absolute inset-x-2 bottom-2 rounded bg-slate-950/80 px-2 py-1 text-center font-grotesk text-[10px] text-emerald-300 backdrop-blur-sm">
              আই ট্র্যাকিং: যাচাইকৃত (Score: 99.4%)
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-space-sm md:col-span-7">
          <p className="flex items-center gap-2 text-bd-green">
            <Icon name="task_alt" className="text-xl" />
            <span className="font-grotesk text-label-md font-bold">
              লাইভনেস ডিটেকশন সম্পন্ন হয়েছে
            </span>
          </p>
          <p className="font-sans text-body-md text-text-secondary">
            আপনার লাইভ ফেস মেশ এবং এনআইডি/পাসপোর্টে থাকা ছবি মিলিয়ে
            স্বয়ংক্রিয়ভাবে বায়োমেট্রিক আইডি ও সিভি পাসপোর্ট তৈরি করা হয়েছে।
          </p>

          <ul className="flex flex-col gap-1.5 rounded-lg border border-card-border bg-mint-subtle p-space-sm">
            {livenessChecks.map((check) => (
              <li key={check} className="flex items-center gap-2">
                <Icon name="check" className="text-base text-bd-green" />
                <span className="font-sans text-body-sm text-text-primary">
                  {check}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-mint-subtle px-space-md py-1.5 font-grotesk text-[10px] font-semibold text-text-primary transition-colors hover:bg-bd-green-light"
            >
              <Icon name="photo_camera" className="text-base" />
              আবার ছবি তুলুন
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-mint-subtle px-space-md py-1.5 font-grotesk text-[10px] font-semibold text-text-primary transition-colors hover:bg-bd-green-light"
            >
              <Icon name="upload_file" className="text-base" />
              হাই-রেজ পাসপোর্ট সাইজ দিন
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/** Section 6 — district node mapping. */
export function SectionDistrict() {
  return (
    <Panel>
      <PanelHead
        icon="pin_drop"
        title="৬. জেলা নোড ও ভৌগোলিক ম্যাপিং (৬৪ জেলা এক্সেস)"
        chip="টেলিমেডিসিন ও ল্যাব হাব"
      />

      <p className="font-sans text-body-md text-text-secondary">
        কাণ্ডারী-ল্যাবের বিকেন্দ্রীকৃত এজ সার্ভার নেটওয়ার্কে যুক্ত হতে আপনার
        স্থানীয় ভৌগোলিক অবস্থান নির্বাচন করুন।
      </p>

      <div className="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-3">
        <Field label="বিভাগ (Division)" htmlFor="division_select" required>
          <Select id="division_select" name="division" defaultValue={divisions[2]}>
            {divisions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>

        <Field label="জেলা (64 Districts)" htmlFor="district_select" required>
          <Select id="district_select" name="district">
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>

        <Field label="উপজেলা / থানা ও ইউনিয়ন" htmlFor="upazila_input" required>
          <Input
            id="upazila_input"
            name="upazila"
            defaultValue="মৌলভীবাজার সদর, খলিলপুর ইউনিয়ন"
          />
        </Field>
      </div>

      <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm rounded-lg bg-mint-subtle p-space-sm">
        <span className="flex items-center gap-2">
          <Icon name="router" className="text-xl text-bd-green" />
          <span className="font-sans text-body-sm text-text-primary">
            নিকটস্থ এসডিএন নোড:{" "}
            <strong className="font-grotesk font-semibold">SYL-MB-NODE-04</strong>{" "}
            (লেটেন্সি: ৪.২ মিলি-সেকেন্ড)
          </span>
        </span>
        <span className="font-grotesk text-[10px] font-bold text-bd-green">
          সিঙ্কড্
        </span>
      </div>
    </Panel>
  );
}

/** Section 7 — consent and submit. */
export function SectionConsent() {
  const [agreed, setAgreed] = useState([true, true]);
  const canSubmit = agreed.every(Boolean);

  const toggle = (i: number) =>
    setAgreed((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <Panel>
      <div className="flex flex-col gap-space-sm">
        {consentLines.map((line, i) => (
          <label key={i} className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreed[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 size-5 shrink-0 rounded accent-bd-green"
            />
            <span className="font-sans text-body-md text-text-primary">
              {line}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-space-md flex flex-col items-center justify-between gap-space-md border-t border-card-border pt-space-md sm:flex-row">
        <button
          type="button"
          className="w-full rounded-lg bg-mint-subtle px-space-lg py-space-md text-center font-grotesk text-label-sm font-semibold text-text-primary shadow-sm transition-colors hover:bg-bd-green-light sm:w-auto"
        >
          খসড়া সংরক্ষণ করুন (Save Draft)
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-signal-orange px-space-xl py-space-md font-grotesk text-headline-sm font-bold text-text-primary shadow-glow-orange transition-all hover:bg-amber-600 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-signal-orange sm:w-auto"
        >
          <span>সম্পূর্ণ পরিচয় যাচাই ও রিজিউমে প্রোফাইল নিশ্চিত করুন</span>
          <Icon name="arrow_forward" className="text-xl" />
        </button>
      </div>
    </Panel>
  );
}
