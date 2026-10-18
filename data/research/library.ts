import type { Article } from "@/lib/research/core";
import { sampleArticles } from "./articles.ts";
import { crowFalconProposal } from "./crow-falcon.ts";
import { farmGatePaper } from "./farm-gate.ts";

/** Everything in Genius that ships with the site: real papers first, then the labelled samples. */
export const libraryArticles: Article[] = [crowFalconProposal, farmGatePaper, ...sampleArticles];

export const findArticle = (slug: string) => libraryArticles.find((a) => a.slug === slug);
