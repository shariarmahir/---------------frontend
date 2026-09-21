import { Icon } from "@/components/ui/icon";
import { Avatar, PostHeader, TagRow } from "@/components/feed/post-header";
import { PostStats } from "@/components/feed/post-stats";

const CARD =
  "flex flex-col gap-space-md rounded-xl border border-card-border bg-white p-space-lg shadow-clean transition-all hover:shadow-elevated";

/** POST 1 — emergency health telemetry with live ECG trace. */
export function PostTelemetry() {
  return (
    <article className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
        <div className="flex items-center gap-space-xs text-[#b86800]">
          <Icon name="crisis_alert" className="animate-pulse text-sm" />
          <span className="font-sans text-[11px] font-bold tracking-wider uppercase">
            জরুরি স্বাস্থ্য রিপোর্ট // মৌলভীবাজার ইউনিয়ন #৩
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="size-2 rounded-full bg-bd-green" />
          <span className="font-sans text-[11px] font-bold text-bd-green">
            লাইভ ট্রায়াজ সক্রিয়
          </span>
        </div>
      </div>

      <PostHeader
        author={{
          initials: "NJ",
          name: "ড. নাসরাত জাহান",
          handle: "@nusrat_swasti",
          meta: "Verified Doctor & Tele-Lead • ২ মিনিট আগে",
          verified: true,
        }}
      />

      <p className="font-sans text-base leading-relaxed text-text-primary">
        সিলেটের চা-বাগান অঞ্চলে আকস্মিক হিট-স্ট্রোক ও কার্ডিয়াক ঝুঁকি শনাক্ত
        হয়েছে। আমাদের{" "}
        <strong className="font-bold text-bd-green">
          &lsquo;আপনজন&rsquo; (Aponjon v2.4)
        </strong>{" "}
        ডিভাইসের মাধ্যমে ৪ জন শ্রমিকের অস্বাভাবিক ইসিজি (ECG) সিগন্যালে স্বস্তি
        অ্যাপ তাৎক্ষণিক নিকটস্থ পল্লী স্মার্ট ফার্মেসিতে{" "}
        <span className="rounded bg-[#ffdcc1] px-space-xs py-0.5 font-sans text-[11px] font-bold text-[#6c3a00]">
          গোল্ডেন ২-আওয়ার এলার্ট
        </span>{" "}
        পাঠিয়েছে। ২৪ মিনিটের মধ্যে অ্যাম্বুলেন্স ট্রায়াজ নিশ্চিত করা গেছে।
      </p>

      {/* Vital telemetry card. */}
      <div className="flex flex-col gap-space-md rounded-xl bg-mint-subtle p-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs font-grotesk text-xs font-bold text-text-primary">
            <Icon
              name="ecg_heart"
              className="animate-pulse text-lg text-national-crimson"
            />
            <span>লাইভ ভাইটাল টেলিমেট্রি • টি-গ্রুপ নোড #০৮৯</span>
          </div>
          <span className="rounded-full bg-[#ffdad6] px-space-sm py-0.5 font-sans text-[11px] font-bold text-[#93000a]">
            Elevated Criticality
          </span>
        </div>

        <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">
          {[
            { label: "Heart Rate", value: "118", unit: "BPM", tone: "text-national-crimson" },
            { label: "SpO2 লেভেল", value: "94", unit: "%", tone: "text-[#b86800]" },
            { label: "বডি টেম্প", value: "102.4", unit: "°F", tone: "text-national-crimson" },
            { label: "অ্যাক্সিডেন্ট ট্র্যাকিং", value: "হিট স্ট্রেস", unit: "", tone: "text-bd-green" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col rounded-lg bg-white p-space-sm"
            >
              <span className="font-sans text-[11px] text-text-muted">
                {stat.label}
              </span>
              <span
                className={`font-grotesk text-lg font-bold ${stat.tone}`}
              >
                {stat.value}
                {stat.unit ? (
                  <span className="font-sans text-xs font-normal text-text-secondary">
                    {" "}
                    {stat.unit}
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>

        {/* Continuous biosignal trace. */}
        <div className="relative flex h-28 flex-col justify-end overflow-hidden rounded-lg bg-[#0e2a1e] p-space-sm">
          <div className="absolute top-2 left-3 flex items-center gap-space-xs font-sans text-[11px] text-[#caead7]">
            <span className="size-1.5 animate-ping rounded-full bg-[#a0f4ca]" />
            <span>Aponjon Continuous Biosignal Stream (Lead II)</span>
          </div>
          <svg
            aria-hidden
            viewBox="0 0 600 80"
            fill="none"
            preserveAspectRatio="none"
            className="h-16 w-full text-[#a0f4ca]"
          >
            <path
              d="M0,40 L40,40 L55,40 L65,15 L75,70 L85,10 L95,50 L105,40 L160,40 L180,40 L195,40 L205,12 L215,72 L225,8 L235,52 L245,40 L300,40 L320,40 L335,40 L345,15 L355,70 L365,10 L375,50 L385,40 L440,40 L460,40 L475,40 L485,14 L495,74 L505,10 L515,52 L525,40 L600,40"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            className="flex items-center gap-space-xs rounded-lg bg-white px-space-md py-space-xs font-sans text-[11px] font-bold text-bd-green shadow-xs transition-colors hover:bg-bd-green-light"
          >
            <Icon name="clinical_notes" className="text-sm" />
            <span>টেলি-ডাক্তার কনসাল্টেশন রিপোর্ট দেখুন</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-space-xs rounded-lg bg-bd-green px-space-md py-space-xs font-sans text-[11px] font-bold text-white shadow-xs transition-colors hover:bg-bd-green-dark"
          >
            <Icon name="local_shipping" className="text-sm" />
            <span>জরুরি ঔষধ ও কুলিং প্যাক সরবরাহ ট্র্যাক করুন</span>
          </button>
        </div>
      </div>

      {/* Device imagery slot. */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-xs">
        <div className="relative flex h-72 items-center justify-center bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900">
          <div className="bg-grid-subtle absolute inset-0 opacity-40" />

          <div className="relative flex h-28 w-44 items-center justify-center rounded-3xl border-2 border-emerald-400/40 bg-slate-950/80 shadow-[0_0_40px_rgba(0,103,71,0.35)]">
            <div className="absolute -left-6 h-16 w-7 rounded-l-xl border-y-2 border-l-2 border-emerald-400/25 bg-slate-900/70" />
            <div className="absolute -right-6 h-16 w-7 rounded-r-xl border-y-2 border-r-2 border-emerald-400/25 bg-slate-900/70" />
            <div className="flex flex-col items-center gap-1">
              <Icon name="monitor_heart" className="text-2xl text-emerald-300" />
              <span className="font-mono text-[9px] tracking-widest text-emerald-200/80">
                APONJON
              </span>
              <span className="font-grotesk text-sm font-bold text-white">
                118 BPM
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-space-xs rounded bg-[#0e2a1e]/80 px-space-sm py-space-xs font-sans text-[11px] text-white backdrop-blur-md">
          <Icon name="sensors" className="text-sm text-[#a0f4ca]" />
          <span>Aponjon v2.4 IoT Clinical Tele-Diagnostic Band</span>
        </div>
      </div>

      <PostStats
        stats={{
          comments: "২৪২",
          reposts: "১.৪K",
          reactionIcon: "favorite",
          reactions: "৫.২K",
          views: "৪৮K ভিউ",
        }}
      />
    </article>
  );
}

/** POST 2 — open-source firmware merge. */
export function PostFirmware() {
  return (
    <article className={CARD}>
      <PostHeader
        author={{
          initials: "BR",
          name: "BUET Robotics & AI Wing",
          handle: "@buet_robotics",
          meta: "Verified Engineering Partner • ২০ মিনিট আগে",
          verified: true,
          tone: "mint",
        }}
      />

      <TagRow
        tags={[
          "#রোবোটিক্স",
          "#দৃষ্টিহীন_সহায়ক_প্রযুক্তি",
          "#ওপেনসোর্স_ফার্মওয়্যার",
        ]}
      />

      <p className="font-sans text-base leading-relaxed text-text-primary">
        দৃষ্টিহীন নাগরিকদের জন্য ২-মিটার লিডার সেন্সর বেসড অডিও নেভিগেশন
        ডিভাইসের ২য় টেস্ট সফল হয়েছে। মিরপুর ১০ গোলচত্বরের ভারী ট্রাফিকের মধ্যে{" "}
        <strong className="font-bold text-bd-green">৯৯.২% অবস্ট্যাকল</strong>{" "}
        সফলভাবে বাংলা অডিও সতর্কবার্তায় রূপান্তর করা গেছে। ফার্মওয়্যার কোড
        Kandari-Drive এ ওপেন-সোর্স করা হলো।
      </p>

      {/* Merged pull request. */}
      <div className="flex flex-col overflow-hidden rounded-xl bg-[#00140b] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-[#0e2a1e] px-space-md py-space-xs">
          <div className="flex items-center gap-space-sm font-sans text-[11px]">
            <Icon name="merge_type" className="text-sm text-[#a0f4ca]" />
            <span className="font-bold text-white">
              PR #114: sensor_lidar_haptic_feedback.rs
            </span>
            <span className="rounded bg-bd-green px-space-xs py-0.5 text-[10px] font-bold text-white">
              MERGED
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#759382]">
            Target: kandari-core:main
          </span>
        </div>

        <pre className="overflow-x-auto p-space-md font-mono text-xs leading-relaxed">
          <code>
            <span className="text-[#759382]">
              {"// বাংলা ভয়েস ও হ্যাপটিক ইন্টারাপ্ট রেন্ডারিং লজিক"}
            </span>
            {"\n"}
            <span className="text-[#ffb778]">pub fn</span>{" "}
            <span className="text-[#a0f4ca]">synthesize_bangla_warning</span>
            <span className="text-[#caead7]">(distance_cm: </span>
            <span className="text-[#ffb778]">u16</span>
            <span className="text-[#caead7]">, angle_deg: </span>
            <span className="text-[#ffb778]">i16</span>
            <span className="text-[#caead7]">{") {"}</span>
            {"\n  "}
            <span className="text-[#ffb778]">if</span>
            <span className="text-[#afcebc]"> distance_cm {"<"} </span>
            <span className="text-[#ffb778]">120</span>
            <span className="text-[#afcebc]">{" {"}</span>
            {"\n    "}
            <span className="text-[#caead7]">
              kandari_audio::play_phoneme(
            </span>
            <span className="text-[#a0f4ca]">&quot;সামনে_রিকশা_সাবধান&quot;</span>
            <span className="text-[#caead7]">);</span>
            {"\n    "}
            <span className="text-[#caead7]">
              haptic_engine::pulse_frequency(
            </span>
            <span className="text-[#ffb778]">480_Hz</span>
            <span className="text-[#caead7]">);</span>
            {"\n  "}
            <span className="text-[#afcebc]">{"}"}</span>
            {"\n"}
            <span className="text-[#caead7]">{"}"}</span>
          </code>
        </pre>

        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-[#0e2a1e]/60 px-space-md py-space-xs">
          <div className="flex items-center gap-space-xs font-sans text-[11px] text-[#a0f4ca]">
            <Icon name="check_circle" className="text-sm" />
            <span>Passed 48/48 Hardware Rig Tests</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-space-xs rounded bg-bd-green px-space-sm py-0.5 font-sans text-[11px] font-bold text-white transition-colors hover:bg-bd-green-dark"
          >
            <Icon name="download" className="text-[14px]" />
            <span>Download .hex Firmware</span>
          </button>
        </div>
      </div>

      <PostStats
        stats={{
          comments: "৮৮",
          reposts: "৬২০",
          reactionIcon: "thumb_up",
          reactions: "৩.১K",
          views: "৩২K ভিউ",
        }}
      />
    </article>
  );
}

/** POST 3 — citizen civic challenge. */
export function PostCivic() {
  return (
    <article className={CARD}>
      <PostHeader
        author={{
          initials: "TA",
          name: "তানভীর আহমেদ",
          handle: "@tanvir_ecotech",
          meta: "পরিবেশ প্রকৌশলী, রাজশাহী • ৪২ মিনিট আগে",
          tone: "neutral",
        }}
        trailing={
          <span className="shrink-0 rounded-full bg-[#ffdad6] px-space-sm py-0.5 font-sans text-[11px] font-bold text-[#93000a]">
            নাগরিক চ্যালেঞ্জ #৬৭৪
          </span>
        }
      />

      <TagRow
        tags={["#নাগরিক_সমস্যা", "#বর্জ্য_ব্যবস্থাপনা", "#রাজশাহী_সিটি"]}
        tone="neutral"
      />

      <p className="font-sans text-base leading-relaxed text-text-primary">
        রাজশাহী শহরের কাঁচাবাজারগুলোতে প্রতিদিন প্রায় ১২ টন পচনশীল জৈব বর্জ্য
        যত্রতত্র ফেলা হচ্ছে। কাণ্ডারী-ল্যাবের{" "}
        <strong className="font-bold text-bd-green">
          &lsquo;Biochemical Circular Automation&rsquo;
        </strong>{" "}
        প্রজেক্টের ওপেন স্পেক ব্যবহার করে আমরা কি স্থানীয়ভাবে একটি কমিউনিটি
        কম্পোস্টিং রোবোটিক প্ল্যান্ট স্থাপন করতে পারি? ইঞ্জিনিয়ার ও ফান্ডিং
        পার্টনার প্রয়োজন!
      </p>

      <div className="flex flex-col items-center justify-between gap-space-md rounded-xl bg-mint-subtle p-space-md sm:flex-row">
        <div className="flex items-center gap-space-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bd-green text-white">
            <Icon name="lightbulb" className="text-xl" />
          </span>
          <div className="flex flex-col">
            <span className="font-grotesk text-xs font-bold text-text-primary">
              ৪টি উদ্ভাবনী সমাধান প্রস্তাব জমা পড়েছে
            </span>
            <span className="font-sans text-[11px] text-text-secondary">
              বুয়েট ও রুয়েট বায়ো-ইঞ্জিনিয়াররা রিভিউ করছেন
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-space-xs rounded-lg bg-white px-space-md py-space-xs font-sans text-sm font-bold text-bd-green shadow-xs transition-colors hover:bg-bd-green-light sm:w-auto"
        >
          <Icon name="handyman" className="text-sm" />
          <span>সমাধান জমা দিন</span>
        </button>
      </div>

      <PostStats
        stats={{
          comments: "১৫৪",
          reposts: "৪১২",
          reactionIcon: "thumb_up",
          reactions: "২.৮K",
          views: "১৯K ভিউ",
        }}
      />
    </article>
  );
}

/** POST 4 — rural smart pharmacy milestone. */
export function PostPharmacy() {
  return (
    <article className={CARD}>
      <PostHeader
        author={{
          initials: "MM",
          name: "Mahir Shariar Mahin",
          handle: "@mahir_kandari",
          meta: "Architect #001 • ১ ঘণ্টা আগে",
          verified: true,
          tone: "mint",
        }}
      />

      <p className="font-sans text-base leading-relaxed text-text-primary">
        রংপুরের তারাগঞ্জে আজ আমাদের ১৫তম{" "}
        <strong className="font-bold text-bd-green">
          &lsquo;One Village, One Medical Healthcare Center&rsquo;
        </strong>{" "}
        চালু হলো। স্থানীয় গ্রামীণ ফার্মেসি এখন সম্পূর্ণ সোলার-পাওয়ার্ড এবং
        স্বস্তি অ্যাপের সাথে সার্বক্ষণিক সিঙ্কড। গ্রামীণ মানুষের জন্য বিশ্বমানের
        টেলি-ডাক্তার ও জেনুইন মেডিসিন আর বিলাসিতা নয়, এটি সার্বভৌম অধিকার।
      </p>

      {/* Pharmacy imagery slot. */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-xs">
        <div className="relative flex h-80 items-center justify-center bg-linear-to-br from-emerald-900 via-slate-900 to-emerald-950">
          <div className="bg-grid-subtle absolute inset-0 opacity-30" />

          <div className="relative flex flex-col items-center gap-5">
            <div className="flex items-end gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-7 rounded-t border border-emerald-400/30 bg-emerald-500/15"
                  style={{ height: `${28 + i * 6}px` }}
                />
              ))}
            </div>

            <div className="flex w-56 flex-col gap-2 rounded-xl border border-emerald-400/30 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2">
                <Icon
                  name="local_pharmacy"
                  className="text-xl text-emerald-300"
                />
                <span className="font-grotesk text-sm font-bold text-white">
                  SMART PHARMACY
                </span>
              </div>
              <div className="h-px bg-emerald-400/20" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[9px] whitespace-nowrap text-emerald-200/80">
                <span>◦ TELE-DOCTOR</span>
                <span>◦ COLD CHAIN</span>
                <span>◦ DIAG KIOSK</span>
                <span>◦ SOLAR CELL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-space-xs rounded-lg bg-white/90 px-space-sm py-space-xs font-sans text-[11px] text-text-primary shadow-xs backdrop-blur-md">
          <Icon name="solar_power" className="text-sm text-bd-green" />
          <span>তারাগঞ্জ পাইলট হাব #১৫ • ১০০% সোলার শক্তি চালিত</span>
        </div>
      </div>

      <div className="flex items-center gap-space-sm rounded-lg bg-mint-subtle p-space-sm">
        <Icon name="verified" className="text-xl text-bd-green" filled />
        <span className="font-sans text-xs text-text-primary">
          ৩৬০+ গ্রামবাসী আজ সম্পূর্ণ বিনামূল্যে প্রাথমিক বায়োমেট্রিক ও
          টেলি-ডাক্তার চেকআপ করিয়েছেন।
        </span>
      </div>

      <PostStats
        stats={{
          comments: "৩১২",
          reposts: "১.৮K",
          reactionIcon: "favorite",
          reactions: "৬.৪K",
          views: "৬২K ভিউ",
        }}
      />
    </article>
  );
}

/** POST 5 — cleanroom semiconductor update. */
export function PostCleanroom() {
  return (
    <article className={CARD}>
      <PostHeader
        author={{
          initials: "DH",
          name: "Dhaka Advanced Research Hub",
          handle: "@dhaka_deeptech",
          meta: "State Semiconductor Fab Lab • ৩ ঘণ্টা আগে",
          verified: true,
        }}
      />

      <p className="font-sans text-base leading-relaxed text-text-primary">
        আমাদের আইএসও ক্লাস-৫ (ISO Class-5) ক্লিনরুমে দেশীয় মাইক্রো-রোবোটিক
        অ্যাসেম্বলি এবং চিপ প্যাকেজিং ট্রায়াল পুরোদমে চলছে। বাংলাদেশের
        বিজ্ঞানীদের এই দল আগামী প্রান্তিকে প্রথম মেমরি কন্ট্রোলার চিপের
        কোয়ালিফিকেশন পরীক্ষা সম্পন্ন করবে।
      </p>

      {/* Cleanroom imagery slot. */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-xs">
        <div className="relative flex h-72 items-center justify-center bg-linear-to-br from-slate-900 via-[#04140e] to-slate-950">
          <div className="bg-grid-subtle absolute inset-0 opacity-30" />

          {/* Wafer schematic. */}
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative grid size-32 grid-cols-4 grid-rows-4 gap-1 rounded-full border-2 border-emerald-400/30 p-3">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-xs border border-emerald-400/25 bg-emerald-500/10"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-emerald-200/80">
              <span className="rounded border border-emerald-400/25 px-2 py-0.5">
                RISC-V
              </span>
              <span className="rounded border border-emerald-400/25 px-2 py-0.5">
                28nm
              </span>
              <span className="rounded border border-emerald-400/25 px-2 py-0.5">
                ISO-5
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-space-xs rounded bg-[#0e2a1e]/85 px-space-sm py-space-xs font-sans text-[11px] text-white backdrop-blur-md">
          <Icon
            name="precision_manufacturing"
            className="text-sm text-[#a0f4ca]"
          />
          <span>ISO Class-5 Cleanroom • Sylhet &amp; Dhaka Node Integration</span>
        </div>
      </div>

      <PostStats
        stats={{
          comments: "১৯২",
          reposts: "৮৪৫",
          reactionIcon: "thumb_up",
          reactions: "৪.৭K",
          views: "৪৫K ভিউ",
        }}
      />
    </article>
  );
}

/** Feed tail — live status. */
export function FeedEnd() {
  return (
    <div className="flex flex-col items-center justify-center gap-space-xs py-space-lg text-text-muted">
      <div className="flex items-center gap-space-xs font-sans text-[11px] font-bold text-bd-green">
        <span className="size-2 animate-pulse rounded-full bg-bd-green" />
        <span>আপনি আপ-টু-ডেট আছেন • সমস্ত নোড সক্রিয়</span>
      </div>
      <p className="text-center font-sans text-[11px]">
        নতুন উদ্ভাবন প্রস্তাব বা স্থানীয় সমস্যা পোস্ট হলে ফিড স্বয়ংক্রিয়
        রিফ্রেশ হবে।
      </p>
    </div>
  );
}

export { Avatar };
