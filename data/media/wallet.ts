import type { WalletSeed } from "./types";

/**
 * The viewer's wallet. Every row carries its commission: sales show the 5%
 * seller fee taken, purchases show the 5% buyer service charge paid.
 */
export const walletSeed: WalletSeed = {
  available: 38450,
  escrow: 28350,
  lifetime: 214800,
  linked: { bkash: "01*** ***482", nagad: "01*** ***905", banglaqr: "QR · ****7310" },
  txns: [
    { id: "x1", at: "2026-09-25T05:45:00Z", kind: "escrow", label: "এসক্রোতে জমা — ওয়েব অ্যাপ, অনিক হাসান", gross: 27000, fee: 1350, feeSide: "buyer", net: -28350, status: "held", paidVia: "wallet", deal: "t-anik" },
    { id: "x2", at: "2026-09-24T16:30:00Z", kind: "sale", label: "আইওটি সেন্সর কিট বিক্রি", gross: 12000, fee: 600, feeSide: "seller", net: 11400, status: "done" },
    { id: "x3", at: "2026-09-23T11:00:00Z", kind: "release", label: "কাজের টাকা ছাড় — গ্রিনফিল্ড অ্যাগ্রো", gross: 15000, fee: 750, feeSide: "seller", net: 14250, status: "done" },
    { id: "x4", at: "2026-09-22T09:20:00Z", kind: "withdraw", label: "উত্তোলন — বিকাশ", gross: 10000, fee: 0, feeSide: "none", net: -10000, status: "done", method: "bkash" },
    { id: "x5", at: "2026-09-21T13:10:00Z", kind: "purchase", label: "রেসিপি নোট — কাচ্চি বিরিয়ানি", gross: 350, fee: 18, feeSide: "buyer", net: -368, status: "done" },
    { id: "x6", at: "2026-09-20T10:00:00Z", kind: "sale", label: "স্বাস্থ্য ড্যাশবোর্ড টেমপ্লেট", gross: 4500, fee: 225, feeSide: "seller", net: 4275, status: "done" },
    { id: "x7", at: "2026-09-18T15:00:00Z", kind: "refund", label: "ফেরত — বাতিল অর্ডার", gross: 900, fee: 45, feeSide: "buyer", net: 945, status: "done" },
    { id: "x8", at: "2026-09-17T12:00:00Z", kind: "withdraw", label: "উত্তোলন — বাংলা কিউআর", gross: 15000, fee: 0, feeSide: "none", net: -15000, status: "done", method: "banglaqr" },
  ],
};
