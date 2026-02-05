#!/usr/bin/env python3
"""
Extend mythos YAML files with dual-narrative versions structure.
Transforms canonical/adaptation_expansion to versions: { bst, sst }
"""

import yaml
from pathlib import Path
from typing import Dict, Any

DATA_DIR = Path(__file__).parent.parent / "data"
MYTHOS_DIR = DATA_DIR / "mythos"


def transform_mythos_element(data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform old structure to new versions structure."""
    new_data = {
        "id": data.get("id"),
        "name": data.get("name"),
        "category": data.get("category"),
        "short_description": data.get("short_description"),
        "related_characters": data.get("related_characters", []),
        "media_urls": data.get("media_urls", []),
    }

    # Transform canonical to versions.bst
    canonical = data.get("canonical", {})
    bst_version = {
        "description": canonical.get("description", "").strip(),
        "traits": canonical.get("traits", []),
        "abilities": canonical.get("abilities", []),
        "weaknesses": canonical.get("weaknesses", []),
        "significance": canonical.get("significance", ""),
        "source_episodes": canonical.get("source_episodes", []),
    }

    # Transform adaptation_expansion to versions.sst
    adaptation = data.get("adaptation_expansion", {})
    sst_version = {
        "description": adaptation.get("dark_variant", "").strip()
        if adaptation.get("dark_variant")
        else None,
        "traits": adaptation.get("horror_elements", [])
        if adaptation.get("horror_elements")
        else [],
        "abilities": [],  # To be filled later
        "weaknesses": [],  # To be filled later
        "significance": adaptation.get("taboo_potential", "").strip()
        if adaptation.get("taboo_potential")
        else None,
        "source_episodes": [],  # To be filled later
        "mechanics": adaptation.get("mechanics", "").strip()
        if adaptation.get("mechanics")
        else None,
        "erotic_implications": adaptation.get("erotic_implications", "").strip()
        if adaptation.get("erotic_implications")
        else None,
    }

    # Remove null values from SST for cleaner YAML
    sst_version = {k: v for k, v in sst_version.items() if v is not None and v != []}

    new_data["versions"] = {
        "bst": bst_version,
        "sst": sst_version if sst_version else None,
    }

    # Add divergences list (empty for now, to be populated)
    new_data["divergences"] = []

    # Keep old fields for backward compatibility (will be deprecated)
    new_data["_deprecated_canonical"] = canonical if canonical else None
    new_data["_deprecated_adaptation"] = adaptation if adaptation else None

    return new_data


def process_mythos_files():
    """Process all mythos YAML files."""
    print("Extending mythos YAML files with versions structure...")

    yaml_files = list(MYTHOS_DIR.glob("*.yaml"))
    print(f"Found {len(yaml_files)} mythos files")

    for yaml_file in yaml_files:
        print(f"\nProcessing {yaml_file.name}...")

        # Load existing data
        with open(yaml_file) as f:
            data = yaml.safe_load(f)

        if not data:
            print(f"  Warning: Empty file {yaml_file.name}")
            continue

        # Transform to new structure
        new_data = transform_mythos_element(data)

        # Write back
        with open(yaml_file, "w") as f:
            yaml.dump(
                new_data,
                f,
                default_flow_style=False,
                allow_unicode=True,
                sort_keys=False,
            )

        print(f"  ✓ Updated {yaml_file.name}")

    print(f"\n✓ All {len(yaml_files)} mythos files updated")
    return len(yaml_files)


def validate_structure():
    """Validate the new structure."""
    print("\nValidating new structure...")

    all_valid = True
    for yaml_file in MYTHOS_DIR.glob("*.yaml"):
        with open(yaml_file) as f:
            data = yaml.safe_load(f)

        # Check required fields
        if "versions" not in data:
            print(f"  ✗ {yaml_file.name}: Missing 'versions' field")
            all_valid = False
        elif "bst" not in data.get("versions", {}):
            print(f"  ✗ {yaml_file.name}: Missing versions.bst")
            all_valid = False
        elif "sst" not in data.get("versions", {}):
            print(f"  ✗ {yaml_file.name}: Missing versions.sst")
            all_valid = False
        else:
            print(f"  ✓ {yaml_file.name}: Valid structure")

    return all_valid


def main():
    """Main function."""
    count = process_mythos_files()

    if validate_structure():
        print("\n✓ All validations passed")
        print(
            f"\n🎉 Successfully extended {count} mythos files with versions structure"
        )
        return 0
    else:
        print("\n✗ Some validations failed")
        return 1


if __name__ == "__main__":
    exit(main())
