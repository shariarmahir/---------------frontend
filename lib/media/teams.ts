/**
 * Team rules: seat limits, esports rosters, match records. Pure, tested in
 * teams.test.ts.
 */

export type GameId = "pubgm" | "freefire" | "mlbb" | "valorant" | "dota2" | "cs2";

/** Competitive squad sizes and in-game roles, as the games' own events run them. */
export const ESPORTS_GAMES: Record<GameId, { name: string; platform: "মোবাইল" | "পিসি"; starters: number; subs: number; roles: string[] }> = {
  pubgm: { name: "PUBG Mobile", platform: "মোবাইল", starters: 4, subs: 1, roles: ["IGL", "অ্যাসল্টার", "স্নাইপার", "সাপোর্ট"] },
  freefire: { name: "Free Fire", platform: "মোবাইল", starters: 4, subs: 2, roles: ["IGL", "রাশার", "স্নাইপার", "সাপোর্ট"] },
  mlbb: { name: "Mobile Legends", platform: "মোবাইল", starters: 5, subs: 1, roles: ["গোল্ড লেন", "এক্সপি লেন", "মিড", "জাঙ্গলার", "রোমার"] },
  valorant: { name: "Valorant", platform: "পিসি", starters: 5, subs: 1, roles: ["IGL", "ডুয়েলিস্ট", "ইনিশিয়েটর", "কন্ট্রোলার", "সেন্টিনেল"] },
  dota2: { name: "Dota 2", platform: "পিসি", starters: 5, subs: 1, roles: ["ক্যারি", "মিড", "অফলেন", "সফট সাপোর্ট", "হার্ড সাপোর্ট"] },
  cs2: { name: "Counter-Strike 2", platform: "পিসি", starters: 5, subs: 1, roles: ["IGL", "এন্ট্রি", "AWPer", "লার্কার", "সাপোর্ট"] },
};

export const rosterSize = (game: GameId) => ESPORTS_GAMES[game].starters + ESPORTS_GAMES[game].subs;

/** Seats still free; a team with no limit has room for everyone. */
export function seatsLeft(limit: number | undefined, members: number): number {
  return limit === undefined ? Infinity : Math.max(0, limit - members);
}

export const isFull = (limit: number | undefined, members: number) => seatsLeft(limit, members) === 0;

export function winRate({ w, d, l }: { w: number; d: number; l: number }): number {
  const played = w + d + l;
  return played === 0 ? 0 : Math.round((w / played) * 100);
}
