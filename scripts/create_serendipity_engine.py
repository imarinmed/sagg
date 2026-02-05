#!/usr/bin/env python3
"""
Create Serendipity Engine for Shadow Lore Forge.
Discovers unexpected connections between narrative elements.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Set
from collections import defaultdict
import random

DATA_DIR = Path(__file__).parent.parent / "data"


def load_inspiration_graph() -> Dict:
    """Load inspiration graph."""
    with open(DATA_DIR / "creative" / "inspiration_graph.json") as f:
        return json.load(f)


def load_narrative_dna() -> Dict:
    """Load narrative DNA."""
    with open(DATA_DIR / "derived" / "narrative_dna.json") as f:
        return json.load(f)


def load_mutation_cards() -> List[Dict]:
    """Load mutation cards."""
    with open(DATA_DIR / "creative" / "mutation_cards.json") as f:
        return json.load(f)["cards"]


def calculate_shared_keywords(node1: Dict, node2: Dict) -> List[str]:
    """Calculate shared activation keywords between nodes."""
    keys1 = set(node1.get("activation_keys", []))
    keys2 = set(node2.get("activation_keys", []))
    return list(keys1 & keys2)


def calculate_surprise_factor(node1: Dict, node2: Dict, all_links: List[Dict]) -> float:
    """Calculate how surprising a connection would be."""
    # Direct links are less surprising
    existing_link = any(
        (l["from_node"] == node1["node_id"] and l["to_node"] == node2["node_id"])
        or (l["from_node"] == node2["node_id"] and l["to_node"] == node1["node_id"])
        for l in all_links
    )

    if existing_link:
        return 0.1  # Already linked, low surprise

    # Shared keywords increase surprise moderately
    shared = calculate_shared_keywords(node1, node2)
    if len(shared) >= 2:
        return 0.6 + (len(shared) * 0.05)  # More shared = more surprising
    elif len(shared) == 1:
        return 0.4

    # No shared keywords but same type
    if node1.get("type") == node2.get("type"):
        return 0.3

    # Completely different types with no shared keywords
    return 0.7  # High surprise


def find_serendipitous_connections(
    nodes: List[Dict], all_links: List[Dict], count: int = 50
) -> List[Dict]:
    """Find unexpected connections between nodes."""
    suggestions = []

    # Generate potential connections
    potential = []
    for i, node1 in enumerate(nodes):
        for node2 in nodes[i + 1 :]:
            surprise = calculate_surprise_factor(node1, node2, all_links)

            # Only consider if surprising enough
            if surprise >= 0.4:
                shared = calculate_shared_keywords(node1, node2)

                potential.append(
                    {
                        "from_node": node1,
                        "to_node": node2,
                        "surprise": surprise,
                        "shared_keywords": shared,
                    }
                )

    # Sort by surprise factor
    potential.sort(key=lambda x: x["surprise"], reverse=True)

    # Take top suggestions
    for i, conn in enumerate(potential[:count], 1):
        from_node = conn["from_node"]
        to_node = conn["to_node"]

        # Determine connection type
        if conn["shared_keywords"]:
            conn_type = "semantic_similarity"
            reason = f"Both relate to: {', '.join(conn['shared_keywords'][:3])}"
        elif from_node.get("type") == to_node.get("type"):
            conn_type = "thematic_resonance"
            reason = (
                f"Both are {from_node.get('type')} elements with complementary themes"
            )
        else:
            conn_type = "unexpected_juxtaposition"
            reason = f"Unexpected connection between {from_node.get('type')} and {to_node.get('type')}"

        suggestion = {
            "suggestion_id": f"serendip-{i:03d}",
            "from_entity": from_node.get("title", "Unknown"),
            "from_node_id": from_node["node_id"],
            "to_entity": to_node.get("title", "Unknown"),
            "to_node_id": to_node["node_id"],
            "type": conn_type,
            "reason": reason,
            "surprise_factor": round(conn["surprise"], 2),
            "is_surprising": conn["surprise"] >= 0.5,
            "explanation": generate_explanation(from_node, to_node, conn_type),
            "discovery_path": [from_node["node_id"], to_node["node_id"]],
        }
        suggestions.append(suggestion)

    return suggestions


def generate_explanation(node1: Dict, node2: Dict, conn_type: str) -> str:
    """Generate human-readable explanation of connection."""
    title1 = node1.get("title", "Element 1")
    title2 = node2.get("title", "Element 2")

    explanations = {
        "semantic_similarity": f"Exploring {title1} naturally leads to discoveries about {title2} through shared thematic elements.",
        "thematic_resonance": f"{title1} and {title2} echo each other across the narrative, creating depth through parallel exploration.",
        "unexpected_juxtaposition": f"The contrast between {title1} and {title2} reveals hidden dimensions of both elements.",
    }

    return explanations.get(
        conn_type, f"{title1} connects to {title2} in surprising ways."
    )


def generate_mutation_suggestions(
    mutation_cards: List[Dict], count: int = 20
) -> List[Dict]:
    """Generate serendipitous mutation combinations."""
    suggestions = []

    # Find cards that could combine interestingly
    for i in range(min(count, len(mutation_cards))):
        card1 = random.choice(mutation_cards)
        card2 = random.choice(mutation_cards)

        if card1["card_id"] != card2["card_id"]:
            suggestion = {
                "suggestion_id": f"serendip-mut-{i + 1:03d}",
                "from_entity": card1["title"],
                "to_entity": card2["title"],
                "type": "combinatorial_mutation",
                "reason": f"Combining '{card1['title']}' with '{card2['title']}' creates new possibilities",
                "surprise_factor": round(random.uniform(0.5, 0.9), 2),
                "is_surprising": True,
                "explanation": f"What if {card1['hook'][:50]}... AND {card2['hook'][:50]}...?",
                "discovery_path": [card1["card_id"], card2["card_id"]],
            }
            suggestions.append(suggestion)

    return suggestions


def main():
    """Main function."""
    print("Creating Serendipity Engine for Shadow Lore Forge...")

    # Load data
    inspiration = load_inspiration_graph()
    dna = load_narrative_dna()
    mutations = load_mutation_cards()

    nodes = inspiration.get("nodes", [])
    links = inspiration.get("links", [])

    print(f"Loaded {len(nodes)} inspiration nodes")
    print(f"Loaded {len(links)} existing links")
    print(f"Loaded {len(mutations)} mutation cards")

    # Find serendipitous connections
    print("\nFinding unexpected connections...")
    node_suggestions = find_serendipitous_connections(nodes, links, 50)
    print(f"  Found {len(node_suggestions)} node connections")

    # Generate mutation combinations
    print("Generating mutation combinations...")
    mutation_suggestions = generate_mutation_suggestions(mutations, 20)
    print(f"  Created {len(mutation_suggestions)} mutation combos")

    # Combine all suggestions
    all_suggestions = node_suggestions + mutation_suggestions

    # Sort by surprise factor
    all_suggestions.sort(key=lambda x: x["surprise_factor"], reverse=True)

    print(f"\nTotal suggestions: {len(all_suggestions)}")

    # Create output
    output_dir = DATA_DIR / "derived"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / "serendipity_index.json"
    with open(output_path, "w") as f:
        json.dump(
            {
                "version": "1.0.0",
                "total_suggestions": len(all_suggestions),
                "suggestions_by_type": {
                    "semantic_similarity": len(
                        [
                            s
                            for s in all_suggestions
                            if s["type"] == "semantic_similarity"
                        ]
                    ),
                    "thematic_resonance": len(
                        [
                            s
                            for s in all_suggestions
                            if s["type"] == "thematic_resonance"
                        ]
                    ),
                    "unexpected_juxtaposition": len(
                        [
                            s
                            for s in all_suggestions
                            if s["type"] == "unexpected_juxtaposition"
                        ]
                    ),
                    "combinatorial_mutation": len(
                        [
                            s
                            for s in all_suggestions
                            if s["type"] == "combinatorial_mutation"
                        ]
                    ),
                },
                "suggestions": all_suggestions,
            },
            f,
            indent=2,
        )

    print(f"\nOutput: {output_path}")

    # Validation
    assert len(all_suggestions) >= 30, (
        f"Expected at least 30 suggestions, got {len(all_suggestions)}"
    )

    # Check average surprise
    avg_surprise = sum(s["surprise_factor"] for s in all_suggestions) / len(
        all_suggestions
    )
    assert avg_surprise >= 0.4, f"Expected avg surprise >= 0.4, got {avg_surprise}"

    print(
        f"✓ Validation passed: {len(all_suggestions)} suggestions, avg surprise {avg_surprise:.2f}"
    )

    # Show samples
    print("\nTop surprising suggestions:")
    for sug in all_suggestions[:3]:
        print(f"  {sug['suggestion_id']}: {sug['from_entity']} ↔ {sug['to_entity']}")
        print(f"    Surprise: {sug['surprise_factor']} | Type: {sug['type']}")
        print(f"    {sug['explanation'][:70]}...")


if __name__ == "__main__":
    main()
