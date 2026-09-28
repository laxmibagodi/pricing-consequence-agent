"""
TEMPORARY STUB of Laxmi's memory.py. Delete this file when her real version
is merged. Function names, arguments, and return shapes follow her contract:

  MemoryServiceError                 raised for ANY Hindsight failure
  retain_decision(dict) -> None      fields: pricing_change, target_segment,
                                     expected_effect, actual_effect,
                                     revenue_impact, retention_impact, date
  recall_similar(proposal, limit=5)  -> [{text, score (0-1), metadata}]
                                     empty result is [], never an exception
  reflect_pattern(proposal)          -> {summary, evidence}
  get_history()                      -> [{pricing_change, target_segment,
                                          actual_effect, date}]

Stub-only test hooks (keywords in the proposal text):
  "enterprise" + "discount"  -> strong match + one weak match
  "bundle"                   -> two contradictory results
  "usage"                    -> empty list
  "free trial"               -> only a below-threshold (weak) match
  "__memory_down__"          -> raises MemoryServiceError
"""

from typing import Dict, List


class MemoryServiceError(Exception):
    """Any Hindsight/API failure. An empty result is NOT an error."""


_REQUIRED_RETAIN_FIELDS = (
    "pricing_change", "target_segment", "expected_effect",
    "actual_effect", "revenue_impact", "retention_impact", "date",
)

_history: List[Dict] = [
    {"pricing_change": "25% annual discount", "target_segment": "Mid-market",
     "actual_effect": "Acquisition +12%, expansion revenue -8%", "date": "2026-03-14"},
    {"pricing_change": "15% annual discount", "target_segment": "Enterprise",
     "actual_effect": "Acquisition +5%, retention +6%", "date": "2026-06-20"},
    {"pricing_change": "30% annual discount", "target_segment": "SMB",
     "actual_effect": "Conversion +18%, revenue per customer -14%", "date": "2026-04-09"},
]


def retain_decision(decision: dict) -> None:
    if "__memory_down__" in str(decision.get("pricing_change", "")):
        raise MemoryServiceError("stub: simulated Hindsight failure")
    missing = [f for f in _REQUIRED_RETAIN_FIELDS if f not in decision]
    if missing:
        raise MemoryServiceError(f"stub: retain_decision missing fields {missing}")
    _history.append({
        "pricing_change": decision["pricing_change"],
        "target_segment": decision["target_segment"],
        "actual_effect": decision["actual_effect"],
        "date": decision["date"],
    })


def recall_similar(proposal: str, limit: int = 5) -> List[Dict]:
    p = proposal.lower()
    if "__memory_down__" in p:
        raise MemoryServiceError("stub: simulated Hindsight failure")

    if "bundle" in p:
        results = [
            {"text": "Bundle discount, Q2, enterprise: retention +4%, expansion revenue +7%.",
             "score": 0.71, "metadata": {"segment": "Enterprise", "date": "2026-04-30"}},
            {"text": "Same bundle discount, Q4, enterprise: no material effect. Coincided with a pricing page redesign.",
             "score": 0.68, "metadata": {"segment": "Enterprise", "date": "2026-10-15"}},
        ]
    elif "enterprise" in p and "discount" in p:
        results = [
            {"text": "25% annual discount, mid-market: acquisition +12%, expansion revenue -8%.",
             "score": 0.82, "metadata": {"segment": "Mid-market", "date": "2026-03-14"}},
            {"text": "15% annual discount, enterprise: acquisition +5%, retention +6%.",
             "score": 0.74, "metadata": {"segment": "Enterprise", "date": "2026-06-20"}},
            {"text": "30% annual discount, SMB: conversion +18%, revenue per customer -14%.",
             "score": 0.38, "metadata": {"segment": "SMB", "date": "2026-04-09"}},
        ]
    elif "free trial" in p:
        results = [
            {"text": "Trial extended 14 to 30 days, SMB: conversion +15%.",
             "score": 0.31, "metadata": {"segment": "SMB", "date": "2026-05-02"}},
        ]
    else:
        results = []  # includes "usage"

    return results[:limit]


def reflect_pattern(proposal: str) -> Dict:
    if "__memory_down__" in proposal.lower():
        raise MemoryServiceError("stub: simulated Hindsight failure")
    p = proposal.lower()
    if "bundle" in p:
        return {
            "summary": "Same bundle discount produced different results in Q2 and Q4.",
            "evidence": ["EXP-0005", "EXP-0044"],
        }
    if "enterprise" in p and "discount" in p:
        return {
            "summary": "Larger discounts raised acquisition but lowered revenue per customer outside enterprise. The only enterprise test (15%) was positive.",
            "evidence": ["EXP-0017", "EXP-0023", "EXP-0031"],
        }
    return {"summary": "", "evidence": []}


def get_history() -> List[Dict]:
    return list(_history)