"""Validate data/pricing_decisions.json against the agreed 7-key schema.

Run from the repo root:   python tests/validate_data.py
Exit code 0 = pass, 1 = fail (so it also works in CI or a pre-push hook).
"""

import json
import sys
from datetime import date
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "pricing_decisions.json"

REQUIRED_KEYS = {
    "pricing_change",
    "target_segment",
    "expected_effect",
    "actual_effect",
    "revenue_impact",
    "retention_impact",
    "date",
}


def validate(path: Path) -> list[str]:
    errors: list[str] = []

    try:
        raw = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return [f"File not found: {path}"]

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        return [f"Invalid JSON: {exc}"]

    if not isinstance(data, list):
        return ["Top level must be a JSON array."]
    if not data:
        return ["Array is empty."]

    for i, record in enumerate(data, start=1):
        label = f"Record #{i}"

        if not isinstance(record, dict):
            errors.append(f"{label}: must be an object.")
            continue

        keys = set(record.keys())
        missing = REQUIRED_KEYS - keys
        extra = keys - REQUIRED_KEYS
        if missing:
            errors.append(f"{label}: missing keys {sorted(missing)}")
        if extra:
            errors.append(f"{label}: unexpected keys {sorted(extra)}")

        for key in REQUIRED_KEYS & keys:
            value = record[key]
            if not isinstance(value, str):
                errors.append(f"{label}: '{key}' must be a string, got {type(value).__name__}")
            elif not value.strip():
                errors.append(f"{label}: '{key}' is empty")

        date_value = record.get("date")
        if isinstance(date_value, str) and date_value.strip():
            try:
                parsed = date.fromisoformat(date_value)
                if parsed > date.today():
                    errors.append(f"{label}: date {date_value} is in the future")
            except ValueError:
                errors.append(f"{label}: date '{date_value}' is not ISO format (YYYY-MM-DD)")

    return errors


def main() -> int:
    errors = validate(DATA_FILE)
    if errors:
        print(f"FAIL - {len(errors)} problem(s) in {DATA_FILE.name}:")
        for err in errors:
            print(f"  - {err}")
        return 1

    count = len(json.loads(DATA_FILE.read_text(encoding="utf-8")))
    print(f"PASS - {count} records, all 7 keys present, all values valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
