> Working copy — canonical plan lives at `../tool-maker/projects/first-bank-pie-fundraiser.md`. Refresh this copy when the plan updates; architectural authority stays in tool-maker.

# First Bank Pie Fundraiser — Project Plan

**Status**: Build stage. Repo exists with game-first BRIEF.md v2, one-pager, and Q&A sheet in `docs/`. **Worthiness gate unfilled — must be scored with Kyle before implementation merges.**
**Hard dates**: playable preview **Fri Sept 5** → Teresa plays it **Sept 8–9** → campaign ends **Dec 1, 2026**.
**Engagement**: Pro bono for FirstBank's internal United Way campaign; upside = lender referrals, public credit, white-label reuse.
**Canonical discovery**: `first-bank-pie-fundraiser-discovery.md` (v2, from 8/28 Teresa Fridley call). Execution brief: repo `BRIEF.md` (v2, game-first).
**Blueprint**: Supabase `fd942ca0-6c38-4173-8cc2-a10ca41fced0` — 7 terminal conditions, freeze 2026-09-30, PARK-default finding policy.

---

## 1. Vision

A home-screen PWA where FirstBank's ~360 employees pledge United Way donations by throwing animated pies at avatars of four regional presidents. **The game IS the product** — virality comes from the thrower's enjoyment of the consequence, not from standings. Money never touches the app (pledges only; teller-line rails stay). Built pro bono as Plumbline's first independent-era flagship, architected so the expensive/fun part (the engine) is the reusable white-label asset.

## 2. Architecture Overview

### Enterprise layer (why)
- Success = more raised than paper-ticket precedent, less teller-line load, zero reconciliation disputes — and a referenceable Plumbline flagship.
- Stakeholders: Teresa Fridley (operator; job-safety caution is a hard constraint — never put her in an unapproved position), chairperson (gatekeeper), HR ×2, bank president (sponsor), 4 regional presidents (talent), employees (donors), United Way committee (money custody).
- Every artifact must be *forwardable* up the approval chain without Kyle in the room.

### Systems layer — three layers, cleanly separated (this IS the white-label strategy)
1. **Engine** — character lifecycle, throw mechanics (flick → trajectory → physics), collision zones, splatter/decal persistence, reactions, scoring, event stream, state sync interface. Zero campaign knowledge. *The reusable asset.*
2. **Campaign** — FirstBank branding, United Way cause, targets, regions, pledge rules/pricing, copy, dates, feature flags. Swappable per client/charity.
3. **Character** — pluggable asset folders (model, animation states, personality/taunts). Teresa first; presidents after likeness approval.

Supporting systems: pledge ledger (append-only; standings + reconciliation source) · reconciliation exporter (daily, per-branch grouping) · activity feed (realtime confirmed feasible; names + fun copy, never donor amounts) · minimal admin (Phase 2).

Convergent-surface check: employees get ONE surface (the arena; standings embedded). Admin is the only second surface. Presidents need nothing extra.

### Platform layer
Next.js (App Router) + TypeScript + Tailwind · react-three-fiber/drei + physics for the game scene · WebAudio sound (muted-by-default) · Vercel deploy · PWA install. Demo: local/mock state only. Production: Supabase (ledger + realtime). No auth for demo; lightweight identity (name + region) in production. **No payment code, ever.**

## 3. Data Architecture (production, Phase 2)

`campaign` (bank, charity, dates, checkpoints — white-label seam) · `target` (president, avatar set, active) · `participant` (display name, region) · `pledge` (participant → target, pie_count ±, unit price server-side, reconciled_at) · `checkpoint` (standings snapshot). Append-only; corrections are offsetting entries. Data → pledges; Information → standings/feed/daily totals; Knowledge → pledge-vs-deposit variance, year-over-year stats.

## 4. Implementation Phases

**Phase 0 — Inputs & gate** ✓ mostly done
- ✓ Discovery v2, one-pager, Q&A sheet, repo, BRIEF v2
- [ ] **WORTHINESS.md scored with Kyle** (blocks implementation merges)
- [ ] Repo hygiene: `plumbline.json` birth certificate, CLAUDE.md brackets
- [ ] From Teresa: presidents email, ~3 self-photos, style guide · Gio avatar renders (stylized + realistic) into `public/characters/teresa/`

**Phase 1 — Playable demo (by Sept 5)** — per repo BRIEF.md milestones:
1. Engine feel (flick/collision/splat with placeholder — if the throw isn't fun, nothing else matters)
2. Stylized Teresa (full reaction set)
3. Realistic Teresa (timeboxed 3D; pre-approved fallback: 2.5D billboard)
4. Polish (sound, decals, feed choreography, install flow)
- A/B in one scene: "Which one makes you want to throw another pie?" · pledge modal with negative-pie toggle · mocked reconciliation preview · flags: `individualLeaderboard` hard-off.

**Phase 2 — Production readiness (after approvals)**
Real president avatars (post-HR) · pledge ledger + admin + reconciliation export · pricing locked (~$5/pie ref) · anonymity rules per HR · launch comms kit.

**Phase 3 — Campaign ops (through Dec 1)**
Checkpoints (mid-Oct, Nov) · monitoring · finale-stunt support if approved · post-campaign stats package.

**Phase 4 — White-label harvest (post-Dec 1, separate effort)**
Extract campaign config · Plumbline demo instance for pitching · FirstBank case study (pending social approval).

## 5. The Pitch (for the referral upside)

Workplace fundraising is paper tickets and boring pledge drives. A zero-payment-risk engagement layer — pledges only, funds on existing rails — deployable in any org with a charity campaign. Banks especially: this design sidesteps the payment-compliance minefield entirely. FirstBank = the referenceable install (~360 users, statewide footprint, lender referrals to commercial customers). COGS ≈ one Vercel/Supabase instance per campaign.

## 6. Risks & Open Questions

1. **Approval chain stalls** — mitigated by forwardable demo + Q&A. Negative pies killed? Feature-flag off, not rework.
2. **Device policy** — personal phones planned; bank phones likely filtered; one president carries only a bank phone. Teresa checking. Fallback: desktop.
3. **Likeness refusal** — per-target avatar config; cartoon substitute or drop-out.
4. **Uncanny valley** — declared fail state; 2.5D billboard fallback pre-approved.
5. **Scope telescope** — PARK by default; beyond Phases 0–3 is next year's paid campaign or internal white-label work.

Open (carry to Sept 8/9): avatar style verdict · negative-pie survival · UW branding permission · phone/web-filter answer · finale decision · pricing tiers · pledge report replaces or runs beside paper tickets.

## 7. Worthiness Gate — draft inputs (score WITH Kyle before merges)

- **Named value 1 (proposed)**: *Generosity made joyful* — exists to raise more for United Way, not to show off tech.
- **Named value 2 (proposed)**: *Trust kept* — no money handling, no shame mechanics (no donor leaderboard), no likeness without consent.
- **Indicator light (proposed)**: the moment any feature ranks or exposes individual donors, or requires payment data — stop, that's drift.
- Green-light expectation: strong worthy-cause fit, zero payment risk, hard deadline, bounded scope. Watch item: approval-chain schedule risk isn't Kyle's to control; pro bono makes PARK discipline non-negotiable.
