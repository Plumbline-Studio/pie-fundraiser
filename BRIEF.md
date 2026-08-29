# Pie Fundraiser — Demo Build Brief

**For:** Claude Code session in this repo
**Goal:** A shareable, mobile-first demo Teresa can send to her chairperson as a temp link. Pretty, not fully functional. Must sell the *feeling* — donate → get pies → throw → splat → everyone sees it.
**Deadline:** working preview by Fri Sept 5; review with Teresa Sept 8/9.
**Canonical discovery:** `tool-maker/projects/first-bank-pie-fundraiser-discovery.md` (v2). Read it before building.

## Stack
Next.js (App Router) + TypeScript + Tailwind. Deploy to Vercel (preview URL = the shareable link). PWA manifest + add-to-home-screen so it installs like an app. **Demo uses local/mock state only — no Supabase yet.** Realtime comes in the production phase.

## White-label from day one
All event-specific values live in one config file (`config/event.ts`): org name, brand colors, charity name/logo slot, pledge unit name ("pie"), unit price tiers, targets array (name, region, avatar asset set), feature flags. Nothing FirstBank-specific hardcoded anywhere else. This repo is the seed of the reusable fundraiser engine.

## Feature flags (demo must include)
- `negativePies` (on for demo)
- `showDonorNamesInFeed` (on)
- `individualLeaderboard` (**off — hard requirement, do not build**)

## Demo targets
Demo shows ONE target with two style variants: "Teresa — Caricature" and "Teresa — Realistic" (side-by-side or toggle), plus 3 placeholder silhouette presidents labeled Region A/B/C to show the multi-target layout. Do NOT use real president names in the demo (likeness unapproved). Avatar assets: Kyle drops Gio-generated images into `public/avatars/` (caricature + realistic sets; splat-state variants to follow — build the state machine to accept 4 tiers: clean → light splat → heavy splat → buried).

## Screens / flows (mobile-first, ~380px)
1. **Arena (home):** target cards with avatar, pie count, rank position; running campaign total ($ pledged) as a big celebratory number; live activity feed (seeded fake entries + user's own actions appended, e.g. "Helen R. threw 3 pies at Region A's president"); FirstBank-adjacent branding (red/white, tasteful "1" motif accents — generic until style guide arrives).
2. **Pledge flow:** tap target → modal: your name, region (dropdown incl. "Non-regional / Support teams"), pie count with $ equivalence (demo pricing: $5/pie; tiers configurable), positive vs negative pie toggle (negative = removes pies from that target; copy stays playful: "Steal their pies"). Confirm → pledge recorded (mock) → pies added to inventory.
3. **Throw interaction — the money moment:** drag/flick gesture hurls a pie at the avatar; splat animation + juicy sound-optional feedback; avatar advances splat tier; count/rank/feed/total update instantly. This interaction gets the most polish budget. Framer Motion or hand-rolled spring physics; must feel great on a phone.
4. **Reconciliation preview (static mock):** a simple table page (name, region, pledges, $, date) labeled "Committee Report — sample." Exists to answer the chairperson's tracking question visually. No real export needed.

## Explicitly OUT of demo scope
Auth, persistence, realtime sync, admin panel, notifications, real president avatars, payment anything (forever — money never touches this app).

## Acceptance
- Loads fast on a phone; installable; works as plain URL too
- Throw feels satisfying enough that a bank chairperson smiles
- Negative pie flow demonstrable in <10 seconds
- Feed + total + ranks visibly react to user actions
- Zero real names beyond Teresa's opt-in demo avatar
- One-pager and Q&A sheet (in `docs/`) linked from a small ℹ️ footer
