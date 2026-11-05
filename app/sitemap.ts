import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/motherland-categories";
import { DETAILS } from "@/data/bd-gov-details";
import { SITE_URL } from "@/lib/site-url";

/** The public country pages, for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  const guide = "/bangladesh/government";
  const paths = [
    "/bangladesh",
    "/bangladesh/facts",
    "/bangladesh/references",
    "/bangladesh/travel/stories",
    ...CATEGORIES.map((c) => `/bangladesh/${c.slug}`),
    guide,
    ...["about", "benefits", "national-portal", ...DETAILS.map((d) => d.slug)].map((page) => `${guide}/${page}`),
  ];
  return paths.map((path) => ({ url: new URL(path, SITE_URL).href }));
}
