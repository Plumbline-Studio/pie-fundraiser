# Worthiness Scorecard — First Bank Pie Fundraiser

> The "should I build this?" gate. Score each dimension −2 to +3. Complete BEFORE implementation.
> Green-light: total ≥ +18 AND no dimension at −2. · +6 to +17 or any −1: build with rumble — written mitigation required below. · Below +6 or any −2: don't build / redesign.
> **Integrity veto:** if the numbers only work through a dark pattern or dishonesty, the answer is no regardless of total.

**Assessed:** 2026-08-29 · **Assessor:** Kyle Knight (drafted by Claude, countersigned by Kyle via Cowork) · **Status:** ☑ GATED: green

## The Market It Serves
| Dimension | Score (−2…+3) | Evidence / reasoning |
|---|---|---|
| Worthy-cause fit | +3 | The product's entire purpose is raising money for United Way; success metric is dollars to charity, not usage. |
| Belonging vs. fitting in | +2 | Shared play across the whole footprint; rally-your-own default without forcing region identity (lenders/analysts belong via "support teams"). |
| Worthiness vs. shame economics | +3 | No individual donor leaderboard is a hard requirement, decided in discovery (Teresa: no one shamed over donation size). The $5 donor gets the same fun as the $50 donor. Load-bearing design choice. |
| Nonjudgment | +2 | Feed shows names + playful copy, never amounts; honor-system culture respected rather than policed. |

## The Outcomes It Produces
| Dimension | Score | Evidence / reasoning |
|---|---|---|
| Connection vs. isolation | +2 | Shared realtime feed, president banter, workplace-wide play — a common event, not solo scrolling. |
| Capability vs. dependency | +1 | Seasonal campaign tool with a hard end date; leaves the committee a reconciliation capability it lacked. No retention hooks by design. |
| Near-enemy check | +1 | Fun-as-engagement could drift toward engagement-for-its-own-sake; bounded by Dec 1 end date and counter-metrics below. Watch item. |
| Meaning generation | +2 | Giving becomes a story people retell ("I pied the president"); the finale stunt, if approved, compounds it. |
| Flourishing balance (PERMA) | +2 | Positive emotion + engagement + relationships, time-boxed; accomplishment via checkpoints; meaning via the cause. |

## The Societal Value
| Dimension | Score | Evidence / reasoning |
|---|---|---|
| Built with integrity | +3 | Money never touches the app; no likeness without consent; no dark patterns; Teresa never put in an unapproved position. |
| Clear is kind | +2 | Pledge framing on-screen ("records pledges only, no payment info ever"); honest reconciliation report instead of vague tracking. |
| Infinite-game durability | +2 | Annual reuse at FirstBank; engine/campaign/character separation makes the white-label the durable asset. |
| Ethical-fading resistance | +2 | Integrity constraints are encoded (individualLeaderboard hard-off flag, no-payment rule in CLAUDE.md), not just remembered. |

**TOTAL:** +27 / 39 — no dimension below +1 → **GREEN-LIGHT**

## Stage 3 — REQUIRED before build
- **Named value 1 this build must honor:** Generosity made joyful — the app exists to raise more for United Way, not to show off tech.
- **Named value 2 this build must honor:** Trust kept — no money handling, no shame mechanics, no likeness without consent.
- **Indicator light (the signal that we're drifting):** any feature that ranks or exposes individual donors, or requires payment data. If it appears in a design or a diff, stop and flag.

## Rumble notes / written mitigation
Not required (no −1s, total above +18). Standing watch item: the near-enemy signature (usage up + meaning down) — covered by counter-metrics.

## Counter-metrics to pair with usage metrics once live
- Dollars pledged per active player (meaning proxy) vs. throws per player (engagement proxy) — throws climbing while pledges flatten = near-enemy signature.
- Shame-language scan of feed copy and any support traffic.
- Reconciliation variance (pledged vs. deposited) — trust health of the honor system.
- Post-campaign: did the committee's workload go down vs. paper tickets (capability delta)?
