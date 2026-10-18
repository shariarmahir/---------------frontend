/**
 * Who Kandari-Lab is and what it holds to: the values shown on the home
 * page's About section and on /about. They are the product principles in
 * PRODUCT.md, in the visitor's words.
 */

export interface Value {
  icon: string;
  title: string;
  body: string;
}

export const VALUES: Value[] = [
  { icon: "flag", title: "Built here, for here", body: "Problems solved by people who live with them, made in Bangladesh." },
  { icon: "diversity_3", title: "Open to all", body: "Priced and designed for every village, not only the cities." },
  { icon: "fact_check", title: "Proof before promises", body: "We show what works, and call research what it still is." },
  { icon: "grid_on", title: "One pixel at a time", body: "One sector fixed properly before the next. Healthcare first." },
];

/** The company in one paragraph. */
export const ABOUT_SUMMARY =
  "Kandari-Lab is a Bangladeshi deep-tech company. We see the country as a picture with broken pixels, one for every public service that fails its people, and we repair them one sector at a time with our own hardware, software and AI. Healthcare comes first: care within the golden two hours, in every village.";
