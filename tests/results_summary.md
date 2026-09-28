# Results Summary

### T1
Proposal: Give mid-market customers a 30% discount on annual contracts.
Response: A similar 25% discount was tested with mid-market customers. It increased new‑logo revenue by 18% and accelerated deal cycles by 11 days, but led to a 12% decline in expansion revenue and a 6‑point drop in 12‑month net revenue retention. The proposed 30% discount for mid‑market annual contracts has not been tested.
has_evidence=True | verdict=supported | confidence=0.92 | evidence_items=5 | top_score=0.92
Contradictions (0): []
Patterns (1): ['Discounting mid-market annual contracts improves acquisition metrics but reduces expansion revenue and net revenue retention']
FLAG: an evidence item is stamped When: 2026-09-28 (likely the fused blob record)

### T2
Proposal: Run a 35% first-year promo for new SMB customers next quarter.
Response: A 30% first-year discount was tested with new SMB customers in Q4 2025. It increased new‑logo revenue by 31% but reduced expansion revenue by 15% and lowered net revenue retention by 8 points. A 35% first‑year discount for new SMB customers has not been tested.
has_evidence=True | verdict=supported | confidence=0.93 | evidence_items=2 | top_score=0.93
Contradictions (0): []
Patterns (1): ['Higher front‑end discounts boost new‑logo revenue but hurt expansion revenue and net revenue retention']

### T3
Proposal: Offer a 20% discount to all new customers to hit our quarterly bookings target.
Response: There is no record of a comparable past decision for this proposal. This would be a new experiment — recommend tracking the outcome closely so future decisions can learn from it.
has_evidence=False | verdict=no_precedent | confidence=0.0 | evidence_items=0
Contradictions (0): []
Patterns (0): []

### T4
Proposal: Introduce a monthly API-call limit for enterprise customers.
Response: There is no record of a comparable past decision for this proposal. This would be a new experiment — recommend tracking the outcome closely so future decisions can learn from it.
has_evidence=False | verdict=no_precedent | confidence=0.0 | evidence_items=0
Contradictions (0): []
Patterns (0): []

### T5
Proposal: Create a reseller partner tier with a 20% commission-based price.
Response: There is no record of a comparable past decision for this proposal. This would be a new experiment — recommend tracking the outcome closely so future decisions can learn from it.
has_evidence=False | verdict=no_precedent | confidence=0.0 | evidence_items=0
Contradictions (0): []
Patterns (0): []

### T6
Proposal: Offer mid-market customers a 15% discount when they bundle Analytics and Automation.
Response: A 15% bundle discount for Analytics and Automation was tested with mid‑market customers in May 2025, resulting in a 14% increase in net revenue per account and a 5‑percentage‑point lift in 6‑month gross retention. A later relaunch of the same 15% bundle in October 2025 showed no measurable retention lift, only a statistically insignificant 1% net revenue increase and a 0.4‑point change in 6‑month gross retention, lik...
has_evidence=True | verdict=mixed | confidence=0.56 | evidence_items=5 | top_score=0.93
Contradictions (1): ['May\u202f2025 implementation showed a 14% revenue increase and 5‑point retention gain, while the October\u202f2025 relaunch showed only a 1% revenue increase and 0.4‑point retention change']
Patterns (2): ['Bundle discounts can increase net revenue and retention when implemented in isolation', 'Concurrent pricing or packaging changes can obscure the impact of bundle discounts']

### T7
Proposal: Bundle Automation with Analytics at a discount to improve mid-market retention.
Response: A 15% bundle discount for Analytics and Automation was tested with mid‑market customers in May 2025, delivering a 14% rise in net revenue per account and a 5‑percentage‑point increase in 6‑month gross retention. The same 15% bundle was relaunched in October 2025 and produced no measurable retention lift, with only a 0.4‑point change in 6‑month gross retention. The proposed discount has not been evaluated at a differe...
has_evidence=True | verdict=mixed | confidence=0.56 | evidence_items=5 | top_score=0.93
Contradictions (1): ['May\u202f2025 15% bundle showed a +5‑point 6‑month gross retention lift, while October\u202f2025 15% bundle showed only a +0.4‑point change, indicating conflicting retention outcomes for the same discount.']
Patterns (3): ['A 15% bundle discount for Analytics and Automation in the mid-market segment was associated with a 14% increase in net revenue per account and a 5‑point increase in 6‑month gross retention when implemented in isolation (May\u202f2025).', 'When the 15% bundle discount was launched alongside a prici...

### T8
Proposal: Should we change our pricing?
Response: There is no record of a comparable past decision for this proposal. This would be a new experiment — recommend tracking the outcome closely so future decisions can learn from it.
has_evidence=False | verdict=no_precedent | confidence=0.0 | evidence_items=0
Contradictions (0): []
Patterns (0): []

### T9
Proposal: Make our pricing friendlier for customers.
Response: There is no record of a comparable past decision for this proposal. This would be a new experiment — recommend tracking the outcome closely so future decisions can learn from it.
has_evidence=False | verdict=no_precedent | confidence=0.0 | evidence_items=0
Contradictions (0): []
Patterns (0): []

### T10
Proposal: Give enterprise and mid-market customers a 25% discount for annual contracts.
Response: A similar 25% discount was tested with mid-market customers. It produced an 18% lift in new-logo revenue and 11-day faster deal cycles, but also a 12% drop in expansion revenue and a 6-point decline in 12-month net revenue retention. Enterprise customers have not been tested under a 25% annual discount.
has_evidence=True | verdict=mixed | confidence=0.56 | evidence_items=5 | top_score=0.93
Contradictions (1): ['The 25% discount led to both an 18% increase in new‑logo revenue and a 12% decline in expansion revenue, showing opposing effects on acquisition versus expansion']
Patterns (3): ['25% discounts increase new‑logo revenue but reduce expansion revenue and net revenue retention', 'Discounted accounts resist purchasing add‑on modules at list price', 'Enterprise segment has not been subjected to a 25% annual discount; recent policy raised minimum contract price and limited discou...

### E1_empty
Proposal: (empty string)
ERROR: ProposalError: Proposal is too short to reason about. Describe the pricing change, e.g. 'Give enterprise customers 30% off annual contracts.'

### E2_non_pricing
Proposal: What's the weather like today?
Response: There is no record of a comparable past decision for this proposal. This would be a new experiment — recommend tracking the outcome closely so future decisions can learn from it.
has_evidence=False | verdict=no_precedent | confidence=0.0 | evidence_items=0
Contradictions (0): []
Patterns (0): []

### E3_long
Proposal: Give mid-market customers a discount on annual contracts. Give mid-market customers a discount on annual contracts. Give mid-market customer...
ERROR: ProposalError: Proposal is too long (max 2000 characters).
