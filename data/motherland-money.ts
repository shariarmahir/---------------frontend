/**
 * The names a visitor will meet when paying in Bangladesh. Logos are the owners'
 * trademarks, shown only to identify each service. A brand with no `logo` shows
 * its name instead: to add one, put the owner's file in public/motherland/logos.
 */
export interface MoneyBrand {
  name: string;
  text: string;
  url: string;
  logo?: string;
  /** Pale logos sit on navy so they can be seen. */
  dark?: boolean;
}

export const MOBILE_MONEY: MoneyBrand[] = [
  { name: "bKash", text: "The best-known mobile wallet, part of the BRAC Bank group.", url: "https://www.bkash.com/" },
  { name: "Nagad", text: "A mobile wallet run under the Bangladesh Post Office.", url: "https://nagad.com.bd/" },
  { name: "Rocket", text: "Dutch-Bangla Bank's mobile banking service.", url: "https://www.dutchbanglabank.com/rocket/rocket.html", logo: "/motherland/logos/rocket.png" },
  { name: "Upay", text: "United Commercial Bank's mobile wallet.", url: "https://www.upaybd.com/", logo: "/motherland/logos/upay.svg" },
];

export const BANKS: MoneyBrand[] = [
  { name: "Bangladesh Bank", text: "The central bank. It issues the taka and sets the rules for every bank.", url: "https://www.bb.org.bd/", logo: "/motherland/logos/bangladesh-bank.svg" },
  { name: "Sonali Bank", text: "The largest state-owned commercial bank, with branches across the country.", url: "https://www.sonalibank.com.bd/", logo: "/motherland/logos/sonali.svg" },
  { name: "Dutch-Bangla Bank", text: "A private bank with one of the widest ATM networks.", url: "https://www.dutchbanglabank.com/", logo: "/motherland/logos/dutch-bangla.svg" },
  { name: "BRAC Bank", text: "A private bank known for lending to small businesses.", url: "https://www.bracbank.com/", logo: "/motherland/logos/brac.svg" },
  { name: "Islami Bank Bangladesh", text: "The largest of the country's Islamic banks.", url: "https://www.islamibankbd.com/", logo: "/motherland/logos/islami.png" },
  { name: "Eastern Bank", text: "A private commercial bank for people and companies.", url: "https://www.ebl.com.bd/", logo: "/motherland/logos/ebl.svg" },
];

export const MONEY_NOTE = "Logos belong to their owners and only identify each service. MOTHERLAND is independent of all of them. Check fees and rules on the official site.";
