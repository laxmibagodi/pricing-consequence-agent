"""Run: python -m backend.test_memory"""
import os
import time

os.environ["HINDSIGHT_BANK_ID"] = "pricing-decisions-test"  # before importing memory

from backend import memory  # noqa: E402

SAMPLES = [
    {"pricing_change": "25% discount on annual contracts", "target_segment": "mid-market",
     "expected_effect": "More annual signups and higher cash upfront",
     "actual_effect": "Acquisition rose but expansion revenue declined",
     "revenue_impact": "+18% new-logo revenue, -12% expansion revenue",
     "retention_impact": "-4 pts net revenue retention", "date": "2025-03-14"},
    {"pricing_change": "20% first-year discount", "target_segment": "SMB",
     "expected_effect": "Faster signups",
     "actual_effect": "Signups up but customers churned after the discount ended",
     "revenue_impact": "+22% signups, flat revenue",
     "retention_impact": "-5 pts 6-month retention", "date": "2025-08-02"},
    {"pricing_change": "Extend free trial from 30 to 60 days", "target_segment": "mid-market",
     "expected_effect": "Higher trial-to-paid conversion",
     "actual_effect": "No change in conversion, longer sales cycle",
     "revenue_impact": "0% change", "retention_impact": "no change", "date": "2025-11-10"},
]
PROPOSAL = "Give enterprise customers a 30% discount for annual contracts"
UNRELATED = "Raise the API rate limit on the free tier"


def wait_for_recall(query, tries=8, delay=5):
    for i in range(tries):
        res = memory.recall_similar(query)
        if res:
            return res
        print(f"  waiting for Hindsight to index... ({(i + 1) * delay}s)")
        time.sleep(delay)
    return []


print("1) RETAIN")
for s in SAMPLES:
    if memory.is_retained(s):
        print("  already retained:", s["pricing_change"])
    else:
        memory.retain_decision(s)
        print("  retained:", s["pricing_change"])

print("\n2) RECALL (waits for indexing)")
results = wait_for_recall(PROPOSAL)
for r in results:
    print(f"  score={r['score']:.2f} | {r['text'][:110]}")
if results:
    raw = memory._get_client().recall(bank_id=memory.BANK_ID, query=PROPOSAL)
    print("\n  RAW FIELDS of first result (send me this):")
    print("  ", memory._to_dict(raw.results[0]))

print("\n3) REFLECT")
out = memory.reflect_pattern(PROPOSAL)
print("  summary:", out["summary"])

print("\n4) NO-PRECEDENT CHECK")
for q in ("Introduce usage-based pricing for enterprise API calls",
          "Change the office lunch policy"):
    print("  query:", q)
    for r in memory.recall_similar(q):
        print(f"    score={r['score']:.2f} | {r['text'][:80]}")

print("\n5) HISTORY")
for h in memory.get_history():
    print("  ", h)
    
memory._get_client().close()