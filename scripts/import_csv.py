"""Run: python -m scripts.import_csv path/to/file.csv   (dates in ISO, e.g. 2025-03-14)"""
import csv
import sys

from backend import memory


def main(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    for i, row in enumerate(rows, 1):
        row = {k.strip().lower(): (v or "").strip() for k, v in row.items()}
        d = {k: row.get(k) or "not recorded" for k in memory.DECISION_KEYS}
        if d["pricing_change"] == "not recorded" or d["date"] == "not recorded":
            print(f"[{i}] skipped (needs pricing_change and date)")
            continue
        if memory.is_retained(d):
            print(f"[{i}] already retained")
            continue
        memory.retain_decision(d)
        print(f"[{i}/{len(rows)}] retained: {d['pricing_change']}")


main(sys.argv[1])