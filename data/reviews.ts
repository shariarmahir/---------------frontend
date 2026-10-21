/**
 * Partner and client reviews for the home page.
 *
 * SAMPLES: Kandari-Lab has no published client reviews yet, so these
 * entries only show the layout. Each carries `sample: true` (no longer
 * shown on the card, at Mahir's request, 2026-10-18). The portraits
 * (public/reviews/review-1…5.png, supplied by Mahir on 2026-10-21; review 3
 * is the woman's) stand in for the same reason. Replace every one with real
 * words and the real person's photo, quoted with their permission, before
 * the site goes public; an invented review must not ship as a real one.
 */

export type ReviewField = "navy" | "cobalt" | "ink";

export interface Review {
  id: string;
  name: string;
  role: string;
  /** The organisation, or the kind of partner while it is a sample (not shown on the card). */
  org: string;
  /** The reviewer's portrait under public/ (a cut-out on its own coloured disc, transparent around it); a silhouette stands in without one. */
  photo?: string;
  quote: string;
  field: ReviewField;
  sample?: boolean;
}

export const reviews: Review[] = [
  {
    id: "health-complex",
    name: "Dr. Farhan Islam",
    role: "Medical Officer",
    org: "Upazila Health Complex",
    quote:
      "The golden two hours framing changed how our team talks about triage. A Bangla voice flow is the first tool our older patients have tried on their own.",
    field: "navy",
    photo: "/reviews/review-1.png",
    sample: true,
  },
  {
    id: "pharmacy",
    name: "Rafiq Uddin",
    role: "Pharmacy Owner",
    org: "Village pharmacy partner",
    quote:
      "They sat in my shop for a week before writing a line of code. The stock alerts are built around how we actually work, not how an office thinks we do.",
    field: "cobalt",
    photo: "/reviews/review-2.png",
    sample: true,
  },
  {
    id: "university",
    name: "Nusrat Jahan",
    role: "Lecturer, EEE",
    org: "University partner lab",
    quote:
      "Our students send firmware through the Innovation Drive and get feedback on real hardware, not just a grade. That changes how seriously they build.",
    field: "ink",
    photo: "/reviews/review-3.png",
    sample: true,
  },
  {
    id: "ngo",
    name: "Tanvir Hasan",
    role: "Operations Lead",
    org: "Health programme partner",
    quote:
      "Clear about what is ready and what is still research. That honesty is the reason we kept working with them after the first pilot.",
    field: "navy",
    photo: "/reviews/review-4.png",
    sample: true,
  },
  {
    id: "community-clinic",
    name: "Imran Hossain",
    role: "Community Health Worker",
    org: "Community clinic partner",
    quote:
      "They asked what slows us down on a home visit, then built around the answer. The tools fit in my bag and work where the signal does not.",
    field: "cobalt",
    photo: "/reviews/review-5.png",
    sample: true,
  },
];
