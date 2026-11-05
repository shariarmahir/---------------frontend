import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** Accounts, the company's control room and the API stay out of search results. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/hq", "/account", "/login", "/signup"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
