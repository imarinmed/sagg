#!/usr/bin/env python3
"""
Extend character YAML files with dual-narrative versions structure.
Transforms canonical/adaptation to versions: { bst, sst }
"""

import yaml
from pathlib import Path
from typing import Dict, Any

DATA_DIR = Path(__file__).parent.parent / "data"
CHARACTERS_DIR = DATA_DIR / "characters"


def transform_character(data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform old character structure to new versions structure."""
    new_data = {
        "id": data.get("id"),
        "name": data.get("name"),
        "portrayed_by": data.get("portrayed_by"),
    }

    # Transform canonical to versions.bst
    canonical = data.get("canonical", {})
    bst_version = {
        "age": canonical.get("age"),
        "species": canonical.get("species"),
        "family": canonical.get("family"),
        "traits": canonical.get("traits", []),
        "arc": canonical.get("arc", ""),
        "relationships": canonical.get("relationships", []),
    }

    # Remove null values
    bst_version = {k: v for k, v in bst_version.items() if v is not None}

    # Transform adaptation to versions.sst
    adaptation = data.get("adaptation", {})
    sst_version = {
        "age": adaptation.get("age"),
        "traits": adaptation.get("traits_added", []),
        "arc": adaptation.get("arc_dark", ""),
        "taboo_elements": adaptation.get("taboo_elements", []),
        "explicit_scenes": adaptation.get("explicit_scenes", []),
    }

    # Remove empty values
    sst_version = {k: v for k, v in sst_version.items() if v and v != []}

    new_data["versions"] = {
        "bst": bst_version,
        "sst": sst_version if sst_version else None,
    }

    # Add kink_profile if exists
    if "kink_profile" in data:
        new_data["kink_profile"] = data["kink_profile"]

    # Add divergences
    new_data["divergences"] = []

    # Keep deprecated fields
    if canonical:
        new_data["_deprecated_canonical"] = canonical
    if adaptation:
        new_data["_deprecated_adaptation"] = adaptation

    return new_data


def process_character_files():
    """Process all character YAML files."""
    print("Extending character YAML files with versions structure...")

    yaml_files = list(CHARACTERS_DIR.glob("*.yaml"))
    print(f"Found {len(yaml_files)} character files")

    for yaml_file in yaml_files:
        print(f"\nProcessing {yaml_file.name}...")

        with open(yaml_file) as f:
            data = yaml.safe_load(f)

        if not data:
            print(f"  Warning: Empty file {yaml_file.name}")
            continue

        new_data = transform_character(data)

        with open(yaml_file, "w") as f:
            yaml.dump(
                new_data,
                f,
                default_flow_style=False,
                allow_unicode=True,
                sort_keys=False,
            )

        print(f"  ✓ Updated {yaml_file.name}")

    print(f"\n✓ All {len(yaml_files)} character files updated")
    return len(yaml_files)


def validate_structure():
    """Validate the new structure."""
    print("\nValidating character structure...")

    all_valid = True
    for yaml_file in CHARACTERS_DIR.glob("*.yaml"):
        with open(yaml_file) as f:
            data = yaml.safe_load(f)

        if "versions" not in data:
            print(f"  ✗ {yaml_file.name}: Missing 'versions'")
            all_valid = False
        elif "bst" not in data.get("versions", {}):
            print(f"  ✗ {yaml_file.name}: Missing versions.bst")
            all_valid = False
        else:
            print(f"  ✓ {yaml_file.name}: Valid")

    return all_valid


def main():
    """Main function."""
    count = process_character_files()

    if validate_structure():
        print("\n✓ All validations passed")
        print(f"\n🎉 Successfully extended {count} character files")
        return 0
    else:
        print("\n✗ Some validations failed")
        return 1


if __name__ == "__main__":
    exit(main())
