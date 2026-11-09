# প্রতিবাদ Command v2: prevention, safety and consumer protection

Date: 2026-10-28. Extends `2026-10-25-protibad-command-dashboard-design.md` (all its rules still hold: fully open, browser simulation, every person/business/case fictional, Demo data badge, English UI with Bangla data, pitch black + navy/ink/cobalt panels, gold titles and buttons, red only for urgency, no orange, nothing under 12px, no caps/eyebrows, reduced motion respected, self-contained in `app/protibad/command`, `components/command`, `data/command`, `lib/command`).

## Goal

Turn the live board into a model for reducing crime, not only answering it: detect early (hotspots, rising trends, SOS), respond fast (nearest unit first, division by division), protect the most exposed (women, children), and stop harm from markets (price gouging, fake and dangerous products). Mahir's ask: "a roadmap model to reduce and finish crime and other issues in Bangladesh … track crimes in real time and detect early to reduce damage."

## Human factors this design answers (Bangladesh)

These are design reasons, not statistics; the page states them as such and invents no national figures.

| Behaviour | What the dashboard does |
|---|---|
| Fear of retaliation and of the police stops people reporting | Anonymous reports are allowed and shown as such; the complainant's identity is never on the board |
| Shame and stigma keep women silent | Survivor details hidden on every view (area only, no name, no exact point); cases routed to the station's women help desk; One-Stop Crisis Centre and 109 shown beside every women case |
| Low trust: "nothing happens after I complain" | Every case shows a visible clock and status trail; median response time is public |
| Bystander effect in crowds and transport | Hotspot early warnings name the place and hour so patrols are there before it happens |
| Extortion and harassment normalised as "how things are" | Repeat patterns across shops/areas are linked into one network view, so a ring is seen as a ring |
| Certainty of being caught deters more than severity of punishment | Prevention roadmap measures response certainty (share of cases answered within the window), not arrests |

Safety rule added: no religion, ethnicity, political party, caste or appearance is ever recorded or shown for anyone involved. "Who is involved" is limited to the kind of actor (organised ring, gang, repeat individual, unknown) with fictional group codes.

## Features

1. **Division scope.** A picker with All Bangladesh plus the 8 divisions (ঢাকা, চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট, বরিশাল, রংপুর, ময়মনসিংহ), kept in the URL as `?div=`. It filters Overview, Police, Stations, Emergency, Women safety and Intelligence, and frames the map on that division. Stations carry their division.
2. **New police categories:** যৌন হয়রানি/ইভটিজিং (sexual harassment), নারী নির্যাতন/পারিবারিক সহিংসতা (domestic violence), অপহরণ (kidnapping), মাদক (drugs), জরুরি SOS (an SOS press: critical, nearest unit, shortest window). Cases may carry `victim` (woman, child, elderly, general), `anonymous`, `involved` (kind + fictional group code + people count).
3. **Emergency desk** `/protibad/command/emergency`: live SOS queue with a countdown, the three nearest units for each with ETA, one-press dispatch, verified national helplines (999, 109) from `data/complaints.ts`.
4. **Women safety** `/protibad/command/women`: women and child cases only, privacy-first; hotspot map of harassment; time-of-day pattern (evening and transport hours); per-station women help desk load; survivor support panel (999, 109, One-Stop Crisis Centre at medical college hospitals); "safe-route" style advice is not invented — only the areas to patrol.
5. **Intelligence** `/protibad/command/intel`: current situation per division (Calm / Watch / Alert / Critical, red only for Critical); early warnings (an area with 3+ police cases in the last 60 minutes, or twice its usual rate for that hour from the seeded 30-day history); hotspot heat on the map; hour × category pattern; networks ("who is involved": fictional rings linked across cases and stations); recommended actions generated from the data (where and when to patrol).
6. **Prevention roadmap** `/protibad/command/roadmap`: the model Report → Route → Respond → Resolve → Review → Prevent, each stage with its live measure from the demo world; the human-factors table above; a phased roadmap (0–6 months, 6–18, 18–36) marked as a proposal.
7. **Price watch** `/protibad/command/consumer/prices`: daily price list of essentials (rice, lentils, soybean oil, sugar, onion, potato, egg, chicken, beef, fish, fruits, flour, salt, milk). Rows are either **Government fixed** (verified, source and date shown) or **Reference (sample)**. Verified as of 2026-10-28: bottled soybean oil Tk 204/L (Ministry of Commerce, September 2026) and loose soybean oil Tk 180/L (April 2026, unchanged in September). Today's observed market price comes from simulated market reports (deterministic per day); rows over the ceiling are flagged and link to overpricing cases. A note links to the TCB daily Dhaka retail price list (tcb.gov.bd) as the official source.
8. **Remove from sale** `/protibad/command/consumer/recalls`: fake and dangerous products to pull from shelves now. Fictional brand names only (a real brand on this list would be defamation); real hazard types (formalin, carbide ripening, textile dye in spices, expired stock relabelled, counterfeit medicine, mercury in skin cream, fake BSTI mark, adulterated honey/ghee, reused frying oil) and the real regulator for each (BSTI, DGDA, Bangladesh Food Safety Authority, ভোক্তা অধিদপ্তর). Danger level, districts found, units seized, status (Recall ordered → Seizing → Seized → Destroyed) with actions kept in the world.
9. **Motion:** a live event ticker on the Overview, SOS pulse ring, threat-level gauge transitions, number changes eased. All off under reduced motion.

## Architecture

- `lib/command`: types extended; `divisions` helpers; `history.ts` (seeded 30-day aggregate counts by area × hour × category, no cases); `intel.ts` (hotspots, early warnings, division threat, networks, recommendations: pure, tested); `prices.ts` (catalogue + deterministic daily observations + ceiling checks: pure, tested); `recalls.ts` actions. Storage key bumps so old saved worlds reseed.
- `data/command`: `divisions.ts` (names, centres, bounds), `prices.ts`, `recalls.ts`, templates for new categories; stations carry a division.
- `components/command`: map gains `bounds` framing and a heat layer; `division-picker.tsx`; new page components per route; shell nav grows: Emergency and Women safety under Police, Intelligence and Roadmap, Prices and Remove from sale under ভোক্তা অধিদপ্তর.

## Build order

1. Engine and data (lib + data + tests). 2. Map and division kit (map-canvas, map-view, division-picker). Then in parallel: 3. Division scope on Overview, Police, Stations. 4. Emergency + Women safety (+ case drawer privacy and involvement). 5. Intelligence + Roadmap. 6. Price watch + Remove from sale + shell nav. Then review, browser QA at 390/1024/1440/1920, tsc, eslint, tests.
