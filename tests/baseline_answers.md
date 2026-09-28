# Baseline Answers (Plain LLM, No Memory)

Answers from a general-purpose LLM with no access to Arcline's pricing history. Used as the "before" half of the before/after demo. Test IDs match `tests/test_proposals.md`; record numbers match `data/pricing_decisions.json`.

> **Note:** T5, T6, T7 and T10 were captured in a chat that also contained other proposals, so a few answers cross-reference each other ("#6", "#4"). If time allows, re-run those four in fresh chats for a cleaner baseline.

---

## T1: Mid-market annual discount

**Proposal:** Give mid-market customers a 30% discount on annual contracts.

**Plain LLM answer (no memory):**
> Recommendation: Don't do it as proposed. A blanket 30% discount is steep enough to erode margins and reset customer price expectations, and it hands the discount to accounts that would have paid full price. If the goal is to drive annual commitments, cap the annual-vs-monthly incentive at 10-15%, which is the typical range where the cash-flow and retention benefits outweigh the revenue given up. If you need to go deeper on select deals, tie larger discounts to multi-year terms, expanded seat counts, or a fixed promotional window so the concession buys you something concrete.
> Since I don't have your numbers, I'm assuming this is an across-the-board offer rather than a targeted one. If you can share current gross margin, monthly-to-annual mix, and churn, I can pressure-test whether 30% could ever pencil out.

**Weakness:**
- Relies on a generic rule of thumb ("typical range 10-15%"), not this company's own results
- Doesn't know a 25% mid-market annual discount was already tried (record 3)
- Can't say what actually happened: acquisition +18%, expansion -12%, NRR -6 pts
- Ends by asking the user for data the company already generated
- Reasonable conclusion reached by luck, with no evidence behind it

**What the memory agent should say instead:**
> A similar 25% annual discount was tested with mid-market in March 2025. Acquisition rose 18%, but expansion revenue fell 12% and NRR dropped 6 points. The same shape appeared in two SMB discounts. Recommend a smaller pilot.

---

## T2: SMB first-year promo

**Proposal:** Run a 35% first-year promo for new SMB customers next quarter.

**Plain LLM answer (no memory):**
> Conditionally approve, but with guardrails. SMB churn is typically highest in year one, so a deep discount can attract price-sensitive buyers who leave at renewal, and it can anchor them to a price you'll struggle to restore. Limit it to annual prepay, cap the number of seats or accounts, and tie it to a defined cohort so you can measure year-two retention and payback. Also consider stepping the discount down (e.g., 35% then 15% at renewal) rather than a cliff back to list price.

**Weakness:**
- Approves conditionally without knowing Arcline already ran a 30% SMB first-year promo (record 8)
- Doesn't know that promo gave +31% new-logo revenue but -15% expansion and -8 pts NRR at first renewal
- Warns about year-one churn in general terms; cannot cite the actual renewal drop
- Doesn't connect it to the 20% SMB annual discount (record 1), which had the same shape

**What the memory agent should say instead:**
> A 30% first-year SMB promo ran in Nov 2025: new-logo revenue +31%, but expansion -15% and NRR -8 pts at first renewal. A 35% offer is deeper than anything tested and is likely to repeat or worsen that drop.

---

## T3: Segment-agnostic discount

**Proposal:** Offer a 20% discount to all new customers to hit the quarterly bookings target.

**Plain LLM answer (no memory):**
> Don't do it as stated. A blanket discount gives margin away to buyers who would have paid full price, and discounting to hit a quarterly number trains the sales team and market to wait for quarter-end deals. If you need to close a bookings gap, use targeted, conditional levers instead, such as multi-year commitments, annual prepay, or a discount only on deals that are stalled and at risk. Set a discount floor and require approval for anything above it.

**Weakness:**
- Generic sales-discipline advice, not evidence from Arcline's own experiments
- Doesn't know all three discount experiments (records 1, 3, 8) boosted acquisition but hurt expansion and NRR
- Can't state the cross-segment pattern or that enterprise has never been tested
- Suggests "annual prepay" as a fix, which is exactly what records 1 and 3 tested and found harmful to expansion

**What the memory agent should say instead:**
> Every discount tested so far (SMB annual, mid-market annual, SMB Q4 promo) lifted new-logo revenue but cut expansion and NRR. Enterprise has not been tested.

---

## T4: Enterprise API-call limit (no precedent)

**Proposal:** Introduce a monthly API-call limit for enterprise customers.

**Plain LLM answer (no memory):**
> Proceed, but as a structured usage tier rather than a hard cap. Enterprise customers often build critical workflows on your API, so abrupt throttling risks escalations and churn. Set generous included volumes based on actual usage data, add tiered overage pricing or committed-use bundles, and give existing customers 90+ days' notice with grandfathering or a transition credit. Alert them at 80% of the limit so nothing surprises them.

**Weakness:**
- Gives confident "Proceed" advice although Arcline has **never tested usage limits on enterprise**
- Doesn't say it lacks precedent; presents general norms as if they applied here
- Doesn't know the SMB lessons: hard cap hurt retention (record 2, -5 pts), overage pricing worked (record 10, +12% MRR)

**What the memory agent should say instead:**
> No record of a usage-limit change with enterprise. Usage limits have only been tested on SMB: a hard cap increased churn, while pay-as-you-go overage improved retention. This would be a new experiment; track it closely.

---

## T5: Reseller partner tier (no precedent)

**Proposal:** Create a reseller partner tier with a 20% commission-based price.

**Plain LLM answer (no memory):**
> Recommendation: Proceed, but structure it as a tiered program with clear rules rather than a flat 20% for every partner. A 20% reseller margin is within the normal range for B2B SaaS, and it can extend your reach into segments your direct team can't cover efficiently. The risk is channel conflict and margin dilution, so require partners to meet a minimum annual volume or certification, register deals to protect your direct pipeline, and hold a price floor so resellers can't undercut your list price. Consider stepping the rate up (say 15% to 25%) as partners hit volume thresholds, and pay a lower rate on renewals than on new-logo deals so the incentive rewards acquisition.
> Before launching, confirm your gross margin can absorb 20% off the top after support and onboarding costs, since partner-sourced deals often need more enablement than direct ones.

**Weakness:**
- Detailed, confident advice built entirely from industry norms
- Arcline has **no channel or reseller pricing history at all**, and the answer never says so
- A trustworthy advisor would flag the gap instead of filling it

**What the memory agent should say instead:**
> No record of channel or reseller pricing has been tested. This would be a new experiment; log the outcome so future decisions can learn from it.

---

## T6: Mid-market bundle discount (contradiction)

**Proposal:** Offer mid-market customers a 15% discount when they bundle Analytics and Automation.

**Plain LLM answer (no memory):**
> Recommendation: Proceed, and this is one of the healthier discount structures you've proposed. A bundle discount ties the concession to something you want, namely broader product adoption, and multi-product customers typically churn less and expand more, so 15% is well within the range that pays for itself. To keep it clean, make the discount apply only to the combined package (not to either product alone), lock it to the same contract term for both, and set the discount so the bundle price still clears your target margin on each product's standalone cost. Also decide upfront how it works at renewal and for existing customers who already own one product, since cross-sell to your installed base is often where this offer performs best.
> Track bundle attach rate and retention against single-product customers, and make sure the customers taking the bundle are ones who would actually use both rather than buyers who just want the lower price on one.

**Weakness:**
- Confident "Proceed" with no company evidence
- Misses the contradiction: the bundle worked in Q2 2025 (record 4, +5 pts retention) but showed no lift on the Oct 2025 relaunch (record 7)
- Never mentions the pricing-page redesign that confounded the relaunch

**What the memory agent should say instead:**
> Results have been mixed: the bundle improved retention +5 pts in Q2 2025 but showed no measurable lift on the Oct 2025 relaunch, which coincided with a pricing-page redesign. Worth isolating that variable before deciding.

---

## T7: Bundle for retention (contradiction)

**Proposal:** Bundle Automation with Analytics at a discount to improve mid-market retention.

**Plain LLM answer (no memory):**
> Recommendation: Proceed, and treat this as the same bundle as #6 with retention as the stated goal. If retention is the objective, the discount matters less than whether customers actually adopt both products, so keep it modest (10-15%) and pair it with onboarding that gets the second product integrated into their workflows. Deeper integration is what drives stickiness, and a discount alone just lowers the price of leaving later. Target the bundle at accounts showing early churn signals or approaching renewal, and consider making the discount conditional on a 12-24 month term so the retention benefit is contractual as well as behavioral.
> If #6 and #7 are meant to be one initiative, consolidate them so you don't launch two overlapping offers. Measure success by comparing gross retention of bundle customers against a matched single-product cohort, since bundle buyers may already be your healthiest accounts and would flatter the results.

**Weakness:**
- Same missed contradiction as T6 (records 4 and 7)
- Its caution that bundle buyers "may already be your healthiest accounts" is a guess; the agent has actual evidence of one win and one null result
- Suggests measuring against a matched cohort, but doesn't know Arcline already has two data points

**What the memory agent should say instead:**
> The bundle lifted gross retention +5 pts in Q2 2025 but only +0.4 pts (within noise) on the relaunch. Do not average these; the relaunch coincided with a pricing-page redesign.

---

## T8: Extremely vague

**Proposal:** Should we change our pricing?

**Plain LLM answer (no memory):**
> I can't give a yes or no without evidence, but change it only if you can point to a specific problem: win rates, discounting patterns, churn by segment, expansion rates, or a gap between price and value delivered. If those metrics look healthy, leave list prices alone and optimize packaging or discount discipline instead. If you're seeing trouble, run a structured review (customer interviews, willingness-to-pay data, competitor benchmarks) and pilot changes on new customers before touching the base.

**Weakness:**
- Sensible but generic; asks the user to go find data
- Doesn't know Arcline has already run 12 pricing experiments with measured outcomes
- Could have summarized what has been tested and what has not

**What the memory agent should say instead:**
> Which change do you have in mind? So far Arcline has tested discounts, bundles, free trials, contract lengths, usage limits and enterprise pricing. Here is what happened in each.

---

## T9: Vague goal, no mechanism

**Proposal:** Make our pricing friendlier for customers.

**Plain LLM answer (no memory):**
> This is too vague to act on, so first define what "unfriendly" means: confusing tiers, surprise overages, rigid contracts, or high entry cost. Then fix the specific friction, for example by simplifying plans, making pricing transparent, offering monthly billing options, or adding a low-cost entry tier. Avoid a general price cut, since "friendlier" usually means clearer and more predictable, not cheaper.

**Weakness:**
- Generic list of pricing best practices
- Doesn't know overage pricing already worked for SMB (record 10: +12% MRR, +3 pts retention)
- Doesn't know the hard-cap change hurt retention (record 2), or that a longer trial reduced conversion (record 5)
- Suggests options without any track record behind them

**What the memory agent should say instead:**
> No specific change was proposed. Options with a track record: replacing hard caps with overage pricing improved SMB retention; a guided pilot lifted mid-market conversion; discounts consistently hurt expansion. Which friction are you trying to remove?

---

## T10: Enterprise and mid-market annual discount (mixed tested / untested)

**Proposal:** Give enterprise and mid-market customers a 25% discount for annual contracts.

**Plain LLM answer (no memory):**
> Recommendation: Don't do it at 25%; cap the annual-prepay incentive at 10-15% for both segments. This is essentially a variation on #1, extended to enterprise, and it carries the same problems: most of these customers already sign annual contracts, so you'd be discounting deals you'd have won anyway. Enterprise is the bigger risk, since it hands buyers a 25% anchor they'll use as the starting point for negotiation and then try to stack with volume and multi-year concessions. If you want to move more customers to annual or multi-year terms, make the discount segment-specific (smaller for enterprise, where procurement already expects annual terms), and pay for deeper cuts with something concrete, like upfront payment, a longer term, or higher committed volume.
> Check what share of these accounts are already on annual contracts before deciding, because if it's most of them, the discount is nearly all cost and very little incentive.

**Weakness:**
- Lands in a similar place, but with no evidence
- Doesn't know a 25% mid-market annual discount was tested (record 3: acquisition +18%, expansion -12%, NRR -6 pts)
- Doesn't know an **enterprise annual discount has never been tested**
- Asserts that most enterprise customers already sign annual contracts, which is unverified
- Doesn't split its answer into "tested" and "untested" segments

**What the memory agent should say instead:**
> Mid-market: a 25% annual discount was tested in March 2025; acquisition rose 18% but expansion fell 12% and NRR dropped 6 points. Enterprise: an annual discount has never been tested. The only enterprise records are a 3-year price lock and a price increase. Recommend a small enterprise pilot cohort.

---

## Strongest before/after pairs for the demo

1. **T6/T7:** confident "Proceed" versus a surfaced contradiction
2. **T10:** generic "cap at 10-15%" versus "mid-market tested, enterprise never tested"
3. **T4/T5:** confident advice from norms versus "no precedent"
4. **T2:** conditional approval versus the exact 30% SMB promo results
