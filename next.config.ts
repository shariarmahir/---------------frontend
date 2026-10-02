import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero photographs are only 640–736px wide at source. Next's default
    // ladder tops out at 3840px, so a full-width hero requests a variant far
    // larger than the original — the optimiser upscales, which costs bytes
    // and looks softer than serving the file near its native size. Capping
    // the ladder keeps the served width close to what the source can back.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Next 16 only honours qualities listed here; an unlisted `quality` prop
    // silently falls back to 75. The hero photos are small and upscaled, so
    // the extra fidelity is worth the bytes.
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },
  // The social pages moved into শিক্ষিতদের মিডিয়া at /media. Temporary
  // redirects keep old links working without browsers caching the move.
  async redirects() {
    return [
      { source: "/jibaner-joygan", destination: "/media", permanent: false },
      { source: "/profile", destination: "/media/me", permanent: false },
      { source: "/u/:slug", destination: "/media/u/:slug", permanent: false },
      // The issue dossier and the news index merged into the country page.
      { source: "/amar-bangladesh", destination: "/bangladesh", permanent: false },
      { source: "/ajker-bangladesh", destination: "/bangladesh", permanent: false },
      // অপরাধ বার্তা merged into নাগরিক বার্তা.
      { source: "/media/crime", destination: "/media/civic", permanent: false },
      // ওয়ালেট merged into the dashboard; ?withdraw=1 passes through.
      { source: "/media/wallet", destination: "/media/dashboard", permanent: false },
      // The গবেষণা page made way for নাগরিক জীবন (research stays in the rooms' workspace and the feed).
      { source: "/media/research", destination: "/media/news", permanent: false },
      // টিম ও গ্রুপ, উদ্যোগ and চ্যালেঞ্জ merged into একসাথে; ?k= passes through.
      { source: "/media/teams", destination: "/media/together?v=teams", permanent: false },
      { source: "/media/events", destination: "/media/together?v=events", permanent: false },
      { source: "/media/challenges", destination: "/media/together?v=challenges", permanent: false },
    ];
  },
};

export default nextConfig;
