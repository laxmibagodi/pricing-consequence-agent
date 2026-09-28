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

> **Verdict and confidence:** the "expected verdict / confidence" values below are suggestions. Confirm the exact labels with Prapthi and Neha, then update this file.

---

## A. Clear pattern match (confident, specific answer)

### T1 — Mid-market annual discount
- **Proposal:** "Give mid-market customers a 30% discount on annual contracts."
- **Expected behavior:** Confidently cites the 25% mid-market discount (record 3): acquisition +18%, expansion -12%, NRR -6 pts. Reflects the wider pattern with 1 and 8. Recommends caution or a small pilot.
- **Supporting records:** 3 (primary), 1, 8
- **Suggested verdict / confidence:** Caution / High

### T2 — SMB promo
- **Proposal:** "Run a 35% first-year promo for new SMB customers next quarter."
- **Expected behavior:** Cites the 30% SMB Q4 promo (record 8): +31% new-logo revenue but -8 pts NRR at first renewal. Notes the 20% SMB annual discount (record 1) had the same shape. States that a deeper discount is likely to repeat or worsen the expansion drop.
- **Supporting records:** 8 (primary), 1, 3
- **Suggested verdict / confidence:** Caution / High

### T3 — Segment-agnostic discount
- **Proposal:** "Offer a 20% discount to all new customers to hit our quarterly bookings target."
- **Expected behavior:** Uses Reflect to state the cross-segment trend: every discount experiment boosted acquisition and hurt expansion or retention (SMB and mid-market). Mentions that enterprise has not been tested. Does not invent enterprise data.
- **Supporting records:** 1, 3, 8
- **Suggested verdict / confidence:** Caution / High

---

## B. No related history (must say it has no precedent)

### T4 — Enterprise usage limits
- **Proposal:** "Introduce a monthly API-call limit for enterprise customers."
- **Expected behavior:** Says usage-limit changes have only been tested on SMB (records 2, 10) and never on enterprise. May mention the SMB lessons (hard cutoffs hurt retention, overage worked) as loosely related but clearly labels them as a different segment. Recommends treating this as a new experiment with tracking.
- **Supporting records:** none direct; 2 and 10 as adjacent-segment context only
- **Suggested verdict / confidence:** No precedent / Low

### T5 — Partner channel pricing
- **Proposal:** "Create a reseller partner tier with a 20% commission-based price."
- **Expected behavior:** Plainly states there is no record of channel or reseller pricing. Does not stretch discount records to fit. Recommends logging the outcome if it goes ahead.
- **Supporting records:** none
- **Suggested verdict / confidence:** No precedent / Low

---

## C. Contradictory past outcomes (must surface the conflict)

### T6 — Bundle discount
- **Proposal:** "Offer mid-market customers a 15% discount when they bundle Analytics and Automation."
- **Expected behavior:** Reports mixed results: the bundle lifted retention +5 pts in Q2 2025 (record 4) but showed no measurable lift on the Oct 2025 relaunch (record 7). Points out the relaunch coincided with a pricing-page redesign and recommends isolating that variable before deciding.
- **Supporting records:** 4, 7
- **Suggested verdict / confidence:** Mixed / Medium

### T7 — Bundle for retention
- **Proposal:** "Bundle Automation with Analytics at a discount to improve mid-market retention."
- **Expected behavior:** Same contradiction as T6, framed around retention. Must not average the two results into a vague "modest improvement." Must name both records and the confounder.
- **Supporting records:** 4, 7
- **Suggested verdict / confidence:** Mixed / Medium

---

## D. Vague or ambiguous (handle gracefully)

### T8 — Extremely vague
- **Proposal:** "Should we change our pricing?"
- **Expected behavior:** Does not fabricate a pattern or crash. Asks for the specific change, segment, and goal, or offers a brief summary of what has been tested so far (discounts, bundles, trials, contract length, usage limits, enterprise pricing).
- **Supporting records:** none required
- **Suggested verdict / confidence:** Needs more info / Low

### T9 — Vague goal, no mechanism
- **Proposal:** "Make our pricing friendlier for customers."
- **Expected behavior:** Recognizes that no specific change was proposed. Asks a clarifying question or lists options with their track records, without recommending one as if it were proven.
- **Supporting records:** none required
- **Suggested verdict / confidence:** Needs more info / Low

---

## E. Mixed tested and untested segments

### T10 — Enterprise plus mid-market annual discount
- **Proposal:** "Give enterprise and mid-market customers a 25% discount for annual contracts."
- **Expected behavior:** Splits its answer. For mid-market: cites record 3 (25% annual discount, acquisition up, expansion down, NRR -6 pts) and the wider pattern. For enterprise: says an annual discount has never been tested; the only enterprise records (9, 11) involve a 3-year price lock and a price increase, not a discount. Recommends a small enterprise pilot cohort rather than a full rollout.
- **Supporting records:** 3 (mid-market), 1 and 8 (pattern); 9 and 11 only as "enterprise tested, but not with a discount"
- **Suggested verdict / confidence:** Caution / Medium

---

## Extra checks (edge cases for QA)

- Empty string proposal: should return a clean error message, not a 500.
- Very long proposal (500+ words): should still respond.
- Non-pricing question ("What's the weather?"): should say it only advises on pricing decisions.
- Empty memory bank (before seeding): should say it has no history yet. Use this for the "before" half of the before/after demo.
