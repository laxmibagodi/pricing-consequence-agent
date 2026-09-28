"""Run: python -m backend.loop_demo   (proves the learning loop, uses a fresh bank)"""
import os
import time

os.environ["HINDSIGHT_BANK_ID"] = f"pricing-loop-demo-{int(time.time())}"  # before import

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
PILOT = {
    "pricing_change": "30% discount on annual contracts (pilot, 5 accounts)",
    "target_segment": "enterprise",
    "expected_effect": "Faster annual closes",
    "actual_effect": "Closed 20% faster and expansion held steady because contract scope was fixed",
    "revenue_impact": "+9% enterprise new-logo revenue, expansion flat",
    "retention_impact": "+1 pt net revenue retention", "date": "2026-09-01",
}
PROPOSAL = "Give enterprise customers a 30% discount for annual contracts"


def wait_until(fn, ok, tries=12, delay=5):
    for _ in range(tries):
        res = fn()
        if ok(res):
            return res
        time.sleep(delay)
    return fn()


def show(title):
    recall = wait_until(lambda: memory.recall_similar(PROPOSAL), lambda r: bool(r))
    print(f"\n===== {title} =====")
    print("confidence:", memory.evidence_confidence(recall, PROPOSAL))
    for r in recall:
        print(f"  score={r['score']:.2f} | {r['text'][:95]}")
    print("\nREFLECT:\n", memory.reflect_pattern(PROPOSAL)["summary"])


for s in SAMPLES:
    memory.retain_decision(s)
show("BEFORE: no enterprise history")

print("\n>>> Logging the enterprise pilot outcome...")
memory.retain_decision(PILOT)
wait_until(lambda: memory.recall_similar(PROPOSAL),
           lambda r: any("enterprise" in x["text"].lower() and x["score"] >= 0.3 for x in r))
show("AFTER: enterprise pilot retained")

memory._get_client().close()