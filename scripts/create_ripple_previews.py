#!/usr/bin/env python3
"""
Create Ripple Preview Engine for Shadow Lore Forge.
Shows downstream effects of mutations on narrative elements.
"""

import json
from pathlib import Path
from typing import Dict, List, Any

DATA_DIR = Path(__file__).parent.parent / "data"


def load_mutation_cards() -> List[Dict]:
    """Load mutation cards."""
    with open(DATA_DIR / "creative" / "mutation_cards.json") as f:
        return json.load(f)["cards"]


def load_causality_edges() -> List[Dict]:
    """Load causality edges."""
    with open(DATA_DIR / "causality" / "edges.json") as f:
        return json.load(f)["edges"]


def load_beats() -> List[Dict]:
    """Load beats."""
    with open(DATA_DIR / "narratives" / "bst" / "beats.json") as f:
        return json.load(f)["beats"]


def find_affected_beats(source_element: str, beats: List[Dict]) -> List[Dict]:
    """Find beats related to a source element."""
    affected = []
    for beat in beats:
        # Check if beat mentions the element in characters or content
        characters = beat.get("characters", [])
        content_types = beat.get("content_types", [])

        # Simple matching - in real implementation would be more sophisticated
        if any(source_element in char for char in characters):
            affected.append(beat)
        elif source_element.replace("_", "") in " ".join(content_types).lower():
            affected.append(beat)

    return affected[:5]  # Top 5 affected beats


def calculate_ripple_effects(
    card: Dict, edges: List[Dict], beats: List[Dict]
) -> List[Dict]:
    """Calculate ripple effects for a mutation card."""
    ripples = []
    source = card.get("source_element", "")

    # Find beats directly related to this element
    affected_beats = find_affected_beats(source, beats)

    # Order 1: Direct effects on related beats
    for i, beat in enumerate(affected_beats[:3], 1):
        ripple = {
            "order": 1,
            "type": "beat_impact",
            "target": beat["beat_id"],
            "target_type": "beat",
            "effect": f"Beat '{beat['summary'][:50]}...' takes on darker tone",
            "magnitude": "significant" if i == 1 else "moderate",
        }
        ripples.append(ripple)

    # Order 2: Character arc impacts
    if "character" in source:
        char_name = source.replace("_", " ").title()
        ripples.append(
            {
                "order": 2,
                "type": "character_arc",
                "target": source,
                "target_type": "character",
                "effect": f"{char_name}'s development shifts toward darker themes",
                "magnitude": "significant",
            }
        )

    # Order 2: Relationship impacts
    if card.get("mutation_type") in ["intensify", "transform"]:
        ripples.append(
            {
                "order": 2,
                "type": "relationship_web",
                "target": f"{source}_relationships",
                "target_type": "relationship",
                "effect": f"Relationships involving {source} become more intense/complicated",
                "magnitude": "moderate",
            }
        )

    # Order 3: Thematic impacts
    taboo = card.get("taboo_potential", [])
    if taboo:
        ripples.append(
            {
                "order": 3,
                "type": "mythos_evolution",
                "target": "series_themes",
                "target_type": "theme",
                "effect": f"Series themes expand to include: {', '.join(taboo[:3])}",
                "magnitude": "significant" if len(taboo) > 2 else "moderate",
            }
        )

    # Order 3: Atmosphere shift
    intensity = card.get("intensity_increase", 0)
    if intensity >= 3:
        ripples.append(
            {
                "order": 3,
                "type": "atmosphere_shift",
                "target": "series_tone",
                "target_type": "atmosphere",
                "effect": f"Overall series atmosphere becomes more intense (level {intensity})",
                "magnitude": "significant" if intensity >= 4 else "moderate",
            }
        )

    return ripples[:5]  # Top 5 ripples


def create_ripple_previews(
    cards: List[Dict], edges: List[Dict], beats: List[Dict]
) -> List[Dict]:
    """Create ripple preview for each mutation card."""
    previews = []

    for card in cards:
        ripples = calculate_ripple_effects(card, edges, beats)

        preview = {
            "ripple_id": f"ripple-{card['card_id']}",
            "source_card": card["card_id"],
            "source_title": card["title"],
            "change_summary": card["hook"],
            "ripples": ripples,
        }
        previews.append(preview)

    return previews


def main():
    """Main function."""
    print("Creating Ripple Previews for mutation cards...")

    # Load data
    cards = load_mutation_cards()
    edges = load_causality_edges()
    beats = load_beats()

    print(f"Loaded {len(cards)} mutation cards")
    print(f"Loaded {len(edges)} causality edges")
    print(f"Loaded {len(beats)} beats")

    # Create ripple previews
    previews = create_ripple_previews(cards, edges, beats)

    print(f"\nCreated {len(previews)} ripple previews")

    # Create output directory
    output_dir = DATA_DIR / "creative"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save previews
    output_path = output_dir / "ripple_previews.json"
    with open(output_path, "w") as f:
        json.dump(
            {"version": "1.0.0", "total_previews": len(previews), "previews": previews},
            f,
            indent=2,
        )

    print(f"\nOutput: {output_path}")

    # Validation
    assert len(previews) == len(cards), "Preview count should match card count"

    # Check each preview has ripples
    total_ripples = sum(len(p["ripples"]) for p in previews)
    avg_ripples = total_ripples / len(previews) if previews else 0
    print(f"Average ripples per card: {avg_ripples:.1f}")

    assert avg_ripples >= 3, f"Expected avg 3+ ripples, got {avg_ripples}"

    print("✓ Validation passed")

    # Show sample
    print("\nSample ripple preview:")
    sample = previews[0]
    print(f"  {sample['source_title']}")
    print(f"  Change: {sample['change_summary'][:60]}...")
    print(f"  Ripples ({len(sample['ripples'])}):")
    for ripple in sample["ripples"][:3]:
        print(
            f"    Order {ripple['order']}: {ripple['type']} -> {ripple['effect'][:50]}..."
        )


if __name__ == "__main__":
    main()
