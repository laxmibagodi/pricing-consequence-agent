# Test Proposals — Pricing Consequence Agent

Record numbers refer to the position in `data/pricing_decisions.json` (1 = first record, oldest date).

| # | Date | Segment | Change |
|---|------|---------|--------|
| 1 | 2024-11-12 | SMB | 20% annual-prepay discount |
| 2 | 2025-02-10 | SMB | Starter event cap 100k to 50k (hard cutoff) |
| 3 | 2025-03-14 | mid-market | 25% annual contract discount |
| 4 | 2025-05-20 | mid-market | 15% Analytics + Automation bundle (worked) |
| 5 | 2025-07-08 | SMB | Free trial 14 to 30 days |
| 6 | 2025-09-16 | mid-market | 24-month contract, price lock |
| 7 | 2025-10-21 | mid-market | Bundle relaunch (no lift, pricing-page redesign confounder) |
| 8 | 2025-11-03 | SMB | 30% first-year new-logo promo |
| 9 | 2026-01-27 | enterprise | 3-year agreements, 5% uplift cap, no discount |
| 10 | 2026-03-24 | SMB | Overage pricing replaces hard cap |
| 11 | 2026-04-07 | enterprise | Floor price +12%, discount approval tightened |
| 12 | 2026-06-16 | mid-market | Free 30-day guided pilot |

**Planted structures**
- **Pattern:** records 1, 3, 8. Discounts that lifted acquisition but hurt expansion revenue and net revenue retention.
- **Contradiction:** records 4 vs 7. Same bundle; worked once, no effect the second time, redesign confounder.
- **Gaps:** enterprise has never had an annual discount (only 9 and 11, neither is a discount). Usage-limit changes have only been tried on SMB (2, 10).

**Verdict labels the agent actually returns:** `supported`, `mixed`, `no_precedent`. Confidence is a number from 0 to 1.

## Status after the first full run (2026-09-28)

| Test | Result |
|---|---|
| T1, T2, T3a, T3b, T3c | Pass |
| **T3** | **Known bug** (false "no precedent" when extra business context is added) |
| T4, T5 | Pass |
| T6, T7 | Pass |
| T8, T9, E2 | Partial (returns the "new experiment" text instead of a clarifying or out-of-scope message) |
| T10 | Pass |
| E1, E3 | Pass (clean error messages) |

> **Open issue:** the verdict `supported` on T1/T2 reads as "go ahead" even though the precedent is negative. Waiting on Prapthi for a better label (for example `caution`).

---

## A. Clear pattern match (confident, specific answer)

### T1 — Mid-market annual discount
- **Proposal:** "Give mid-market customers a 30% discount on annual contracts."
- **Expected behavior:** Confidently cites the 25% mid-market discount (record 3): acquisition +18%, expansion -12%, NRR -6 pts. States that 30% has not been tested. Recommends caution or a small pilot.
- **Supporting records:** 3 (primary), 1, 8
- **Observed:** verdict `supported`, confidence 0.92. Correct numbers and honest about the gap.

### T2 — SMB promo
- **Proposal:** "Run a 35% first-year promo for new SMB customers next quarter."
- **Expected behavior:** Cites the 30% SMB Q4 promo (record 8): +31% new-logo revenue, -15% expansion, -8 pts NRR at first renewal. States that 35% has not been tested.
- **Supporting records:** 8 (primary), 1, 3
- **Observed:** verdict `supported`, confidence 0.93. Correct.

### T3 — Segment-agnostic discount with business context (KNOWN BUG)
- **Proposal:** "Offer a 20% discount to all new customers to hit our quarterly bookings target."
- **Expected behavior:** Uses Reflect to state the cross-segment trend: every discount experiment boosted acquisition and hurt expansion or retention (SMB and mid-market). Mentions that enterprise has not been tested.
- **Supporting records:** 1, 3, 8
- **Observed (BUG):** verdict `no_precedent`, confidence 0.0, no evidence. This is a **false "no precedent"**: three matching discount records exist. The same request without the phrase "to hit our quarterly bookings target" works (see T3c).
- **Status:** reported to Prapthi and Laxmi. **Do not use in the live demo** until fixed. Use T3c or T3a instead.

### T3a — SMB discount (extra pattern test)
- **Proposal:** "Offer a 20% discount to all new SMB customers."
- **Expected behavior:** Cites the 20% SMB annual discount (record 1): +22% new-logo revenue, -9% expansion revenue per account, NRR 94% to 91%. Notes that the proposal is broader than what was tested.
- **Supporting records:** 1, 8
- **Observed:** verdict `supported`, confidence 0.93. Pass.

### T3b — Mid-market discount (extra pattern test)
- **Proposal:** "Offer a 20% discount to all new mid-market customers."
- **Expected behavior:** Cites the 25% mid-market annual discount (record 3): +18%, -12% expansion, -6 pts NRR. States that 20% has not been tested.
- **Supporting records:** 3
- **Observed:** verdict `supported`, confidence 0.92. Pass.

### T3c — Segment-agnostic discount, no extra context (working version of T3)
- **Proposal:** "Offer a 20% discount to all new customers."
- **Expected behavior:** Cites the SMB and mid-market discounts and the shared pattern (acquisition up, expansion down).
- **Supporting records:** 1, 3, 8
- **Observed:** verdict `supported`, confidence 0.71. Pass. This proves the missing segment is not the problem.

---

## B. No related history (must say it has no precedent)

### T4 — Enterprise usage limits
- **Proposal:** "Introduce a monthly API-call limit for enterprise customers."
- **Expected behavior:** Says there is no record of a usage-limit change with enterprise. Does not invent a pattern. Recommends treating it as a new experiment.
- **Supporting records:** none direct; 2 and 10 (SMB only) as context at most
- **Observed:** verdict `no_precedent`, confidence 0.0. Pass.

### T5 — Partner channel pricing
- **Proposal:** "Create a reseller partner tier with a 20% commission-based price."
- **Expected behavior:** Plainly states there is no record of channel or reseller pricing. Does not stretch discount records to fit.
- **Supporting records:** none
- **Observed:** verdict `no_precedent`, confidence 0.0. Pass.

---

## C. Contradictory past outcomes (must surface the conflict)

### T6 — Bundle discount
- **Proposal:** "Offer mid-market customers a 15% discount when they bundle Analytics and Automation."
- **Expected behavior:** Reports mixed results: +5 pts retention in May 2025 (record 4) versus no measurable lift on the Oct 2025 relaunch (record 7). Notes the redesign confounder.
- **Supporting records:** 4, 7
- **Observed:** verdict `mixed`, confidence 0.56, one contradiction surfaced. Pass. Best demo example.

### T7 — Bundle for retention
- **Proposal:** "Bundle Automation with Analytics at a discount to improve mid-market retention."
- **Expected behavior:** Same contradiction as T6, framed around retention. Must not average the two results into a vague "modest improvement."
- **Supporting records:** 4, 7
- **Observed:** verdict `mixed`, confidence 0.56, contradiction surfaced. The pricing-page redesign appears in the patterns but **not in the response text** (T6 mentions it in the response). Pass, with a note for Prapthi.

---

## D. Vague, ambiguous or off-topic (handle gracefully)

### T8 — Extremely vague
- **Proposal:** "Should we change our pricing?"
- **Expected behavior:** Asks a clarifying question (which change, which segment, what goal) or summarizes what has been tested so far. Should **not** say "this would be a new experiment."
- **Supporting records:** none required
- **Observed:** returns the standard `no_precedent` text. **Partial.** Suggested fix: add a `needs_more_info` path.

### T9 — Vague goal, no mechanism
- **Proposal:** "Make our pricing friendlier for customers."
- **Expected behavior:** Recognizes that no specific change was proposed and asks a clarifying question, optionally listing tested options with their track records.
- **Supporting records:** none required
- **Observed:** returns the standard `no_precedent` text. **Partial.**

---

## E. Mixed tested and untested segments

### T10 — Enterprise plus mid-market annual discount
- **Proposal:** "Give enterprise and mid-market customers a 25% discount for annual contracts."
- **Expected behavior:** Splits its answer. Mid-market: cites record 3 and the pattern. Enterprise: says an annual discount has never been tested (records 9 and 11 are a price lock and a price increase, not a discount).
- **Supporting records:** 3 (mid-market), 1 and 8 (pattern); 9 and 11 as "enterprise tested, but not with a discount"
- **Observed:** verdict `mixed`, confidence 0.56. States that enterprise has not been tested under a 25% annual discount. Pass, but **fragile**: the only enterprise record (record 11) came back with a relevance score of 0.5004, just above the 0.5 gate.

---

## Edge cases

### E1 — Empty proposal
- **Input:** empty string
- **Expected behavior:** Clean error message, not a crash.
- **Observed:** `ProposalError` with a helpful message ("Describe the pricing change..."). Pass.

### E2 — Off-topic question
- **Input:** "What's the weather like today?"
- **Expected behavior:** An **out-of-scope message** saying the agent only advises on pricing decisions. Should not say "this would be a new experiment."
- **Observed:** returns the standard `no_precedent` text. **Partial.**

### E3 — Very long input
- **Input:** a proposal over 2,000 characters
- **Expected behavior:** A clean error message. The limit is **2,000 characters**.
- **Observed:** `ProposalError` ("Proposal is too long (max 2000 characters)"). Pass.

### E4 — Empty memory bank (manual check)
- **Expected behavior:** Says it has no history yet. Use this for the "before" half of the before/after demo.