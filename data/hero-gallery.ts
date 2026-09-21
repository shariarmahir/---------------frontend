/**
 * The ten Bangladesh photographs behind the hero mosaic and the CTA strip.
 *
 * Alt text is descriptive rather than decorative: these are the citizens the
 * 64-district healthcare mission exists for, so a screen-reader user should
 * get the same sense of place a sighted visitor does.
 */
export interface HeroPhoto {
  src: string;
  alt: string;
  /**
   * object-position for the crop. Source files are 1.0–1.96 wide while the
   * hero band is wider still, so `cover` always trims the top and bottom;
   * this steers what survives. Default "50% 50%" would cut through heads in
   * the portrait-style frames.
   */
  focus?: string;
}

export const heroPhotos: HeroPhoto[] = [
  {
    src: "/hero/Hero-3.jpg",
    alt: "গোধূলিতে ধানক্ষেতের আলপথ ধরে মাথায় খড়ের আঁটি নিয়ে হেঁটে চলেছেন কৃষকেরা",
    // Figures walk across the upper-middle band; the lower third is bare
    // stubble, so bias upward.
    focus: "50% 38%",
  },
  {
    src: "/hero/Hero-1.jpg",
    alt: "নদীর তীরে বাঁধা রঙিন পালতোলা নৌকা",
    // Sail occupies the right half and reaches near the top edge.
    focus: "60% 42%",
  },
  {
    src: "/hero/Hero-10.jpg",
    alt: "ভোরের কুয়াশায় দুই প্রবীণ একে অপরকে পানি এগিয়ে দিচ্ছেন",
    // Both heads sit high in frame — the crop that was decapitating them.
    focus: "50% 28%",
  },
  {
    src: "/hero/Hero-8.jpg",
    alt: "সরিষা ক্ষেতের ভেতর দিয়ে স্কুলে যাচ্ছে চার কিশোরী",
    focus: "50% 40%",
  },
  {
    src: "/hero/Hero-5.jpg",
    alt: "সুন্দরবনের ম্যানগ্রোভ জলাভূমিতে একা নৌকা বাইছেন এক মাঝি",
    // Square source, so this one loses the most height; the boat sits just
    // below centre.
    focus: "50% 55%",
  },
  {
    src: "/hero/Hero-7.jpg",
    alt: "হলুদ আলোয় ধান মাড়াইয়ের যন্ত্রে কাজ করছেন কৃষকেরা",
    focus: "50% 45%",
  },
  {
    src: "/hero/Hero-2.jpg",
    alt: "অস্তগামী সূর্যের সামনে গরুর গাড়ি ও দৌড়ে চলা কিশোরদের অবয়ব",
    // Silhouettes sit along the lower horizon line.
    focus: "50% 58%",
  },
  {
    src: "/hero/Hero-4.jpg",
    alt: "পাহাড় ও হ্রদের মাঝে জলের উপর দাঁড়িয়ে থাকা একটি কাঠের ঘর",
    focus: "55% 50%",
  },
  {
    src: "/hero/Hero-6.jpg",
    alt: "সুন্দরবনের খাল ধরে যাত্রীবোঝাই নৌকা চলেছে",
    focus: "50% 48%",
  },
  {
    src: "/hero/Hero-9.jpg",
    alt: "ক্ষেতে লাঙল হাতে কৃষক ও পাশে দাঁড়ানো এক কিশোর",
    // Standing farmer's head is near the top; bias up to keep it.
    focus: "50% 35%",
  },
];

