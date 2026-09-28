# Demo Examples Log

Best before/after exchanges found during testing. Used for the demo video and the article.

**Company:** Arcline (fictional mid-market B2B SaaS). **Tested:** 2026-09-28.
**Baseline** = a plain LLM with no access to Arcline's history (full text in `tests/baseline_answers.md`).
**Agent** = the Pricing Consequence Agent with Hindsight memory (full output in `tests/agent_results_run1.md`).

> **Do not use T3 in the live demo** (known false "no precedent" bug when extra business context is added). Use T3a or T3c for a discount example.

---

## Example 1: The bundle contradiction (best moment)

- **Date tested:** 2026-09-28
- **Test ID:** T6 (T7 is the same contradiction framed around retention)
- **Category:** contradiction

**Proposal:**
> Offer mid-market customers a 15% discount when they bundle Analytics and Automation.

**Baseline response (plain LLM, no memory):**
> "Proceed, and this is one of the healthier discount structures you've proposed... multi-product customers typically churn less and expand more, so 15% is well within the range that pays for itself."

**Agent response (with memory):**
> A 15% bundle discount for Analytics and Automation was tested with mid-market customers in May 2025, resulting in a 14% increase in net revenue per account and a 5-percentage-point lift in 6-month gross retention. A later relaunch of the same 15% bundle in October 2025 showed no measurable retention lift, only a statistically insignificant 1% net revenue increase and a 0.4-point change in 6-month gross retention, likely confounded by concurrent pricing-page redesigns.

**Verdict / confidence shown:** `mixed` / 0.56

**Contradiction surfaced:** May 2025 showed +14% revenue and +5 pts retention; the October 2025 relaunch showed only +1% revenue and +0.4 pts. Pattern noted: concurrent pricing or packaging changes can obscure the impact of a bundle discount.

**Why it is impressive:**
- The plain LLM says "Proceed" with confidence; the agent shows the same offer worked once and did not the second time.
- It surfaces the conflict instead of averaging it away.
- It points at the confounder (the pricing-page redesign) as the thing to isolate.

**Before/after note:** Without memory: a confident generic "Proceed." With memory: "Results are mixed, isolate the redesign before deciding."

**Records that supported the answer:** 4 (May 2025), 7 (Oct 2025)

**Use in:** video (lead with this) and article

---

## Example 2: Mid-market tested, enterprise untested

- **Date tested:** 2026-09-28
- **Test ID:** T10
- **Category:** mixed tested and untested segments

**Proposal:**
> Give enterprise and mid-market customers a 25% discount for annual contracts.

**Baseline response (plain LLM, no memory):**
> "Don't do it at 25%; cap the annual-prepay incentive at 10-15% for both segments... most of these customers already sign annual contracts, so you'd be discounting deals you'd have won anyway."

**Agent response (with memory):**
> A similar 25% discount was tested with mid-market customers. It produced an 18% lift in new-logo revenue and 11-day faster deal cycles, but also a 12% drop in expansion revenue and a 6-point decline in 12-month net revenue retention. Enterprise customers have not been tested under a 25% annual discount.

**Verdict / confidence shown:** `mixed` / 0.56

**Why it is impressive:**
- It splits the answer into what history says (mid-market) and what it does not know (enterprise).
- It does not fill the enterprise gap with a generic rule of thumb.
- The plain LLM asserts facts about enterprise contracts it cannot know.

**Before/after note:** Without memory: a generic "cap at 10-15%." With memory: exact numbers for the tested segment and an honest gap for the other.

**Records that supported the answer:** 3 (mid-market); 9 and 11 are the only enterprise records and neither is a discount

**Use in:** video and article

---

## Example 3: Honest "no precedent"

- **Date tested:** 2026-09-28
- **Test ID:** T4 (T5, the reseller tier, behaves the same way)
- **Category:** no precedent

**Proposal:**
> Introduce a monthly API-call limit for enterprise customers.

**Baseline response (plain LLM, no memory):**
> "Proceed, but as a structured usage tier rather than a hard cap... Set generous included volumes based on actual usage data, add tiered overage pricing..."

**Agent response (with memory):**
> There is no record of a comparable past decision for this proposal. This would be a new experiment — recommend tracking the outcome closely so future decisions can learn from it.

**Verdict / confidence shown:** `no_precedent` / 0.0

**Why it is impressive:**
- The plain LLM gives detailed, confident advice about a situation the company has never tested.
- The agent says it does not know and asks to log the outcome, which is what makes the next decision better.
- Trustworthiness: it does not stretch the SMB usage-limit records to fit enterprise.

**Before/after note:** Without memory: confident advice from norms. With memory: an honest gap, plus a prompt to learn from the result.

**Records that supported the answer:** none. Usage limits have only been tested on SMB (records 2 and 10).

**Use in:** video and article

---

## Example 4: Exact numbers and dates

- **Date tested:** 2026-09-28
- **Test ID:** T1 (T3a is a good alternative)
- **Category:** pattern match

**Proposal:**
> Give mid-market customers a 30% discount on annual contracts.

**Baseline response (plain LLM, no memory):**
> "Don't do it as proposed... cap the annual-vs-monthly incentive at 10-15%, which is the typical range..." It also asks the user to share their own margin and churn numbers.

**Agent response (with memory):**
> A similar 25% discount was tested with mid-market customers. It increased new-logo revenue by 18% and accelerated deal cycles by 11 days, but caused a 12% decline in expansion revenue and a 6-point drop in 12-month net revenue retention. A 30% discount for mid-market annual contracts has not been tested.

**Verdict / confidence shown:** `supported` / 0.92 _(the label reads as "go ahead" although the precedent is negative; waiting on a better label from Prapthi)_

**Pattern found:** discounts improve acquisition but reduce expansion revenue and net revenue retention.

**Why it is impressive:**
- The plain LLM relies on an industry rule of thumb and asks the user for data the company already generated.
- The agent answers in the company's own numbers, with the date and segment of the past decision.

**Before/after note:** Without memory: guesswork and a request for data. With memory: the company's own precedent in seconds.

**Records that supported the answer:** 3 (primary), 1, 8

**Use in:** video and article

---

## Extra: discount pattern across segments

- **Test ID:** T3a ("Offer a 20% discount to all new SMB customers.")
- **Agent response:** cites the 20% SMB annual discount: +22% new-logo revenue, -9% expansion revenue per account, net revenue retention 94% to 91% over 12 months. Notes the proposal is broader than what was tested.
- **Verdict / confidence:** `supported` / 0.93
- **Use in:** article (good second discount example)

---

## Template (copy for new examples)

### Example N: [short title]

- **Date tested:**
- **Test ID:**
- **Category:** pattern match / no precedent / contradiction / vague / mixed

**Proposal:**
> 

**Baseline response:**
> 

**Agent response (with memory):**
> 

**Verdict / confidence shown:**

**Why it is impressive:**
- 

**Before/after note:**

**Records that supported the answer:**

**Use in:** video / article / both

---

## Demo storyline checklist

- [x] One example where memory prevents a mistake (pattern match): Example 4
- [x] One example where the agent honestly says "no precedent": Example 3
- [x] One example where the agent surfaces a contradiction: Example 1
- [x] One example that splits tested vs untested segments: Example 2
- [x] Baseline response captured for each
- [ ] Learning loop: log a new outcome, ask a similar question, show the answer change (needs `/outcome` from Prapthi)
- [ ] Empty-memory-bank run for the "before" half of the demo