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
    ];
  },
};

export default nextConfig;
