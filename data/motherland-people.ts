/**
 * More of the people who make Bangladesh proud — poets, artists, scientists,
 * singers and reformers beyond the few with portraits on the page. No
 * politicians: only those remembered for art, thought, science or service.
 * Each entry is a plainly-documented fact; living people are described only
 * by what the public record already holds.
 */

export interface Voice {
  name: string;
  field: string;
  years?: string;
  note: string;
}

export const MORE_VOICES: Voice[] = [
  { name: "Zainul Abedin", field: "Painter", years: "1914–1976", note: "The 'Shilpacharya', master of art. His stark Famine Sketches of 1943 became the conscience of a people, and he founded the country's first art institute." },
  { name: "S. M. Sultan", field: "Painter", years: "1923–1994", note: "Painted the Bengali peasant as a figure of heroic strength, a visionary who lived among the people and animals he loved." },
  { name: "Novera Ahmed", field: "Sculptor", years: "1939–2015", note: "The pioneer of modern sculpture in Bangladesh, a woman who broke new ground in the 1950s and shaped the Shaheed Minar's early vision." },
  { name: "Fazlur Rahman Khan", field: "Structural engineer", years: "1929–1982", note: "Born in Dhaka, he invented the tube structures that made the modern skyscraper possible, including Chicago's Sears Tower." },
  { name: "Maqsudul Alam", field: "Scientist", years: "1954–2014", note: "Led the teams that sequenced the genome of jute and the papaya, giving Bangladesh a place at the frontier of genetics." },
  { name: "Humayun Ahmed", field: "Writer & filmmaker", years: "1948–2012", note: "The most beloved storyteller of modern Bangladesh, whose novels, plays and films held the nation's heart for a generation." },
  { name: "Runa Laila", field: "Singer", years: "b. 1952", note: "A voice known across South Asia, who has sung in many languages and carried Bangladeshi music to the world for over fifty years." },
  { name: "Ayub Bachchu", field: "Rock musician", years: "1962–2018", note: "Guitarist and voice of the band LRB, the man who put Bangla rock on the map and whose songs a whole generation still sings." },
  { name: "Firoza Begum", field: "Nazrul Sangeet", years: "1930–2014", note: "The foremost voice of Nazrul's songs, who gave them to the nation across a career of more than half a century." },
];

export interface WomanLeader {
  name: string;
  field: string;
  note: string;
}

/** Women whose work opened doors — in schooling, art, science, sport and the sky. */
export const WOMEN_POWER: WomanLeader[] = [
  { name: "Begum Rokeya", field: "Writer & reformer", note: "Fought for girls' schooling when few would, and imagined a world run by women in 'Sultana's Dream' (1905). Her birthday is kept as Rokeya Day." },
  { name: "Novera Ahmed", field: "Sculptor", note: "Broke open modern sculpture in a field that gave women no place, and did it in the 1950s." },
  { name: "Runa Laila & Firoza Begum", field: "Music", note: "Two voices that carried Bengali song, classical and modern, to audiences across the subcontinent and beyond." },
  { name: "Women of the garment floor", field: "The economy", note: "Millions of women turned the country into the world's second-largest clothing exporter, and in doing so changed their own standing at home." },
  { name: "Nishat Majumder & Wasfia Nazreen", field: "Mountaineering", note: "In 2012 Nishat Majumder became the first Bangladeshi woman to summit Everest; Wasfia Nazreen went on to climb the highest peak on every continent." },
];
