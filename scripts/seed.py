"""Run once: python -m scripts.seed"""
import json
from pathlib import Path

from backend import memory

DATA = Path(__file__).resolve().parent.parent / "data" / "pricing_decisions.json"

records = json.loads(DATA.read_text(encoding="utf-8"))
for i, rec in enumerate(records, 1):
    if memory.is_retained(rec):
        print(f"[{i}/{len(records)}] skipped (already retained): {rec['pricing_change']}")
        continue
    memory.retain_decision(rec)
    print(f"[{i}/{len(records)}] retained: {rec['pricing_change']}")
print("Seed complete. Wait about a minute before testing recall.")
memory._get_client().close()