/**
 * Photo credits for the news cover images in public/news/.
 *
 * The photographs are licensed stock from Pexels (free for commercial use).
 * They illustrate the CATEGORY of a report — a bank counter, a paddy field —
 * and are not photographs of the events described. The cards say so, because
 * a news page that implies a stock photo documents a specific claim is doing
 * exactly what this project exists to criticise.
 *
 * Pexels licence: https://www.pexels.com/license/
 *
 * TODO(backend): when the aggregator returns an outlet thumbnail we are
 * licensed to show, that replaces the stock image for that item.
 */

export interface PhotoCredit {
  photographer: string;
  /** What the photograph actually shows. */
  subject: string;
  url: string;
}

export const photoCredits: Record<string, PhotoCredit> = {
  n01: {
    photographer: "Nataliya Vaitkevich",
    subject: "Audit documents under review",
    url: "https://www.pexels.com/photo/7821576/",
  },
  n02: {
    photographer: "Ron Lach",
    subject: "Industrial sewing floor",
    url: "https://www.pexels.com/photo/17710109/",
  },
  n03: {
    photographer: "Mikhail Nilov",
    subject: "Laboratory water sample testing",
    url: "https://www.pexels.com/photo/8539941/",
  },
  n04: {
    photographer: "Erik Mclean",
    subject: "Police patrol vehicles",
    url: "https://www.pexels.com/photo/12727666/",
  },
  n05: {
    photographer: "Adrien Olichon",
    subject: "Parliamentary building",
    url: "https://www.pexels.com/photo/18729241/",
  },
  n06: {
    photographer: "Mikhail Nilov",
    subject: "Community health session",
    url: "https://www.pexels.com/photo/8761535/",
  },
  n07: {
    photographer: "RDNE Stock project",
    subject: "Award trophies",
    url: "https://www.pexels.com/photo/6532380/",
  },
  n08: {
    photographer: "Mikhail Nilov",
    subject: "Financial records examination",
    url: "https://www.pexels.com/photo/7658352/",
  },
  n09: {
    photographer: "Nataliya Vaitkevich",
    subject: "Contract paperwork and calculator",
    url: "https://www.pexels.com/photo/7821688/",
  },
  n10: {
    photographer: "Ivan Samkov",
    subject: "Digital payment at a terminal",
    url: "https://www.pexels.com/photo/5239819/",
  },
  n11: {
    photographer: "RF._.studio",
    subject: "Workshop fabrication",
    url: "https://www.pexels.com/photo/3735711/",
  },
  n12: {
    photographer: "Nataliya Vaitkevich",
    subject: "Records and documentation",
    url: "https://www.pexels.com/photo/8970297/",
  },
  n13: {
    photographer: "Kindel Media",
    subject: "Water sampling",
    url: "https://www.pexels.com/photo/16960261/",
  },
  n14: {
    photographer: "RDNE Stock project",
    subject: "Trophy presentation",
    url: "https://www.pexels.com/photo/6250995/",
  },
  n15: {
    photographer: "Mikhail Nilov",
    subject: "Public consultation hall",
    url: "https://www.pexels.com/photo/8761318/",
  },
  n16: {
    photographer: "Kampus Production",
    subject: "Market produce trader",
    url: "https://www.pexels.com/photo/8475172/",
  },
  n17: {
    photographer: "Kampus Production",
    subject: "Small enterprise owner",
    url: "https://www.pexels.com/photo/8422729/",
  },
  n18: {
    photographer: "Yogendra Singh",
    subject: "Central bank building",
    url: "https://www.pexels.com/photo/13970482/",
  },
  n19: {
    photographer: "Nataliya Vaitkevich",
    subject: "Financial indicator sheets",
    url: "https://www.pexels.com/photo/7821540/",
  },
  n20: {
    photographer: "Quang Nguyen Vinh",
    subject: "Rice paddy cultivation",
    url: "https://www.pexels.com/photo/13888402/",
  },
  n21: {
    photographer: "Ivan Samkov",
    subject: "Mobile wallet transaction",
    url: "https://www.pexels.com/photo/6406691/",
  },
  n22: {
    photographer: "Zuzana Ruttkay",
    subject: "Women's skills workshop",
    url: "https://www.pexels.com/photo/38865323/",
  },
  n23: {
    photographer: "Kampus Production",
    subject: "Small business goods display",
    url: "https://www.pexels.com/photo/8475203/",
  },
  n24: {
    photographer: "Rafael Classen",
    subject: "Motherboard components",
    url: "https://www.pexels.com/photo/3520692/",
  },
  n25: {
    photographer: "Manuel Geissinger",
    subject: "Server racks",
    url: "https://www.pexels.com/photo/17489151/",
  },
  n26: {
    photographer: "Hilary Halliwell",
    subject: "Cylindrical battery cells",
    url: "https://www.pexels.com/photo/698485/",
  },
  n27: {
    photographer: "Mikhail Nilov",
    subject: "Engineers at a robotics bench",
    url: "https://www.pexels.com/photo/9242858/",
  },
  n28: {
    photographer: "Athena",
    subject: "Motherboard circuitry",
    url: "https://www.pexels.com/photo/1432794/",
  },
  n29: {
    photographer: "Kindel Media",
    subject: "Industrial robotic arm",
    url: "https://www.pexels.com/photo/34207359/",
  },
};
