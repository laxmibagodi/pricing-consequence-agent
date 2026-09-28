"""Hindsight memory layer for Pricing Consequence Agent
The ONLY file that talks to Hindsight."""
import json
import os
from pathlib import Path
import hashlib
import inspect
from datetime import datetime, timezone
import re

from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
API_KEY = os.getenv("HINDSIGHT_API_KEY")
BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "pricing-decisions")

# Local mirror of what we retained, used by get_history()
HISTORY_FILE = Path(__file__).parent / f".history_{BANK_ID}.json"

DECISION_KEYS = ("pricing_change", "target_segment", "expected_effect",
                 "actual_effect", "revenue_impact", "retention_impact", "date")

_RETAIN_PARAMS = set(inspect.signature(Hindsight.retain).parameters)


def _parse_date(s):
    try:
        return datetime.strptime(s[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return None


def _human_date(iso):
    try:
        return datetime.strptime(iso[:10], "%Y-%m-%d").strftime("%d %B %Y").lstrip("0")
    except (ValueError, TypeError):
        return iso


def _doc_id(d):
    raw = f"{d['date']}|{d['target_segment']}|{d['pricing_change']}"
    return "decision-" + hashlib.sha1(raw.encode()).hexdigest()[:16]


def _retain_kwargs(decision):
    kwargs = {"bank_id": BANK_ID, "content": _format_decision(decision)}
    ts = _parse_date(decision["date"])
    if ts is not None and "timestamp" in _RETAIN_PARAMS:
        kwargs["timestamp"] = ts
    if "document_id" in _RETAIN_PARAMS:
        kwargs["document_id"] = _doc_id(decision)
    return kwargs

class MemoryServiceError(Exception):
    """Any Hindsight failure. An empty recall is NOT an error."""


_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not API_KEY:
        raise MemoryServiceError("HINDSIGHT_API_KEY is not set (check your .env file)")
    try:
        client = Hindsight(base_url=BASE_URL, api_key=API_KEY, timeout=60.0)
        try:
            client.create_bank(bank_id=BANK_ID, name="Pricing Decisions")
        except Exception as e:  # bank already exists is fine
            if not any(w in str(e).lower() for w in ("exist", "already", "conflict", "409")):
                raise
    except Exception as e:
        raise MemoryServiceError(f"Could not connect to Hindsight: {e}") from e
    _client = client
    return _client


def _to_dict(obj) -> dict:
    if isinstance(obj, dict):
        return obj
    for attr in ("model_dump", "dict"):
        fn = getattr(obj, attr, None)
        if callable(fn):
            try:
                return fn()
            except Exception:
                pass
    return dict(getattr(obj, "__dict__", {}))


def _format_decision(d: dict) -> str:
    return (
        f"On {_human_date(d['date'])} ({d['date']}), the company made this pricing decision: "
        f"{d['pricing_change']}. "
        f"Target segment: {d['target_segment']}. "
        f"Expected effect: {d['expected_effect']}. "
        f"Actual effect: {d['actual_effect']}. "
        f"Revenue impact: {d['revenue_impact']}. "
        f"Retention impact: {d['retention_impact']}."
    )


def _read_history() -> list:
    if HISTORY_FILE.exists():
        try:
            return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
    return []


def is_retained(decision: dict) -> bool:
    key = (decision["pricing_change"], decision["target_segment"], decision["date"])
    return any((h["pricing_change"], h["target_segment"], h["date"]) == key
               for h in _read_history())


def retain_decision(decision: dict) -> None:
    missing = [k for k in DECISION_KEYS if not decision.get(k)]
    if missing:
        raise ValueError(f"decision is missing fields: {missing}")
    try:
        _get_client().retain(**_retain_kwargs(decision))
    except MemoryServiceError:
        raise
    except Exception as e:
        raise MemoryServiceError(f"Hindsight retain failed: {e}") from e
    history = _read_history()
    history.append({k: decision[k] for k in
                    ("pricing_change", "target_segment", "actual_effect", "date")})
    HISTORY_FILE.write_text(json.dumps(history, indent=2), encoding="utf-8")


def _extract_score(d: dict):
    scores = d.get("scores")
    if isinstance(scores, dict):
        for k in ("final", "reranker", "semantic"):
            v = scores.get(k)
            if isinstance(v, (int, float)):
                return float(v)
    v = d.get("score")
    return float(v) if isinstance(v, (int, float)) else None

_PURPOSE_CUT = re.compile(
    r"(?:[,;]|\b(?:in order to|so that|so we|because|ahead of|given that|"
    r"to (?:hit|reach|meet|increase|improve|boost|drive|grow|raise|lift|win|close|"
    r"capture|counter|beat|offset|reduce|cut|accelerate|attract|retain))\b).*$",
    re.I,
)


def _core_query(proposal: str):
    """The pricing change without the business-purpose clause, or None if unchanged."""
    core = _PURPOSE_CUT.sub("", proposal).strip(" ,;.")
    if len(core) >= 12 and core.lower() != proposal.strip().lower():
        return core
    return None

def recall_similar(proposal: str, limit: int = 5) -> list:
    queries = [proposal]
    core = _core_query(proposal)
    if core:
        queries.append(core)

    raw = []
    for q in queries:
        try:
            res = _get_client().recall(bank_id=BANK_ID, query=q)
        except MemoryServiceError:
            raise
        except Exception as e:
            raise MemoryServiceError(f"Hindsight recall failed: {e}") from e
        raw.extend(list(getattr(res, "results", None) or []))

    grouped = {}  # one precedent per stored decision; best score across both queries
    for r in raw:
        d = _to_dict(r)
        text = d.get("text") or str(r)
        score = _extract_score(d)
        g = grouped.setdefault(d.get("document_id") or text,
                               {"texts": [], "score": 0.0, "metadata": {}})
        if text not in g["texts"]:
            g["texts"].append(text)
        if score is not None and score > g["score"]:
            g["score"] = score
        if not g["metadata"]:
            g["metadata"] = {k: d[k] for k in
                             ("document_id", "type", "occurred_start", "occurred_end", "tags")
                             if d.get(k) is not None}
            g["metadata"].update(d.get("metadata") or {})

    out = [{"text": " ".join(g["texts"]),
            "score": max(0.0, min(1.0, g["score"])),
            "metadata": g["metadata"]} for g in grouped.values()]
    out.sort(key=lambda x: x["score"], reverse=True)
    return out[:limit]


def reflect_pattern(proposal: str) -> dict:
    query = (f"Proposed pricing change: {proposal}. Based on our past pricing "
             "decisions, what patterns, consequences and contradictions are "
             "relevant? If we have no comparable history, say so plainly.")
    try:
        res = _get_client().reflect(bank_id=BANK_ID, query=query)
    except MemoryServiceError:
        raise
    except Exception as e:
        raise MemoryServiceError(f"Hindsight reflect failed: {e}") from e
    summary = getattr(res, "text", None) or str(res)
    return {"summary": summary, "evidence": recall_similar(proposal)}


RELEVANCE_MIN = 0.3
SEGMENTS = ("enterprise", "mid-market", "smb")
SEED_FILE = Path(__file__).resolve().parent.parent / "data" / "pricing_decisions.json"


CHANGE_TYPES = {
    "discount": ("discount", "promotion", "promo"),
    "price_increase": ("price hike", "price increase", "raise price", "raise the price"),
    "trial": ("trial",),
    "bundle": ("bundle",),
    "cap": ("hard cap", "usage cap", "usage limit", "starter cap"),
    "overage": ("overage",),
}


def evidence_confidence(precedents: list, proposal: str = "") -> dict:
    relevant = [p for p in precedents if p["score"] >= RELEVANCE_MIN]
    if not relevant:
        return {"level": "none", "relevant_count": 0, "exact_count": 0, "top_score": 0.0,
                "segment_match": False, "type_match": False}
    q = proposal.lower()
    segs = [s for s in SEGMENTS if s in q]
    kinds = [k for k, words in CHANGE_TYPES.items() if any(w in q for w in words)]

    def check(p):
        t = p["text"].lower()
        seg_ok = not segs or any(s in t for s in segs)
        type_ok = not kinds or any(w in t for k in kinds for w in CHANGE_TYPES[k])
        return seg_ok, type_ok

    checks = [(p, *check(p)) for p in relevant]
    exact = [p for p, seg_ok, type_ok in checks if seg_ok and type_ok]
    top = max((p["score"] for p in exact), default=max(p["score"] for p in relevant))
    n = len(exact)
    level = "high" if n >= 2 and top >= 0.7 else "medium" if n >= 1 and top >= 0.5 else "low"
    return {"level": level, "relevant_count": len(relevant), "exact_count": n,
            "top_score": round(top, 2),
            "segment_match": any(c[1] for c in checks),
            "type_match": any(c[2] for c in checks)}


def get_history() -> list:
    seed = []
    if "test" not in BANK_ID and "empty" not in BANK_ID and SEED_FILE.exists():
        try:
            seed = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            seed = []
    merged, seen = [], set()
    for h in seed + _read_history():
        key = (h["pricing_change"], h["target_segment"], h["date"])
        if key in seen:
            continue
        seen.add(key)
        merged.append({k: h[k] for k in
                       ("pricing_change", "target_segment", "actual_effect", "date")})
    return sorted(merged, key=lambda h: h["date"], reverse=True)


def track_record() -> str:
    query = ("Across all our past pricing decisions, compare the expected effect "
             "with the actual effect. List each decision where the outcome differed "
             "from expectation and state any common pattern in the misses.")
    try:
        res = _get_client().reflect(bank_id=BANK_ID, query=query)
    except MemoryServiceError:
        raise
    except Exception as e:
        raise MemoryServiceError(f"Hindsight reflect failed: {e}") from e
    return getattr(res, "text", None) or str(res)


def retain_note(text: str, date: str = "") -> None:
    if not text.strip():
        raise ValueError("note is empty")
    prefix = f"Pricing note ({date}): " if date else "Pricing note: "
    try:
        _get_client().retain(bank_id=BANK_ID, content=prefix + text.strip())
    except MemoryServiceError:
        raise
    except Exception as e:
        raise MemoryServiceError(f"Hindsight retain failed: {e}") from e

def create_discount_model():
    try:
        return _get_client().create_mental_model(
            bank_id=BANK_ID, name="Discount impact",
            source_query="What have our discounts done to acquisition, expansion revenue and retention?")
    except MemoryServiceError:
        raise
    except Exception as e:
        raise MemoryServiceError(f"Hindsight mental model failed: {e}") from e


def get_mental_models() -> list:
    try:
        models = _get_client().list_mental_models(bank_id=BANK_ID)
    except MemoryServiceError:
        raise
    except Exception as e:
        raise MemoryServiceError(f"Hindsight mental model failed: {e}") from e
    return [{"name": m.name, "content": m.content} for m in models.items]