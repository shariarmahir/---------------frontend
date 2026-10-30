import { HAZARDS, REGULATORS } from "@/lib/command/recalls";
import type { Hazard, RegulatorId } from "@/lib/command/types";
import { Bn, Panel } from "./kit";

/**
 * "How to tell": plain checks a shopper or an inspector can make for each
 * hazard on the Remove from sale list, and who acts on what. General public
 * guidance only: no figures, no tests that need a lab, nothing invented.
 */

const SIGNS: Record<Hazard, string> = {
  formalin: "Fish or fruit that stays stiff and fresh-looking for a long time without ice is a warning sign. Buy fish kept on ice, and wash fruit well.",
  "carbide-ripening": "Fruit evenly coloured outside but hard or sour inside, or sold ripe well before its season, may be ripened with carbide. Wash and peel it.",
  "textile-dye": "Spice powder with an unnaturally bright colour, or that stains water or fingers strongly, may be dyed. Buy sealed packs with a BSTI mark and a batch number.",
  "expired-relabelled": "Read the manufacturing and expiry dates. A sticker over the printed date, or two different dates on one pack, is a warning sign.",
  "counterfeit-medicine": "Medicine sold in Bangladesh carries a DGDA registration number on the pack. Buy from a licensed pharmacy, check the batch and expiry, and keep the receipt.",
  "mercury-cream": "Skin creams that promise fast whitening, list no ingredients, or name no maker or importer are a warning sign. Cosmetics are regulated by DGDA.",
  "fake-bsti-mark": "A BSTI mark is printed with its licence number. A mark with no number, or a smudged or copied-looking one, is a warning sign: ask BSTI.",
  "adulterated-honey-ghee": "Honey or ghee sold as pure at a price far below the market is a warning sign. Buy sealed, labelled packs with a batch number.",
  "reused-oil": "Dark, thick, foaming oil with a burnt smell has been used too often. Avoid snacks fried in it, and ask how often the oil is changed.",
  "unsafe-baby-food": "Check the seal, the expiry date and the Bangla label on infant formula. Never buy it loose, or in a dented or opened tin.",
};

const ROLES: Record<RegulatorId, string> = {
  bsti: "Standards marks and certified products",
  dgda: "Medicine and cosmetics",
  bfsa: "Food safety: adulteration and unsafe food",
  dncrp: "Consumer rights: false dates, deception and overpricing",
};

export function RecallGuide() {
  return (
    <Panel id="recall-guide" title="How to tell" icon="fact_check" field="ink" sub="Signs anyone can check. When in doubt, don't buy it, and report the shop." className="self-start">
      <ul className="flex flex-col divide-y divide-white/8">
        {(Object.keys(SIGNS) as Hazard[]).map((h) => (
          <li key={h} className="flex flex-col gap-1 py-3 first:pt-0">
            <p className="text-sm font-semibold text-white">
              <Bn>{HAZARDS[h].labelBn}</Bn> <span className="font-normal text-white/65">· {HAZARDS[h].label}</span>
            </p>
            <p className="text-sm leading-relaxed text-white/80">{SIGNS[h]}</p>
          </li>
        ))}
      </ul>
      <h3 className="mt-2 border-t border-white/10 pt-4 font-grotesk text-sm font-bold text-signal-orange">Who acts</h3>
      <dl className="mt-2 flex flex-col gap-2">
        {(Object.keys(ROLES) as RegulatorId[]).map((id) => (
          <div key={id} className="flex flex-col">
            <dt className="text-sm font-semibold text-white">{id === "dncrp" ? <Bn>{REGULATORS[id].nameBn}</Bn> : `${REGULATORS[id].short}, ${REGULATORS[id].name}`}</dt>
            <dd className="text-xs leading-snug text-white/65">{ROLES[id]}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
