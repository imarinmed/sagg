#!/usr/bin/env python3
"""
Load relationships into the data system.

This script verifies relationships are properly loaded from:
1. Character YAML files (canonical relationships)
2. Extracted relationships from character_relationships.json

Note: The actual loading happens in backend/src/data.py at module init.
This script serves as a verification and reporting tool.
"""

import sys
from pathlib import Path

backend_src = Path(__file__).parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_src.parent))


def main():
    from src.data import relationships_db, characters_db
    from collections import Counter

    print(f"Total relationships loaded: {len(relationships_db)}")
    print(f"Total characters: {len(characters_db)}")

    types = Counter(r.relationship_type for r in relationships_db.values())
    print("\nRelationship types:")
    for rel_type, count in types.most_common():
        print(f"  {rel_type}: {count}")

    print("\nRelationships per character:")
    char_counts = Counter()
    for rel in relationships_db.values():
        char_counts[rel.from_character_id] += 1
        char_counts[rel.to_character_id] += 1

    for char_id, count in char_counts.most_common(10):
        print(f"  {char_id}: {count}")

    kiara_alfred = [
        r
        for r in relationships_db.values()
        if (
            "kiara" in r.from_character_id.lower()
            or "kiara" in r.to_character_id.lower()
        )
        and (
            "alfred" in r.from_character_id.lower()
            or "alfred" in r.to_character_id.lower()
        )
    ]

    print(f"\nKiara-Alfred relationships: {len(kiara_alfred)}")
    for r in kiara_alfred:
        print(f"  {r.id}: {r.relationship_type} - {r.description}")

    if len(relationships_db) >= 50 and kiara_alfred:
        print("\n✓ QA PASSED: >50 relationships and Kiara-Alfred exists")
        return 0
    else:
        print("\n✗ QA FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
