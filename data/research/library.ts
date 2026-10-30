import { withTracking, type Article } from "../../lib/research/core.ts";
import { sampleArticles } from "./articles.ts";
import { crowFalconProposal } from "./crow-falcon.ts";
import { farmGatePaper } from "./farm-gate.ts";

/** Everything in Genius that ships with the site: real papers first, then the labelled samples, each with its tracking number. */
export const libraryArticles: Article[] = withTracking([crowFalconProposal, farmGatePaper, ...sampleArticles]);

export const findArticle = (slug: string) => libraryArticles.find((a) => a.slug === slug);
