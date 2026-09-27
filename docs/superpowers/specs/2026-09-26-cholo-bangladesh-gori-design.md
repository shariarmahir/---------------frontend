# চলো বাংলাদেশ গড়ি — V3 architecture and vertical slice

Status: vertical slice implemented 2026-09-26 (supersedes the V2 quiz-only design in this file's history).
Source brief: `Prompt.md` (V3 planning document + master build prompt), the second pasted build prompt, four reference images (Dune developments tree, Galactic Civilizations planet improvements, LOOPY causal loops, XCOM command centre).

## 1. Decisions (ADR)

| # | Decision | Why |
|---|---|---|
| 1 | Where the two prompts conflict, `Prompt.md` wins. No "hyper-addictive" loops, no one-click +100 XP solves, no real-time cascade timers, no fabricated "breaking news". Kept from the second prompt: 64×64 pixel map, 32-node dependency network, scenario modifiers, cascade (threshold) events, AI controller, bulletin — the bulletin is labelled simulated. | `Prompt.md` §5, §12, §16, §17 forbid the conflicting mechanics explicitly. |
| 2 | Frontend-only in this repo. No FastAPI/Fastify, Postgres, Redis or WebSockets built; their contracts are specified here and marked TODO. | CLAUDE.md §3/§9: backend choice is an open [FLAG]. |
| 3 | One fully modelled scenario (BD-001, healthcare access in a fictional union); the other 31 modules get detail pages and the evidence-check mini-game. The engine is data-driven so a scenario is a data file. | `Prompt.md` "First deliverable: vertical slice". |
| 4 | Pure, seeded, versioned engine (`lib/gori/sim`). A run = (scenario, ruleset, config, plan); the browser stores only that and replays. Common random numbers: one RNG stream per intervention (its true effect) and one per turn (events). | Reproducibility §9.4; fair strategy comparison. |
| 5 | Server replays every finished run (`/api/gori/runs`) and returns the authoritative score + run key; XP credited once per challenge at best score. | "Server-side score validation", "XP cannot be duplicated". |
| 6 | AI = seven agents on one route with a shared 8-part structured answer; lexical retrieval over a local evidence store built only from the dossier; server drops any cited id that retrieval did not supply; deterministic offline agent when no key / on error. Model `claude-opus-5`, effort low, `fallbacks: "default"`. | §16; no fabricated sources. |
| 7 | Libraries added: `@xyflow/react` (causal map), `zustand` (state + persist), `recharts` (comparison/lab charts). Kept framer-motion (already installed; "Motion for React" successor). Not added: TanStack Query (no server state beyond two POSTs), MapLibre (the canvas pixel map from real division outlines serves the map role; no tile provider). | §14, CLAUDE.md §6 bundle discipline. |
| 8 | Progression gates features but a visible "teacher/advanced mode" opens all. Streaks removed. | §10, §11, accessibility. |
| 9 | (2026-09-26, user request "not just yes/no… multiplayer, 3D, brilliant mind game") The headline mode is **জাতীয় মিশন**, a co-operative crisis strategy game on the 32-module network. Multiplayer = local pass-and-play for 2–4 seats with AI bot teammates in empty seats (user's choice); online rooms wait for the backend decision. 3D board (React Three Fiber, code-split, capable devices only) with an equivalent accessible 2D SVG board. | User chose "Local + AI rivals" and "Co-op crisis strategy"; CLAUDE.md §6 performance rule. |

## 2. Folder structure

```
app/cholo-bangladesh-gori/            layout (header + game nav), landing/command centre
  play/ lab/ evidence/ compare/ forge/ community/ progress/ profile/ module/[code]/
app/api/gori/ai/route.ts              seven agents
app/api/gori/runs/route.ts            authoritative replay + score
app/api/gori/mission/route.ts         mission replay + score (config + actions)
components/gori/                      store, provider, shell/nav, i18n, ai-panel, landing
  national/ play/ module/ lab/ evidence/ compare/ forge/ progress/ profile/
data/gori/                            modules (BD-001…032, links, cross-cutting), puzzles (evidence checks),
                                      evidence store, pixel-mask (generated), scenarios/health-access.ts
lib/gori/                             rng, retrieval, quiz, progression, pixel-map, layout
  sim/                                types (zod), engine, score, report, verify, lab
  ai/                                 agents (schemas, context, prompts, offline answers)
  mission/                            engine (pure, seeded), bot (heuristic teammates + hints), layout, narrate, schema
components/gori/mission/              setup, board-3d (R3F), board-2d (SVG), hud, node-panel, dialogs, overlays, store
data/gori/mission.ts                  pillars, roles, policy cards, difficulty (balanced against the bots)
```

## 3. Data model (target Postgres schema — TODO backend)

Local equivalents exist today; these are the tables the backend should own.

```sql
problems(id text pk /* BD-001 */, n int, title_bn, title_en, theme, evidence_status, urgency, simulation text, created_at, updated_at)
module_links(from_id fk, to_id fk, sign int, confidence text, basis text /* dossier|assumption */, note text)
evidence_sources(id text pk, title, publisher, url null, publication_date null, retrieval_date, source_type, status, reliability_notes, extracted_claims jsonb, modules text[], reviewed_by null, version)
scenarios(id text pk, problem_id fk, title, context_defs jsonb, variables jsonb, edges jsonb, interventions jsonb, events jsonb, stakeholders jsonb, assumptions jsonb, ruleset_version, status)
simulation_runs(run_key text pk, user_id fk, scenario_id fk, config jsonb, plan jsonb, seed, engine_version, ruleset_version, total int, strategy, outputs_hash, receipt, created_at)
player_progress(user_id pk, xp int, level int, quiz_best jsonb, sim_best jsonb /* challenge -> {score, run_key} */, lab jsonb, puzzle_found text[], achievements jsonb, updated_at)
lab_records(id pk, user_id, hypothesis jsonb, seed, trials, engine_version, ruleset_version, result jsonb, conclusion, created_at)
forge_scenarios(id pk, user_id, name, description, config jsonb, moderation jsonb, status /* draft|review|published */, created_at)
audit_log(id pk, ts, actor_hash, agent, mode, cited int, dropped int, verdict null)
```

## 4. API contracts (implemented)

`POST /api/gori/ai` — body is one of (zod `agentRequestSchema`):
- `{agent:"research", module, question?}` · `{agent:"systems", config, plan, turn, variable}` · `{agent:"coach", config, plan, turn}`
- `{agent:"evidence", claim, module?}` · `{agent:"news", newsId}` · `{agent:"reviewer", target:{kind:"turn",config,plan,turn}|{kind:"quiz",n,answers[4],idea?,question?}}` · `{agent:"moderation", text}`

Response: `{agent, mode:"claude"|"offline", analysis:{summary, verdict, evidenceUsed[{id,how}], assumptions[], effects[], limitations[], alternatives[], questions[]}, sources[{id,title,publisher,status,sourceType,reliabilityNotes}], dropped[]}` — moderation: `{agent, mode, moderation:{verdict:"allow"|"review"|"block", reasons[]}}`. 400 on invalid input. Rate limit 12/min per IP-hash, then offline.

`POST /api/gori/runs` — `{config, plan, strategy}` → `{runKey, total, finalIndex, startIndex, complete, engine, ruleset, strategy, receipt|null}`. `receipt` = HMAC-SHA256 when `GORI_SIGNING_SECRET` is set.

TODO backend: auth (phone-OTP per CLAUDE.md §7), `/progress`, `/runs` list, `/evidence` CRUD with reviewer sign-off, `/forge` publish queue, WebSocket rooms for community missions, moderation console.

## 5. Simulation rules (ruleset 1.0.0, engine 1.0.0)

- target(v) = base(v) + Σ intervention levels on v + Σ edges sign·w·a·(from(t−delay) − base(from)); v ← v + α(target − v) + shocks + responses. α per quarter, rescaled for yearly turns (α′ = 1−(1−α)^k).
- Intervention level = amount × draw(seeded, range widened/narrowed by evidence setting) × scale (pilot 35%) × √funding × efficiency × ramp × assumption multiplier. Efficiency = workforce coverage × (0.6 + 0.4·actor support/100) × maintenance × rollout penalty × context multiplier.
- Pilot: 40% cost, 35% effect, 50% workforce; scale-up costs 65% of full and carries no rollout risk. Direct full launch: 20/30/40% chance (evidence high/mid/low) of 2 turns at 70% efficiency.
- Budget: start + income per turn (difficulty-scaled); upkeep paid from budget; shortfall wears maintenance (loss 0.5 × share unpaid × pressure). Wear 0.04·pressure/funding, recovery 0.06·funding when fully paid.
- Events: random (seasonal for monsoon/summer, context multipliers, intensity, difficulty), threshold (two turns past a limit — stock-out, locked clinic, volunteer dividend), scheduled (crisis mode flood in turn 2). Mitigation from running interventions, capped 90%. Some events offer a one-off response next turn.
- Stakeholders drift with the variables they care about and react to launches; "simple" mode fixes support at 60.
- Every change decomposes exactly into named contributions (tested).

## 5a. জাতীয় মিশন (mission engine 1.0.0)

- **Board:** the 32 modules, grouped into four pillars of eight (People & society, Economy & work, State & data, Nature & capacity — a game grouping of the dossier themes). Movement follows the dependency links in either direction; crises follow them in their causal direction only.
- **Turn:** 4 actions — drive (to a linked module), direct (discard the destination's card), charter (discard the current module's card, go anywhere), shuttle (hub to hub), treat (−1 pressure; all if the pillar is reformed or you are the organiser), build a coordination hub (discard the module's card; max 6), share (give/take the current module's card with a teammate there), reform (at a hub, 3 cards of one pillar; researcher 2). Then draw 2 player cards and the crisis phase draws `rate` crisis cards (+1 pressure each).
- **Cascade:** a module past 3 pressure collapses once per chain, costs one public-trust, and pushes +1 into every module it feeds. Loops (5→32→5, 25↔31) chain. Root causes (modules nothing feeds) never receive a cascade.
- **Escalation (মহাসংকট):** the bottom crisis card takes +3, then the crisis discard is reshuffled onto the top of the deck — so the modules already hit are the likeliest next. Rate track 2,2,2,3,3,4,4.
- **Roles:** organiser, researcher, coordinator, engineer, community guardian (no new pressure on and next to them), data analyst (peek at the top 3 crisis cards and bury one). **Policy cards** (free): emergency fund, satellite forecast, volunteers, quiet quarter, resilient population, rapid deployment.
- **Win:** all four reforms. **Lose:** public trust exhausted (8/6/5 collapses by difficulty) or the player deck runs out.
- **Balance:** measured by bots over seeded games — two bots win about ¾ of intro, ½–¾ standard, ⅓ heroic games. Numbers are game rules, not statistics.
- **Replay and XP:** a mission is (config, actions); the store keeps only that. Undo is allowed inside a turn until a card draw or a peek. The server replays finished games; XP = best score × 3 per difficulty (`mission:<difficulty>:all`), credited once per run key; a win grants the "দলগত জয়" achievement. Score = 15 per reform + 4 per restored pillar + 2 per trust left + 6 for a win + up to 8 for unused time.
- **AI teammates:** a transparent two-action lookahead over a value function (pressure² × how far a collapse would reach, reform progress, hub distance, positioning). The same function gives humans a "পরামর্শ" with its reason, labelled as the bot's opinion.
- **Accessibility:** the 2D board is keyboard-operable (every module a button with a full label); a module select mirrors it; pillar identity is shape + colour (palette validated for CVD on the dark board); crisis reveals and outcomes are announced in a polite live region; reduced motion removes flights, pulses and sparkles. On phones the 2D board scrolls sideways so targets are finger-sized.

## 6. Scoring

Total = weighted mean of 8 categories − penalties (cap 25). Categories: evidence, systems thinking, equity, sustainability, risk, adaptability, stakeholder support (collaboration proxy in solo play), resource efficiency — formulas shown on the results screen. Strategy profile doubles one category's weight. Penalties: unpaid upkeep −3/turn, stop within 2 turns −3, blocked launch attempt −2, ignored crisis response −2. XP = best score × 3 per challenge (scenario×mode×context) + quiz XP + 40 per new lab question + 100 for the map puzzle. Levels: Observer 0, Problem Mapper 150, Community Planner 450, Systems Builder 900, Evidence Strategist 1600, Regional Coordinator 2500, Civilization Architect 3600.

## 7. AI and evidence policy

- Evidence store: 72 records compiled from `data/amar-bangladesh.ts`; no URL or publication date is invented (the dossier has none); unsupported claims are records of type `unsupported`, used only as warnings.
- Context is rebuilt server-side (simulation replayed from config+plan); player text is fenced in `<player_text>` and its closing tag stripped; the model can only cite ids it was given; unknown ids are dropped and counted.
- Output: 8-part schema via structured outputs; summaries capped; the UI labels "Claude · লাইভ" vs offline.
- Moderation: offline hard-block on phone/NID/email and calls to violence always overrides a model "allow".
- Audit: one JSON line per call (agent, mode, cited, dropped, hashed IP), no player text. TODO: persistent audit log and human review queue.

## 8. Known limitations

- One full scenario; 31 modules are quiz + evidence only. Game coefficients are not calibrated or validated against real data.
- Progress lives in the browser: server replay prevents a wrong score from the engine, but not someone editing their own storage (needs accounts).
- Community missions, peer review, publishing forge scenarios, moderation console and admin evidence editing are not implemented (screens say so).
- English interface covers menus only; scenario content is Bangla.
- Retrieval is lexical; news index is the site's sample data.
- Site-wide header ticker and footer have pre-existing orange-on-white contrast failures (Lighthouse); not changed here.
- Mission multiplayer is local only (one device). Online rooms need the backend: the engine is transport-agnostic, so a room only has to relay the actions list.
- Mission bots are heuristic, not optimal; their hints can be wrong and say so.

## 9. Next milestone

Backend phase (after the CLAUDE.md §9 backend decision): accounts + server progress, run storage and receipts, evidence service with reviewer sign-off, then a second full scenario (BD-018 water, linked to BD-001 through the water programme) to prove cross-scenario dependency propagation.
