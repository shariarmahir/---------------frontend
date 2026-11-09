import Image from "next/image";
import { BANKS, MOBILE_MONEY, MONEY_NOTE, type MoneyBrand } from "@/data/motherland-money";
import { Icon } from "@/components/ui/icon";
import { Band } from "./blocks";

function BrandCard({ brand }: { brand: MoneyBrand }) {
  return (
    <li className="flex">
      <a href={brand.url} target="_blank" rel="noopener noreferrer" className="ml-card group flex w-full flex-col gap-4 rounded-[1.25rem] bg-white p-6 text-ml-navy shadow-[0_10px_30px_-18px_rgb(11_24_73/0.45)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
        <span className="flex h-16 items-center">
          {brand.logo ? (
            <Image src={brand.logo} alt="" width={200} height={64} unoptimized className="h-full w-auto max-w-full object-contain object-left" />
          ) : (
            <span className="font-ml-display text-4xl leading-none tracking-[0.01em]">{brand.name}</span>
          )}
        </span>
        <span className="flex flex-col gap-1.5">
          {brand.logo ? <span className="text-lg leading-snug font-bold">{brand.name}</span> : null}
          <span className="leading-relaxed text-pretty text-ml-navy/80">{brand.text}</span>
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 group-hover:underline">
          Official site
          <Icon name="open_in_new" className="text-base" />
          <span className="sr-only">(opens in a new tab)</span>
        </span>
      </a>
    </li>
  );
}

/** The wallets and banks a visitor will actually meet, each going to its own site. */
export function MoneyBrands() {
  return (
    <Band id="who-moves-the-money" tone="gold" title="Who moves the money" lede="The wallets and banks you will meet, each with its official site.">
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold">Mobile money</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {MOBILE_MONEY.map((b) => (
            <BrandCard key={b.name} brand={b} />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold">Banks</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {BANKS.map((b) => (
            <BrandCard key={b.name} brand={b} />
          ))}
        </ul>
      </div>
      <p className="text-sm leading-relaxed">{MONEY_NOTE}</p>
    </Band>
  );
}
