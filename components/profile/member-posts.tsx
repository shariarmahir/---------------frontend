import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/feed/post-header";
import { memberPosts, type MemberPost } from "@/data/member";

/** Timeline of the member's posts and merged solutions. */
export function MemberFeed() {
  return (
    <div className="flex flex-col gap-space-sm pb-space-xl">
      {memberPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }: { post: MemberPost }) {
  return (
    <article className="bg-white p-space-md shadow-clean transition-shadow hover:shadow-elevated sm:p-space-lg">
      {post.pinned ? (
        <p className="mb-space-xs flex items-center gap-space-xs pl-12 font-grotesk text-[10px] font-bold text-bd-green">
          <Icon name="push_pin" className="text-xs" filled />
          পিন করা সলিউশন (Pinned Innovation)
        </p>
      ) : null}

      <div className="flex gap-space-md">
        <Avatar
          initials={post.initials}
          tone="mint"
          className="size-11 text-sm ring-2 ring-bd-green/20"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-space-xs">
          <div className="flex flex-wrap items-center justify-between gap-space-xs">
            <div className="flex min-w-0 flex-wrap items-center gap-space-xs">
              <span className="font-grotesk text-headline-sm font-bold text-text-primary hover:underline">
                {post.author}
              </span>
              <Icon
                name="verified"
                className="shrink-0 text-base text-bd-green"
                filled
              />
              {post.badge ? (
                <span className="rounded bg-bd-green-light px-1.5 py-0.5 font-grotesk text-[10px] font-bold text-bd-green">
                  {post.badge}
                </span>
              ) : null}
              <span className="font-sans text-body-md text-text-muted">
                {post.handle}
              </span>
              <span className="font-sans text-body-sm text-text-muted">·</span>
              <span className="font-sans text-body-sm text-text-muted">
                {post.time}
              </span>
            </div>

            <button
              type="button"
              aria-label="আরও বিকল্প"
              className="shrink-0 rounded-full p-1 text-text-muted transition-colors hover:bg-mint-subtle hover:text-text-primary"
            >
              <Icon name="more_horiz" className="text-lg" />
            </button>
          </div>

          <p className="font-sans text-body-lg leading-relaxed text-text-primary">
            {post.lead ? (
              <strong className="font-semibold text-bd-green">
                {post.lead}
              </strong>
            ) : null}
            {post.body}
            {post.hashtags ? (
              <span className="font-medium text-signal-text">
                {" "}
                {post.hashtags}
              </span>
            ) : null}
          </p>

          {post.attachment === "telemetry" ? <TelemetryCard /> : null}
          {post.attachment === "pharmacy" ? <PharmacyCard /> : null}
          {post.attachment === "pr" ? <PullRequestCard /> : null}

          <PostActions post={post} />
        </div>
      </div>
    </article>
  );
}

/** Aponjon band schematic with a live-ECG HUD overlay. */
function TelemetryCard() {
  return (
    <div className="mt-space-xs overflow-hidden rounded-xl bg-mint-subtle shadow-sm">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 sm:aspect-video">
        <div className="bg-grid-subtle absolute inset-0 opacity-40" />

        {/* The band itself, drawn rather than photographed. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-28 w-44 items-center justify-center rounded-3xl border-2 border-emerald-400/40 bg-slate-950/80 shadow-[0_0_40px_rgb(0_103_71_/_0.35)]">
            <div className="absolute -left-6 h-16 w-7 rounded-l-xl border-y-2 border-l-2 border-emerald-400/25 bg-slate-900/70" />
            <div className="absolute -right-6 h-16 w-7 rounded-r-xl border-y-2 border-r-2 border-emerald-400/25 bg-slate-900/70" />
            <div className="flex flex-col items-center gap-1">
              <Icon
                name="monitor_heart"
                className="text-3xl text-emerald-300"
              />
              <span className="font-grotesk text-[10px] font-bold tracking-widest text-emerald-200">
                78 BPM
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-space-md left-space-md flex items-center gap-space-md rounded-lg bg-slate-950/85 px-space-md py-space-xs shadow-md backdrop-blur-md">
          <span className="flex items-center gap-space-xs">
            <span className="size-2.5 animate-ping rounded-full bg-national-crimson" />
            <span className="font-grotesk text-[10px] font-bold text-amber-100">
              LIVE ECG STREAM
            </span>
          </span>
          <span className="hidden items-center gap-space-xs font-grotesk text-[10px] font-bold text-emerald-200 sm:flex">
            <span>HR: 78 BPM</span>
            <span>•</span>
            <span>SpO₂: 98%</span>
          </span>
        </div>

        <span className="absolute right-space-md bottom-space-md rounded-md bg-white/90 px-space-sm py-1 font-grotesk text-[10px] font-bold text-bd-green shadow-sm backdrop-blur-md">
          Aponjon v2.4 Micro-Band
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-white p-space-md">
        <div className="flex items-center gap-space-md">
          <span className="flex flex-col">
            <span className="font-grotesk text-[10px] font-bold text-text-muted uppercase">
              ল্যাটেন্সি ফিডব্যাক
            </span>
            <span className="font-grotesk text-headline-sm font-bold text-bd-green">
              0.4ms Local
            </span>
          </span>
          <span className="h-6 w-px bg-card-border" />
          <span className="flex flex-col">
            <span className="font-grotesk text-[10px] font-bold text-text-muted uppercase">
              নোড সিকিউরিটি
            </span>
            <span className="font-grotesk text-headline-sm font-bold text-text-primary">
              256-bit PQC
            </span>
          </span>
        </div>

        <button
          type="button"
          className="rounded-lg bg-mint-subtle px-space-md py-1 font-grotesk text-label-sm font-bold text-bd-green transition-colors hover:bg-bd-green hover:text-white"
        >
          ক্লিনিক্যাল রিপোর্ট দেখুন
        </button>
      </div>
    </div>
  );
}

/** Rural smart-pharmacy station schematic. */
function PharmacyCard() {
  return (
    <div className="mt-space-xs overflow-hidden rounded-xl bg-mint-subtle shadow-sm">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-linear-to-br from-emerald-50 via-white to-mint-subtle sm:aspect-video">
        <div className="bg-grid-subtle absolute inset-0 opacity-60" />

        {/* Three station modules: kiosk, tele-link, cold chain. */}
        <div className="absolute inset-0 flex items-center justify-center gap-space-md px-space-lg">
          {[
            { icon: "vital_signs", label: "ডায়াগ কিয়স্ক" },
            { icon: "videocam", label: "টেলি-লিঙ্ক" },
            { icon: "ac_unit", label: "কোল্ড চেইন" },
          ].map((mod) => (
            <div
              key={mod.icon}
              className="flex flex-1 flex-col items-center gap-space-xs rounded-lg border border-card-border bg-white/90 p-space-sm shadow-sm"
            >
              <Icon name={mod.icon} className="text-2xl text-bd-green" />
              <span className="text-center font-grotesk text-[10px] font-bold text-text-primary">
                {mod.label}
              </span>
            </div>
          ))}
        </div>

        <span className="absolute bottom-space-md left-space-md flex items-center gap-space-xs rounded-lg bg-white/90 px-space-md py-space-xs shadow-md backdrop-blur-md">
          <span className="size-2 rounded-full bg-bd-green" />
          <span className="font-grotesk text-[10px] font-bold text-bd-green uppercase">
            স্বস্তি ফার্মেসি হাব: রংপুর ৩ নং ইউনিয়ন
          </span>
        </span>
      </div>
    </div>
  );
}

/** Open-source pull request with a code diff. */
function PullRequestCard() {
  return (
    <div className="mt-space-xs rounded-xl bg-mint-subtle p-space-md shadow-sm">
      <div className="mb-space-xs flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-space-xs">
          <Icon name="merge" className="text-lg text-bd-green" />
          <span className="font-grotesk text-label-sm font-bold text-text-primary">
            PR #108: audio_feedback_latency_opt
          </span>
          <span className="rounded bg-bd-green-light px-2 py-0.5 font-grotesk text-[10px] font-bold text-bd-green">
            commit: #e91b40
          </span>
        </div>

        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-bd-green px-space-md py-1 font-grotesk text-[10px] font-bold text-white shadow-sm transition-all hover:bg-bd-green-dark"
        >
          <Icon name="merge_type" className="text-xs" />
          <span>Merge to Kandari Core</span>
        </button>
      </div>

      {/* Mono is right here — it is a code diff, and alignment carries
          meaning. */}
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-space-sm font-mono text-body-sm leading-relaxed text-emerald-200">
        <code>
          <span className="text-slate-500 select-none">128 </span>
          <span className="text-amber-400">def</span>{" "}
          <span className="text-white">process_lidar_distance</span>
          (delta_t, obstacle_depth):{"\n"}
          <span className="text-slate-500 select-none">129 </span>
          {"    "}
          <span className="text-emerald-300">if</span> obstacle_depth &lt;{" "}
          <span className="text-amber-200">2.0</span>:{" "}
          <span className="text-slate-400"># 2-meter acoustic zone</span>
          {"\n"}
          <span className="text-slate-500 select-none">130 </span>
          {"        "}synth_voice_bn(
          <span className="text-amber-100">
            &quot;সতর্কতা: সামনে দুই মিটারে বাধা&quot;
          </span>
          , priority=<span className="text-amber-200">0</span>)
        </code>
      </pre>
    </div>
  );
}

const ACTION =
  "flex items-center gap-space-xs rounded-full p-1 transition-colors";

function PostActions({ post }: { post: MemberPost }) {
  return (
    <div className="mt-space-sm flex max-w-xl items-center justify-between font-sans text-xs text-text-muted">
      <button
        type="button"
        className={`${ACTION} hover:text-bd-green`}
        aria-label={`${post.comments} মন্তব্য`}
      >
        <Icon name="chat_bubble" className="text-lg" />
        <span>{post.comments}</span>
      </button>

      <button
        type="button"
        className={`${ACTION} hover:text-bd-green`}
        aria-label={`${post.reposts} রিপোস্ট`}
      >
        <Icon name="repeat" className="text-lg" />
        <span>{post.reposts}</span>
      </button>

      <button
        type="button"
        className={`${ACTION} hover:text-national-crimson`}
        aria-label={`${post.likes} পছন্দ`}
      >
        <Icon name="favorite" className="text-lg" />
        <span>{post.likes}</span>
      </button>

      <button
        type="button"
        className={`${ACTION} hover:text-text-primary`}
        aria-label={`${post.views} ভিউ`}
      >
        <Icon name="bar_chart" className="text-lg" />
        <span>{post.views}</span>
      </button>

      <span className="flex items-center gap-1">
        <button
          type="button"
          aria-label="বুকমার্ক করুন"
          className={`${ACTION} hover:text-signal-text`}
        >
          <Icon name="bookmark" className="text-lg" />
        </button>
        <button
          type="button"
          aria-label="শেয়ার করুন"
          className={`${ACTION} hover:text-bd-green`}
        >
          <Icon name="ios_share" className="text-lg" />
        </button>
      </span>
    </div>
  );
}
