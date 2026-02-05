#!/usr/bin/env python3
"""
Unified Knowledge Extraction Pipeline for Shadow Lore Forge.
Orchestrates all extraction tasks: beats, tags, causality, claims.
"""

import subprocess
import sys
from pathlib import Path
from datetime import datetime

SCRIPTS_DIR = Path(__file__).parent


def run_script(script_name: str) -> bool:
    """Run an extraction script and return success status."""
    script_path = SCRIPTS_DIR / script_name

    print(f"\n{'=' * 60}")
    print(f"Running: {script_name}")
    print("=" * 60)

    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            check=True,
        )
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: {script_name} failed with exit code {e.returncode}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False


def validate_outputs() -> bool:
    """Validate all extraction outputs exist and are valid."""
    print("\n" + "=" * 60)
    print("Validating extraction outputs...")
    print("=" * 60)

    data_dir = Path(__file__).parent.parent / "data"

    required_files = [
        ("narratives/bst/beats.json", "Beats"),
        ("derived/signatures.json", "Tag signatures"),
        ("causality/edges.json", "Causality edges"),
        ("knowledge/claims.json", "Claims"),
    ]

    all_valid = True

    for file_path, name in required_files:
        full_path = data_dir / file_path
        if not full_path.exists():
            print(f"  ✗ {name}: MISSING ({file_path})")
            all_valid = False
        else:
            import json

            try:
                with open(full_path) as f:
                    data = json.load(f)

                # Validate minimum counts
                if "beats" in data:
                    count = len(data.get("beats", []))
                    if count >= 70:
                        print(f"  ✓ {name}: {count} items")
                    else:
                        print(f"  ✗ {name}: Only {count} items (expected >= 70)")
                        all_valid = False
                elif "edges" in data:
                    count = len(data.get("edges", []))
                    if count >= 50:
                        print(f"  ✓ {name}: {count} items")
                    else:
                        print(f"  ✗ {name}: Only {count} items (expected >= 50)")
                        all_valid = False
                elif "claims" in data:
                    count = len(data.get("claims", []))
                    if count >= 200:
                        print(f"  ✓ {name}: {count} items")
                    else:
                        print(f"  ✗ {name}: Only {count} items (expected >= 200)")
                        all_valid = False
                else:
                    print(f"  ✓ {name}: File exists")

            except json.JSONDecodeError as e:
                print(f"  ✗ {name}: Invalid JSON - {e}")
                all_valid = False

    return all_valid


def main():
    """Main pipeline execution."""
    start_time = datetime.now()

    print("=" * 60)
    print("SHADOW LORE FORGE - Knowledge Extraction Pipeline")
    print("=" * 60)
    print(f"Started: {start_time}")

    # Define extraction steps
    steps = [
        ("extract_beats.py", "Extracting BST beats from video analysis"),
        ("extract_tag_signatures.py", "Extracting tag signatures"),
        ("create_causality_edges.py", "Creating causality edges"),
        ("extract_claims.py", "Extracting claims database"),
    ]

    # Run each extraction step
    results = []
    for script, description in steps:
        print(f"\n\nStep {len(results) + 1}: {description}")
        success = run_script(script)
        results.append((script, success))

        if not success:
            print(f"\n⚠ Pipeline failed at {script}")
            break

    # Validate outputs
    validation_passed = validate_outputs()

    # Summary
    end_time = datetime.now()
    duration = end_time - start_time

    print("\n" + "=" * 60)
    print("PIPELINE SUMMARY")
    print("=" * 60)
    print(f"Started: {start_time}")
    print(f"Finished: {end_time}")
    print(f"Duration: {duration}")
    print()

    for script, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"  {status}: {script}")

    print()
    if validation_passed:
        print("✓ All validations passed")
        print("\n🎉 Pipeline completed successfully!")
        return 0
    else:
        print("✗ Some validations failed")
        print("\n⚠ Pipeline completed with errors")
        return 1


if __name__ == "__main__":
    sys.exit(main())
