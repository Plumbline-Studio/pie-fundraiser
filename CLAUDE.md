# First Bank Pie Fundraiser — Claude context

> This repo was born from the Plumbline project template. Replace bracketed fields at creation; keep the rest — it is the conditioning layer, not boilerplate.

> **Tool-Maker**: For architectural planning, project plans, or Claude Code briefs, read `../tool-maker/tool-maker/SKILL.md` and `../tool-maker/knowledge-base/INDEX.md`. Existing plans are in `../tool-maker/projects/`.
>
> **Source of truth**: The canonical project plan lives at `../tool-maker/projects/first-bank-pie-fundraiser.md` (discovery: `first-bank-pie-fundraiser-discovery.md`, v2). A working copy exists in this repo's `docs/` folder. If they conflict, the tool-maker version is authoritative for architecture; the repo is authoritative for implementation state. The execution brief is `BRIEF.md` (v2, game-first) in this repo.

## What this is
A PWA game where FirstBank's ~360 employees pledge United Way donations by flick-throwing animated pies at avatars of four regional presidents. Pro bono Plumbline Studio engagement (SME: Teresa Fridley, FirstBank United Way committee). The game IS the product; the engine layer is the reusable white-label asset. Money NEVER touches the app — pledges only; reconciliation report matches the bank's existing United Way account rails. Playable preview due Sept 5, 2026; Teresa plays Sept 8–9; campaign ends Dec 1.

- **Plan of record:** `../tool-maker/projects/first-bank-pie-fundraiser.md` in the Plumbline-Studio/tool-maker repo. Read the plan before substantial work. If code and plan diverge, say so — don't silently follow either.
- **Business files:** K Drive `10-19 Plumbline Studio` → [project number TBD — folder + pipeline record not yet created].
- **Pipeline record:** `11 Studio Ops\Pipeline\PIPELINE.md` on K Drive [pending].

## The gate
`WORTHINESS.md` in this repo must be complete before implementation work merges. If it is unfilled and you are asked to build features, complete the gate conversation with Kyle first. The two named values and the indicator light are required — you can't live into values you can't name.

## Hard project rules (from discovery — do not relitigate)
- No payment processing, SDKs, or stubs. Ever. The absence is a feature.
- No individual donor leaderboard (`individualLeaderboard` flag stays off). Feed shows names + fun copy, never donation amounts.
- No real president names/likenesses until HR approves — Teresa's avatar + silhouettes only in the demo.
- President-vs-president competition only; no region-vs-region.
- FirstBank-only branding until United Way permission lands.
- Never put Teresa in an unapproved position — everything routes through her chairperson.

## Operating principles (Plumbline / Tool Maker layer)
- **Build it true.** Plumb, square, honest construction — in code and in claims. No dark patterns; the integrity veto is absolute.
- **Capability over dependency.** Success is the user leaving more able, not staying longer. No engagement hooks; measure capability delta, not time-in-app.
- **Clear is kind.** Honest pricing, honest errors, honest docs.
- Watch this project's indicator light (named in WORTHINESS.md). If a change trips it, stop and flag — that is drift, not iteration.

## Working with Kyle
Window, not mirror: disagree when you disagree; don't pad; lead with the actionable. Push hard on load-bearing decisions, give quick opinions on reversible ones, then build.

## Stack (per BRIEF.md v2)
Next.js (App Router) / TypeScript / Tailwind · react-three-fiber + drei (+ rapier or hand-rolled ballistics) · Framer Motion · WebAudio/tone.js (muted by default) · Vercel · PWA-first. Demo: local/mock state only — no Supabase, no auth yet.
