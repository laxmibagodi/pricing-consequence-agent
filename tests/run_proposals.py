
"""Run the test proposals through the agent and save the answers.
 
Usage (from the repo root, with .env in place and the memory bank seeded):
    python tests/run_proposals.py          # run all tests
    python tests/run_proposals.py T4       # run one test
    python tests/run_proposals.py T1 T6    # run several
 
Results are written to tests/agent_results.md so you can compare them with
tests/test_proposals.md (expected behavior) and tests/baseline_answers.md
(plain LLM answers).
"""
 
import json
import sys
import time
from datetime import datetime
from pathlib import Path
 
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))
 
from dotenv import load_dotenv  # noqa: E402
 
load_dotenv(ROOT / ".env")
 
from backend.agent import respond_to_proposal  # noqa: E402
 
PROPOSALS = {
    "T1": "Give mid-market customers a 30% discount on annual contracts.",
    "T2": "Run a 35% first-year promo for new SMB customers next quarter.",
    "T3": "Offer a 20% discount to all new customers to hit our quarterly bookings target.",
    "T3a": "Offer a 20% discount to all new SMB customers.",
    "T3b": "Offer a 20% discount to all new mid-market customers.",
    "T3c": "Offer a 20% discount to all new customers.",
    "T4": "Introduce a monthly API-call limit for enterprise customers.",
    "T5": "Create a reseller partner tier with a 20% commission-based price.",
    "T6": "Offer mid-market customers a 15% discount when they bundle Analytics and Automation.",
    "T7": "Bundle Automation with Analytics at a discount to improve mid-market retention.",
    "T8": "Should we change our pricing?",
    "T9": "Make our pricing friendlier for customers.",
    "T10": "Give enterprise and mid-market customers a 25% discount for annual contracts.",
    # Edge cases
    "E1_empty": "",
    "E2_non_pricing": "What's the weather like today?",
    "E3_long": "Give mid-market customers a discount on annual contracts. " * 60,
}
 
OUTPUT_FILE = ROOT / "tests" / "agent_results.md"
 
 
def run_one(test_id: str, proposal: str) -> str:
    start = time.time()
    try:
        result = respond_to_proposal(proposal)
    except Exception as exc:  # keep going so one failure does not stop the run
        return f"**ERROR:** {type(exc).__name__}: {exc}"
    elapsed = time.time() - start
    
    if hasattr(result, "model_dump"):
        result = result.model_dump()
 
    if isinstance(result, str):
        body = result
    else:
        body = "```json\n" + json.dumps(result, indent=2, default=str) + "\n```"
    return f"{body}\n\n_Response time: {elapsed:.1f}s_"
 
 
def main() -> int:
    requested = sys.argv[1:]
    unknown = [t for t in requested if t not in PROPOSALS]
    if unknown:
        print(f"Unknown test id(s): {unknown}. Valid: {list(PROPOSALS)}")
        return 1
 
    selected = requested or list(PROPOSALS)
    lines = [
        "# Agent Results",
        "",
        f"Run at {datetime.now():%Y-%m-%d %H:%M}",
        "",
        "Compare each answer with `tests/test_proposals.md` (expected) and "
        "`tests/baseline_answers.md` (plain LLM).",
        "",
    ]
 
    for test_id in selected:
        proposal = PROPOSALS[test_id]
        shown = proposal if len(proposal) < 200 else proposal[:200] + "..."
        print(f"Running {test_id}: {shown!r}")
        answer = run_one(test_id, proposal)
        lines += [
            f"## {test_id}",
            "",
            f"**Proposal:** {shown or '(empty string)'}",
            "",
            "**Agent answer:**",
            "",
            answer,
            "",
            "**Pass / Fail:** ",
            "",
            "**Notes for Prapthi / Laxmi:** ",
            "",
            "---",
            "",
        ]
 
    OUTPUT_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nSaved to {OUTPUT_FILE}")
    return 0
 
 
if __name__ == "__main__":
    sys.exit(main())