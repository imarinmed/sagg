#!/usr/bin/env python3
"""
Create Shadow Sandbox for what-if scenario exploration.
Isolated workspace for testing narrative changes without affecting canon.
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "data"


def create_sandbox_structure() -> Dict:
    """Create the sandbox data structure."""
    return {
        "version": "1.0.0",
        "description": "Shadow Sandbox - What-if scenario workspace for SST adaptation",
        "scenarios": [],
        "templates": [
            {
                "template_id": "character_arc_variant",
                "name": "Character Arc Variant",
                "description": "Explore an alternate path for a character",
                "fields": [
                    "character_id",
                    "divergence_point",
                    "alternate_choice",
                    "consequences",
                ],
            },
            {
                "template_id": "relationship_shift",
                "name": "Relationship Shift",
                "description": "What if two characters had a different relationship?",
                "fields": [
                    "character_a",
                    "character_b",
                    "new_dynamic",
                    "ripple_effects",
                ],
            },
            {
                "template_id": "mythos_change",
                "name": "Mythos Change",
                "description": "How would a changed lore element affect the story?",
                "fields": ["mythos_element", "changed_property", "downstream_effects"],
            },
            {
                "template_id": "scene_rewrite",
                "name": "Scene Rewrite",
                "description": "Rewrite a key scene with different choices",
                "fields": ["episode_id", "scene_id", "original_outcome", "new_outcome"],
            },
        ],
        "example_scenarios": [
            {
                "scenario_id": "sandbox-example-001",
                "title": "Kiara's Darker Awakening",
                "description": "What if Kiara embraced her vampire nature immediately?",
                "template": "character_arc_variant",
                "based_on": {"episode": "s01e01", "scene": "arrival"},
                "changes": [
                    {
                        "type": "character_trait",
                        "target": "kiara_natt_och_dag",
                        "from": "reluctant",
                        "to": "embracing",
                        "magnitude": "dramatic",
                    }
                ],
                "predicted_ripples": [
                    {
                        "order": 1,
                        "effect": "Kiara seduces Alfred instead of hesitating",
                    },
                    {
                        "order": 2,
                        "effect": "Family reacts with fear rather than patience",
                    },
                    {"order": 3, "effect": "Power dynamics shift toward Kiara earlier"},
                ],
                "status": "explore",
                "created_at": "2026-02-05T10:00:00Z",
                "forked_from": None,
                "forks": [],
                "notes": "This creates a more dominant Kiara arc...",
            }
        ],
    }


def create_scenario(scenario_id: str, template: str, **kwargs) -> Dict:
    """Create a new sandbox scenario."""
    return {
        "scenario_id": scenario_id,
        "template": template,
        "status": "draft",
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z",
        "forked_from": None,
        "forks": [],
        **kwargs,
    }


def main():
    """Main function."""
    print("Creating Shadow Sandbox system...")

    sandbox = create_sandbox_structure()

    # Create output directory
    output_dir = DATA_DIR / "sandbox"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save sandbox
    output_path = output_dir / "scenarios.json"
    with open(output_path, "w") as f:
        json.dump(sandbox, f, indent=2)

    print(f"\nOutput: {output_path}")

    # Validation
    assert "scenarios" in sandbox
    assert "templates" in sandbox
    assert len(sandbox["templates"]) >= 4
    assert len(sandbox["example_scenarios"]) >= 1

    # Check example scenario structure
    example = sandbox["example_scenarios"][0]
    assert "scenario_id" in example
    assert "status" in example
    assert "changes" in example
    assert "predicted_ripples" in example

    print("✓ Validation passed")

    print(f"\n🎉 Shadow Sandbox created with:")
    print(f"  - {len(sandbox['templates'])} scenario templates")
    print(f"  - {len(sandbox['example_scenarios'])} example scenarios")
    print(f"  - Status workflow: draft → explore → rejected/canonized")


if __name__ == "__main__":
    main()
