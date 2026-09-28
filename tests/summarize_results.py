"""Summarize tests/agent_results.md into a short, pasteable view.

Usage (from the repo root, after python tests/run_proposals.py):
    python tests/summarize_results.py

Prints one compact block per test and saves it to tests/results_summary.md.
Contains no keys, so it is safe to paste into chat.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tests" / "agent_results.md"
OUTPUT = ROOT / "tests" / "results_summary.md"
BLOB_MARKER = "2026-09-28"  # today's date on the fused/undated records


def short(text: str, limit: int = 420) -> str:
    text = " ".join(str(text).split())
    return text if len(text) <= limit else text[:limit] + "..."


def summarize_section(title: str, body: str) -> str:
    lines = [f"### {title}"]

    proposal = re.search(r"\*\*Proposal:\*\*\s*(.*)", body)
    if proposal:
        lines.append(f"Proposal: {short(proposal.group(1), 140)}")

    error = re.search(r"\*\*ERROR:\*\*\s*(.*)", body)
    if error:
        lines.append(f"ERROR: {short(error.group(1))}")
        return "\n".join(lines)

    block = re.search(r"```json\s*(.*?)\s*```", body, re.S)
    if not block:
        answer = body.split("**Agent answer:**", 1)[-1].split("**Pass", 1)[0]
        lines.append(f"Answer (plain text): {short(answer)}")
        return "\n".join(lines)

    try:
        data = json.loads(block.group(1))
    except json.JSONDecodeError:
        lines.append("Could not parse the JSON block; open agent_results.md for this test.")
        return "\n".join(lines)

    # The runner may have stored a repr string instead of a dict.
    if isinstance(data, str):
        lines.append(f"Answer (raw string): {short(data, 600)}")
        return "\n".join(lines)

    evidence = data.get("evidence") or []
    scores = [e.get("score") for e in evidence if isinstance(e, dict) and e.get("score") is not None]
    blob = any(
        BLOB_MARKER in str(e.get("text", "")) for e in evidence if isinstance(e, dict)
    )

    lines.append(f"Response: {short(data.get('response', ''))}")
    lines.append(
        f"has_evidence={data.get('has_evidence')} | verdict={data.get('verdict')} "
        f"| confidence={data.get('confidence')} | evidence_items={len(evidence)}"
        + (f" | top_score={max(scores):.2f}" if scores else "")
    )
    contradictions = data.get("contradictions") or []
    patterns = data.get("patterns") or []
    lines.append(f"Contradictions ({len(contradictions)}): {short(contradictions, 300)}")
    lines.append(f"Patterns ({len(patterns)}): {short(patterns, 300)}")
    if blob:
        lines.append(f"FLAG: an evidence item is stamped {BLOB_MARKER} (likely the fused blob record)")
    return "\n".join(lines)


def main() -> None:
    if not SOURCE.exists():
        print(f"{SOURCE} not found. Run python tests/run_proposals.py first.")
        return

    text = SOURCE.read_text(encoding="utf-8")
    sections = re.split(r"^## ", text, flags=re.M)[1:]
    out = ["# Results Summary", ""]
    for section in sections:
        title, _, body = section.partition("\n")
        out.append(summarize_section(title.strip(), body))
        out.append("")

    summary = "\n".join(out)
    OUTPUT.write_text(summary, encoding="utf-8")
    print(summary)
    print(f"\nSaved to {OUTPUT}")


if __name__ == "__main__":
    main()