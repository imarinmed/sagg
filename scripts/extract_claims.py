#!/usr/bin/env python3
"""
Extract atomic claims from transcripts and video analysis.
Creates a knowledge base of facts, rules, and events with evidence.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional

DATA_DIR = Path(__file__).parent.parent / "data"


def load_video_analysis() -> Dict:
    """Load video analysis data."""
    with open(DATA_DIR / "video_analysis" / "video_analysis_v2.json") as f:
        return json.load(f)


def load_mythos() -> List[Dict]:
    """Load mythos elements."""
    import yaml

    mythos = []
    mythos_dir = DATA_DIR / "mythos"
    for yaml_file in mythos_dir.glob("*.yaml"):
        with open(yaml_file) as f:
            mythos.append(yaml.safe_load(f))
    return mythos


def load_characters() -> List[Dict]:
    """Load character data."""
    import yaml

    chars = []
    chars_dir = DATA_DIR / "characters"
    for yaml_file in chars_dir.glob("*.yaml"):
        with open(yaml_file) as f:
            chars.append(yaml.safe_load(f))
    return chars


def extract_mythos_claims(mythos_elements: List[Dict]) -> List[Dict]:
    """Extract claims from mythos elements."""
    claims = []
    claim_id = 1

    for element in mythos_elements:
        element_id = element.get("id", "unknown")

        # Extract rules from canonical description
        canonical = element.get("canonical", {})
        description = canonical.get("description", "")

        if description:
            claims.append(
                {
                    "claim_id": f"claim-{claim_id:04d}",
                    "type": "rule",
                    "subject": element_id,
                    "predicate": "is_defined_as",
                    "object": description[:200],
                    "canon_layer": "bst",
                    "confidence": 0.95,
                    "evidence": [
                        {
                            "source_type": "mythos",
                            "source_id": element_id,
                            "quote": description[:100],
                        }
                    ],
                    "derived_from": [],
                }
            )
            claim_id += 1

        # Extract abilities as claims
        for ability in canonical.get("abilities", []):
            claims.append(
                {
                    "claim_id": f"claim-{claim_id:04d}",
                    "type": "fact",
                    "subject": element_id,
                    "predicate": "grants_ability",
                    "object": ability,
                    "canon_layer": "bst",
                    "confidence": 0.9,
                    "evidence": [{"source_type": "mythos", "source_id": element_id}],
                    "derived_from": [],
                }
            )
            claim_id += 1

        # Extract weaknesses as claims
        for weakness in canonical.get("weaknesses", []):
            claims.append(
                {
                    "claim_id": f"claim-{claim_id:04d}",
                    "type": "fact",
                    "subject": element_id,
                    "predicate": "has_weakness",
                    "object": weakness,
                    "canon_layer": "bst",
                    "confidence": 0.9,
                    "evidence": [{"source_type": "mythos", "source_id": element_id}],
                    "derived_from": [],
                }
            )
            claim_id += 1

    return claims


def extract_character_claims(characters: List[Dict]) -> List[Dict]:
    """Extract claims from character data."""
    claims = []
    claim_id = 200  # Offset from mythos claims

    for char in characters:
        char_id = char.get("id", "unknown")
        canonical = char.get("canonical", {})

        # Character traits
        for trait in canonical.get("traits", []):
            claims.append(
                {
                    "claim_id": f"claim-{claim_id:04d}",
                    "type": "fact",
                    "subject": char_id,
                    "predicate": "has_trait",
                    "object": trait,
                    "canon_layer": "bst",
                    "confidence": 0.9,
                    "evidence": [{"source_type": "character", "source_id": char_id}],
                    "derived_from": [],
                }
            )
            claim_id += 1

        # Character arc
        arc = canonical.get("arc", "")
        if arc:
            claims.append(
                {
                    "claim_id": f"claim-{claim_id:04d}",
                    "type": "fact",
                    "subject": char_id,
                    "predicate": "has_arc",
                    "object": arc,
                    "canon_layer": "bst",
                    "confidence": 0.85,
                    "evidence": [{"source_type": "character", "source_id": char_id}],
                    "derived_from": [],
                }
            )
            claim_id += 1

    return claims


def extract_video_claims(video_data: Dict) -> List[Dict]:
    """Extract claims from video analysis moments."""
    claims = []
    claim_id = 400  # Offset from character claims

    # Track unique claims to avoid duplicates
    seen_claims = set()

    for episode in video_data.get("episodes", []):
        ep_id = episode["episode_id"]

        for moment in episode.get("key_moments", []):
            content_type = moment.get("content_type", "")
            description = moment.get("description", "")

            # Skip dialogue-only moments without lore significance
            if content_type == "dialogue" and not any(
                kw in description.lower()
                for kw in [
                    "vampire",
                    "blood",
                    "trigger",
                    "feeding",
                    "fangs",
                    "immortal",
                ]
            ):
                continue

            # Create claim key for deduplication
            claim_key = (content_type, description[:50])
            if claim_key in seen_claims:
                continue
            seen_claims.add(claim_key)

            # Map content types to claim types
            if content_type in ["vampire_lore", "vampire_feeding"]:
                claim_type = "rule"
                predicate = "establishes"
            elif content_type in ["hierarchy", "power_play"]:
                claim_type = "relationship"
                predicate = "demonstrates"
            else:
                claim_type = "event"
                predicate = "depicts"

            claims.append(
                {
                    "claim_id": f"claim-{claim_id:04d}",
                    "type": claim_type,
                    "subject": ep_id,
                    "predicate": predicate,
                    "object": description[:150],
                    "canon_layer": "bst",
                    "confidence": 0.8,
                    "evidence": [
                        {
                            "source_type": "episode",
                            "source_id": ep_id,
                            "timestamp": moment.get("timestamp"),
                            "moment_id": f"m-{claim_id:04d}",
                            "quote": description[:100],
                            "screenshot_path": moment.get("screenshot_path"),
                        }
                    ],
                    "derived_from": [],
                }
            )
            claim_id += 1

            # Stop at 200 claims from video
            if claim_id >= 600:
                break

        if claim_id >= 600:
            break

    return claims


def main():
    """Main extraction function."""
    print("Extracting claims from narrative sources...")

    # Load data
    mythos = load_mythos()
    characters = load_characters()
    video_data = load_video_analysis()

    print(f"Loaded {len(mythos)} mythos elements")
    print(f"Loaded {len(characters)} characters")

    # Extract claims
    print("Extracting mythos claims...")
    mythos_claims = extract_mythos_claims(mythos)
    print(f"  Created {len(mythos_claims)} claims")

    print("Extracting character claims...")
    char_claims = extract_character_claims(characters)
    print(f"  Created {len(char_claims)} claims")

    print("Extracting video claims...")
    video_claims = extract_video_claims(video_data)
    print(f"  Created {len(video_claims)} claims")

    # Combine all claims
    all_claims = mythos_claims + char_claims + video_claims

    print(f"\nTotal claims: {len(all_claims)}")

    # Create output directory
    output_dir = DATA_DIR / "knowledge"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save claims
    output_path = output_dir / "claims.json"
    with open(output_path, "w") as f:
        json.dump(
            {
                "version": "1.0.0",
                "total_claims": len(all_claims),
                "claims_by_type": {
                    "rule": len([c for c in all_claims if c["type"] == "rule"]),
                    "fact": len([c for c in all_claims if c["type"] == "fact"]),
                    "relationship": len(
                        [c for c in all_claims if c["type"] == "relationship"]
                    ),
                    "event": len([c for c in all_claims if c["type"] == "event"]),
                },
                "claims": all_claims,
            },
            f,
            indent=2,
        )

    print(f"\nOutput: {output_path}")

    # Validation
    assert len(all_claims) >= 200, (
        f"Expected at least 200 claims, got {len(all_claims)}"
    )

    # Check all claims have required fields
    for claim in all_claims:
        assert "claim_id" in claim
        assert "type" in claim
        assert "subject" in claim
        assert "predicate" in claim
        assert "object" in claim
        assert "evidence" in claim
        assert len(claim["evidence"]) > 0

    print("✓ Validation passed: >= 200 claims, all required fields present")

    # Show sample
    print("\nSample claims:")
    for claim in all_claims[:3]:
        print(
            f"  {claim['claim_id']}: {claim['subject']} {claim['predicate']} {claim['object'][:50]}..."
        )


if __name__ == "__main__":
    main()
