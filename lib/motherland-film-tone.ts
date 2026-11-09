/** Which colour reads on the film behind the hero's letters: navy where the film is bright; elsewhere gold or white, in turn. */
export type Tone = "navy" | "gold" | "white";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

/**
 * The film's light above which navy reads, at about 5:1. Below it navy sinks into the
 * picture: Mahir marked it vanishing over a forest whose light was about 0.15, where the
 * two colours tie on paper but leaves and shadow break navy's letters up.
 */
const NAVY_FROM = 0.25;

/** How long a new colour takes to melt across a word, and how long a word keeps a colour before it may change again. */
const SWEEP_SECONDS = 2.8;
const HOLD_SECONDS = 1;
/** On a dark film a word turns slowly from gold to white and back, after this long. */
const DRIFT_SECONDS = 8;

const linear = (channel: number) => {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

/** The share of RGBA pixels on which navy reads. */
export function navyShare(rgba: ArrayLike<number>) {
  let navy = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    if ((0.2126 * linear(rgba[i]) + 0.7152 * linear(rgba[i + 1]) + 0.0722 * linear(rgba[i + 2])) >= NAVY_FROM) navy++;
  }
  return rgba.length ? navy / (rgba.length / 4) : 0;
}

/** Whether navy reads now: a gap between the two thresholds keeps a word from flickering while the film hovers near one. */
export const navyReads = (current: Tone, share: number) => share > (current === "navy" ? 0.45 : 0.55);

/** Navy or gold for a word in one colour at a time, as the plain letters are when the melt can't run. */
export const nextTone = (current: Tone, share: number): Tone => (navyReads(current, share) ? "navy" : "gold");

/** Where a box on screen falls on a small copy of a film drawn with object-fit: cover. */
export function filmRegion(word: Box, film: Box, source: Size, copy: Size): Box {
  const scale = Math.max(film.width / source.width, film.height / source.height);
  const shownLeft = film.left + (film.width - source.width * scale) / 2;
  const shownTop = film.top + (film.height - source.height * scale) / 2;
  const toCopy = copy.width / (source.width * scale);
  const left = Math.min(copy.width - 1, Math.max(0, Math.floor((word.left - shownLeft) * toCopy)));
  const top = Math.min(copy.height - 1, Math.max(0, Math.floor((word.top - shownTop) * toCopy)));
  return {
    left,
    top,
    width: Math.max(1, Math.min(copy.width - left, Math.ceil(word.width * toCopy))),
    height: Math.max(1, Math.min(copy.height - top, Math.ceil(word.height * toCopy))),
  };
}

/** One word's colour, and how far the last change has wiped across it. */
export interface WordTone {
  tone: Tone;
  from: Tone;
  /** 0 as a change starts, 1 once the new colour has reached the word's far end. */
  sweep: number;
  held: number;
}

/** `held` may start below zero, so two words on a dark film don't turn at the same moment. */
export const wordTone = (tone: Tone, held = 0): WordTone => ({ tone, from: tone, sweep: 1, held });

/** Half the drift, for the second word. */
export const OFFSET_SECONDS = -DRIFT_SECONDS / 2;

/**
 * Moves a word on by some seconds and, when the film has just been read, starts a change:
 * to navy when navy reads, away from it when it doesn't, and on a dark film from gold to
 * white or back once the word has held its colour long enough.
 */
export function stepWord(word: WordTone, seconds: number, share?: number) {
  word.sweep = Math.min(1, word.sweep + seconds / SWEEP_SECONDS);
  word.held += seconds;
  if (share === undefined || word.sweep < 1 || word.held < HOLD_SECONDS) return;
  const dark = word.tone === "white" ? "white" : "gold";
  const turned = word.held >= DRIFT_SECONDS ? (dark === "gold" ? "white" : "gold") : dark;
  const next: Tone = navyReads(word.tone, share) ? "navy" : word.tone === "navy" ? "gold" : turned;
  if (next === word.tone) return;
  word.from = word.tone;
  word.tone = next;
  word.sweep = 0;
  word.held = 0;
}
