#!/usr/bin/env python3
"""Resolve a brand or product alias against the bundled visual studies."""

import argparse
import json
import sys
import unicodedata
from pathlib import Path


def normalized(name: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKC", name).casefold() if c.isalnum())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    selection = parser.add_mutually_exclusive_group(required=True)
    selection.add_argument("brand", nargs="?", help="a brand, profile ID or product alias")
    selection.add_argument("--list", action="store_true", help="list profiles and aliases")
    args = parser.parse_args()
    catalog = Path(__file__).resolve().parent.parent / "references" / "brand-catalog.json"
    profiles = json.loads(catalog.read_text(encoding="utf-8"))
    if args.list:
        result = [{key: profile[key] for key in ("id", "name", "aliases")} for profile in profiles]
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    query = normalized(args.brand)
    matches = [
        profile for profile in profiles
        if query in {normalized(name) for name in (profile["id"], profile["name"], *profile["aliases"])}
    ]
    if len(matches) == 1:
        print(json.dumps(matches[0], ensure_ascii=False, indent=2))
        return 0
    status = "ambiguous" if matches else "unlisted"
    print(json.dumps({"status": status, "query": args.brand, "matches": [p["id"] for p in matches]}, ensure_ascii=False))
    return 1


if __name__ == "__main__":
    sys.exit(main())
