# Pie Fundraiser — Build Brief v2 (Game-First)

**For:** Claude Code session in this repo
**North star:** The game IS the product. This demo is a Plumbline flagship — a portfolio specimen, product seed, and referral story — not a concept-seller. Spend disproportionate effort on anything the player can **see, feel, or tell a story about**. Keep the game small; make the small thing ridiculously good.
**Design criterion for every decision:** *"Does this make you want to throw another pie?"*
**Deadline:** playable preview by Fri Sept 5; Teresa plays it Sept 8/9.
**Canonical discovery:** `tool-maker/projects/first-bank-pie-fundraiser-discovery.md` (v2).

## Architecture: three layers, cleanly separated
This separation IS the white-label strategy — we make the expensive/fun part reusable, not admin screens.

1. **Engine** (`/engine`): character loading & lifecycle, target selection, throw mechanics (flick gesture → trajectory → physics), collision zones (face / body / miss), splatter & decal system, reaction/animation system, scoring, event stream, state sync interface. Zero campaign knowledge.
2. **Campaign** (`/campaign` + `config/event.ts`): FirstBank branding, United Way cause, targets array, regions, pledge rules & pricing, copy, dates, feature flags. Swappable per client/charity.
3. **Character** (`/characters/<slug>`): model/asset set, animation states, reactions, personality (taunts, wipes, laughs), name, affiliation. Pluggable — a character folder drops in and works.

## Stack
Next.js (App Router) + TypeScript + Tailwind. **three.js via react-three-fiber + drei** for the game scene; @react-three/rapier (or hand-rolled ballistics — pick simpler) for throw physics; Framer Motion for UI chrome; **tone.js or plain WebAudio for sound design (splats, whooshes, crowd "ooh" — sound is in scope, muted-by-default toggle).** Vercel deploy = shareable link. PWA manifest. Local/mock state only — no Supabase yet.

## The game (mobile-first, ~380px, 60fps target)
- Open on the arena: the target character is **alive** — idle breathing, blinking, posture shifts, subtle reaction to touch/pointer proximity.
- Player has pies (from mock pledge). **Flick to throw.** Trajectory matters a little:
  - **Face hit** → big splatter, exaggerated reaction, cream coverage that persists as decals, character wipes some away, annoyed/laughing recovery.
  - **Body hit** → splat, smaller reaction.
  - **Miss** → pie sails past; character gives a smug taunt.
- Splat accumulation tiers persist per target: clean → light → heavy → buried.
- Live world: seeded fake event stream ("Jennifer in Roanoke just nailed the Region A president") + player's own throws; president pie counts and campaign $ total react. **The feed supports the game; the game stays the hero.** (Feed shows names + fun copy — never ranked donor amounts. President-vs-president totals only; no region-vs-region standings.)

## The A/B experiment (the point of the demo)
One character — Teresa — built **both ways, inside the same scene**: same framing, same pie, same throw, same reaction beats.
- **A — Stylized:** 3D cartoon character (or high-craft 2.5D rig if 3D modeling burns time — squash-and-stretch reads better than geometry). Source: Gio caricature renders.
- **B — Realistic:** attempt a 3D likeness; **fallback (pre-approved): 2.5D billboard** of the Gio realistic renders with physically-lit splat decals and reaction-state swaps. Uncanny valley is a fail state — if realistic-3D fights us, ship the fallback without hesitation.
Style toggle in-scene. Teresa answers one question after playing both: *"Which one makes you want to throw another pie?"*
Plus 3 silhouette placeholder targets (Region A/B/C) to show multi-target layout. **No real president names or likenesses in the demo.**

## Supporting screens (minimal, engine is the star)
- **Pledge modal:** name, region dropdown (incl. "Support teams"), pie count with $ equivalence ($5/pie demo pricing), positive vs **negative pie** toggle ("Steal their pies" — playful copy). Confirm → pies in inventory.
- **Reconciliation preview:** static mocked committee report table. One page, answers the tracking question, no export.
- ℹ️ footer links to `docs/one-pager.md` + `docs/qa-sheet.md` content.

## Feature flags
`negativePies` (on) · `showDonorNamesInFeed` (on) · `individualLeaderboard` (**off — hard requirement, do not build**)

## Spend the hours on
Character quality · animation · tactile throwing · splatter physics/decals · reactions & personality · sound design · transitions · making Teresa laugh on first play.

## Do NOT spend hours on
Enterprise architecture · admin tooling · premature abstraction · elaborate CI/CD · auth · persistence · realtime sync · scaling beyond ~400 users · payment anything (**forever** — money never touches this app).

## Milestones (sequence the risk)
1. **Engine feel** — flick/trajectory/collision/splat with a placeholder target. If the throw isn't fun here, nothing else matters.
2. **Stylized Teresa** — full reaction set, personality beats. (Guaranteed path.)
3. **Realistic Teresa** — 3D attempt, timeboxed; fall back to 2.5D billboard variant on first sign of uncanny.
4. **Polish pass** — sound, transitions, decal persistence, feed choreography, install flow.

## Acceptance
- Throw feels great on a phone; 60fps-ish; loads fast; installable
- Both character variants playable via toggle in the same scene
- Miss = smug taunt lands as a joke; face hit = involuntary grin
- Negative pie flow demonstrable in <10s; feed/totals react live
- Zero real names beyond Teresa's opt-in demo character
- Kyle drops Gio asset sets in `public/characters/teresa/{stylized,realistic}/`
