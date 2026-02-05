#!/usr/bin/env python3
"""
Generate Mutation Cards for SST adaptation.
Creates creative prompts that transform BST elements into darker SST versions.
"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Any

DATA_DIR = Path(__file__).parent.parent / "data"


def load_mythos() -> List[Dict]:
    """Load mythos elements."""
    mythos = []
    for yaml_file in (DATA_DIR / "mythos").glob("*.yaml"):
        with open(yaml_file) as f:
            mythos.append(yaml.safe_load(f))
    return mythos


def load_characters() -> List[Dict]:
    """Load characters."""
    chars = []
    for yaml_file in (DATA_DIR / "characters").glob("*.yaml"):
        with open(yaml_file) as f:
            chars.append(yaml.safe_load(f))
    return chars


def load_tag_library() -> Dict:
    """Load tag library."""
    with open(DATA_DIR / "tags" / "library.json") as f:
        return json.load(f)


def generate_mythos_mutations(mythos: Dict, tag_library: Dict) -> List[Dict]:
    """Generate mutation cards for a mythos element."""
    mutations = []
    element_id = mythos.get("id", "unknown")
    element_name = mythos.get("name", "Unknown")

    versions = mythos.get("versions", {})
    bst = versions.get("bst", {})
    sst = versions.get("sst") or {}

    # Get existing tags
    bst_traits = bst.get("traits", [])

    # Mutation 1: Intensify
    mutations.append(
        {
            "card_id": f"mut-{element_id}-001",
            "title": f"The Darker {element_name}",
            "hook": f"What if {element_name.lower()} became more explicitly predatory and dangerous?",
            "source_element": element_id,
            "mutation_type": "intensify",
            "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
            "constraints": [
                "Must maintain vampire lore consistency",
                "Must escalate existing traits, not contradict them",
            ],
            "possibilities": [
                f"The {element_name.lower()} becomes a source of addiction rather than just sustenance",
                f"Characters lose control when using {element_name.lower()}",
                f"The {element_name.lower()} creates permanent bonds that cannot be broken",
            ],
            "intensity_increase": 3,
            "taboo_potential": ["loss_of_control", "addiction", "irreversible_changes"],
        }
    )

    # Mutation 2: Complicate
    mutations.append(
        {
            "card_id": f"mut-{element_id}-002",
            "title": f"The Complicated {element_name}",
            "hook": f"What if {element_name.lower()} had darker implications that characters must navigate?",
            "source_element": element_id,
            "mutation_type": "complicate",
            "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
            "constraints": [
                "Must add moral ambiguity",
                "Must create difficult choices",
            ],
            "possibilities": [
                f"Using {element_name.lower()} requires sacrificing something personal",
                f"The {element_name.lower()} benefits some while harming others",
                f"Characters must choose between using {element_name.lower()} and maintaining ethics",
            ],
            "intensity_increase": 2,
            "taboo_potential": ["moral_ambiguity", "sacrifice", "ethical_dilemmas"],
        }
    )

    # Mutation 3: Expose
    if sst.get("erotic_implications") or sst.get("taboo_elements"):
        mutations.append(
            {
                "card_id": f"mut-{element_id}-003",
                "title": f"The Explicit {element_name}",
                "hook": f"What if the sensual/erotic aspects of {element_name.lower()} were made explicit?",
                "source_element": element_id,
                "mutation_type": "expose",
                "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
                "constraints": [
                    "Must respect consent framework",
                    "Must serve character development",
                ],
                "possibilities": [
                    f"The {element_name.lower()} becomes intertwined with sexual awakening",
                    f"Characters discover {element_name.lower()} through intimate encounters",
                    f"Power dynamics in {element_name.lower()} become explicitly sexual",
                ],
                "intensity_increase": 4,
                "taboo_potential": [
                    "sexual_awakening",
                    "power_dynamics",
                    "forbidden_desire",
                ],
            }
        )

    # Mutation 4: Transform
    mutations.append(
        {
            "card_id": f"mut-{element_id}-004",
            "title": f"The Transformed {element_name}",
            "hook": f"What if {element_name.lower()} became its opposite - a source of corruption rather than benefit?",
            "source_element": element_id,
            "mutation_type": "transform",
            "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
            "constraints": [
                "Must invert the core concept",
                "Must create dramatic irony",
            ],
            "possibilities": [
                f"What was protective about {element_name.lower()} becomes suffocating",
                f"The {element_name.lower()} that gave power now takes it away",
                f"Characters must reject {element_name.lower()} to survive",
            ],
            "intensity_increase": 4,
            "taboo_potential": ["corruption", "loss_of_identity", "betrayal"],
        }
    )

    # Mutation 5: Merge (with another concept)
    mutations.append(
        {
            "card_id": f"mut-{element_id}-005",
            "title": f"{element_name} Reimagined",
            "hook": f"What if {element_name.lower()} combined with taboo elements to create something new?",
            "source_element": element_id,
            "mutation_type": "merge",
            "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
            "constraints": [
                "Must synthesize concepts meaningfully",
                "Must escalate intensity",
            ],
            "possibilities": [
                f"The {element_name.lower()} becomes a ritual of submission",
                f"Power and pleasure become inseparable in {element_name.lower()}",
                f"The {element_name.lower()} creates bonds that cannot be broken",
            ],
            "intensity_increase": 4,
            "taboo_potential": ["ritual", "submission", "unbreakable_bonds"],
        }
    )

    return mutations


def generate_character_mutations(character: Dict, tag_library: Dict) -> List[Dict]:
    """Generate mutation cards for a character."""
    mutations = []
    char_id = character.get("id", "unknown")
    char_name = character.get("name", "Unknown")

    versions = character.get("versions", {})
    bst = versions.get("bst", {})
    sst = versions.get("sst") or {}

    bst_traits = bst.get("traits", [])
    sst_traits = sst.get("traits", [])

    # Mutation 1: Dark Arc
    if sst_traits:
        mutations.append(
            {
                "card_id": f"mut-{char_id}-001",
                "title": f"{char_name}'s Dark Transformation",
                "hook": f"What if {char_name} embraced their darker impulses fully?",
                "source_element": char_id,
                "mutation_type": "transform",
                "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
                "constraints": [
                    "Must maintain character core",
                    "Must show gradual change",
                ],
                "possibilities": [
                    f"{char_name} uses their {' '.join(sst_traits[:2])} to manipulate others",
                    f"{char_name} discovers power through {' '.join(sst_traits[:2])}",
                    f"{char_name}'s journey becomes a descent into {' '.join(sst_traits[:2])}",
                ],
                "intensity_increase": 4,
                "taboo_potential": sst_traits[:3] if sst_traits else ["transformation"],
            }
        )

    # Mutation 2: Intensify Relationships
    relationships = bst.get("relationships", [])
    if relationships:
        rel = relationships[0]  # Use first relationship
        rel_char = rel.get("character", "someone")
        rel_type = rel.get("type", "relationship")

        mutations.append(
            {
                "card_id": f"mut-{char_id}-002",
                "title": f"{char_name} and {rel_char}",
                "hook": f"What if the {rel_type} between {char_name} and {rel_char} became more intense?",
                "source_element": char_id,
                "mutation_type": "intensify",
                "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
                "constraints": [
                    "Must explore power dynamics",
                    "Must escalate emotional stakes",
                ],
                "possibilities": [
                    f"The {rel_type} becomes a source of both pleasure and pain",
                    f"{char_name} and {rel_char} push each other to darker places",
                    f"Their bond becomes addictive and destructive",
                ],
                "intensity_increase": 3,
                "taboo_potential": [
                    "power_dynamics",
                    "obsession",
                    "destructive_relationships",
                ],
            }
        )

    # Mutation 3: Merge with Mythos
    mutations.append(
        {
            "card_id": f"mut-{char_id}-003",
            "title": f"{char_name} and the Blood",
            "hook": f"What if {char_name}'s relationship with vampire nature became central?",
            "source_element": char_id,
            "mutation_type": "merge",
            "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
            "constraints": [
                "Must explore vampire mythology",
                "Must serve character arc",
            ],
            "possibilities": [
                f"{char_name} discovers new depths to their vampiric nature",
                f"Blood becomes a source of power and pleasure for {char_name}",
                f"{char_name} must choose between humanity and vampire nature",
            ],
            "intensity_increase": 3,
            "taboo_potential": [
                "blood_as_ritual",
                "predatory_nature",
                "loss_of_humanity",
            ],
        }
    )

    # Mutation 4: Expose Taboo Elements
    if sst_traits:
        taboo_traits = [
            t
            for t in sst_traits
            if any(
                word in t.lower()
                for word in ["sex", "blood", "dom", "sub", "daddy", "issues"]
            )
        ]
        if taboo_traits:
            mutations.append(
                {
                    "card_id": f"mut-{char_id}-004",
                    "title": f"{char_name}'s Hidden Desires",
                    "hook": f"What if {char_name}'s {' '.join(taboo_traits[:2])} were explored explicitly?",
                    "source_element": char_id,
                    "mutation_type": "expose",
                    "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
                    "constraints": [
                        "Must handle mature themes with care",
                        "Must advance character development",
                    ],
                    "possibilities": [
                        f"{char_name} acts on their {' '.join(taboo_traits[:2])} in unexpected ways",
                        f"The {' '.join(taboo_traits[:2])} become sources of both power and vulnerability",
                        f"{char_name} must confront the consequences of their {' '.join(taboo_traits[:2])}",
                    ],
                    "intensity_increase": 4,
                    "taboo_potential": taboo_traits[:3]
                    if len(taboo_traits) >= 3
                    else taboo_traits,
                }
            )

    # Mutation 5: Complicate Arc
    arc = bst.get("arc", "")
    if arc:
        mutations.append(
            {
                "card_id": f"mut-{char_id}-005",
                "title": f"{char_name}'s Twisted Path",
                "hook": f"What if {char_name}'s arc took a darker, more complicated turn?",
                "source_element": char_id,
                "mutation_type": "complicate",
                "bst_signature": bst_traits[:3] if bst_traits else ["unknown"],
                "constraints": [
                    "Must subvert expectations",
                    "Must create moral complexity",
                ],
                "possibilities": [
                    f"{char_name}'s journey toward growth becomes a descent",
                    f"What seemed like progress for {char_name} reveals itself as corruption",
                    f"{char_name} achieves their goals but loses something essential",
                ],
                "intensity_increase": 3,
                "taboo_potential": ["corruption", "moral_ambiguity", "tragic_choices"],
            }
        )

    return mutations


def main():
    """Main function."""
    print("Generating Mutation Cards for Shadow Lore Forge...")

    # Load data
    mythos_elements = load_mythos()
    characters = load_characters()
    tag_library = load_tag_library()

    print(f"Loaded {len(mythos_elements)} mythos elements")
    print(f"Loaded {len(characters)} characters")

    all_mutations = []

    # Generate mythos mutations
    print("\nGenerating mythos mutations...")
    for element in mythos_elements:
        mutations = generate_mythos_mutations(element, tag_library)
        all_mutations.extend(mutations)
        print(f"  {element.get('name', 'Unknown')}: {len(mutations)} cards")

    # Generate character mutations
    print("\nGenerating character mutations...")
    for char in characters:
        mutations = generate_character_mutations(char, tag_library)
        all_mutations.extend(mutations)
        print(f"  {char.get('name', 'Unknown')}: {len(mutations)} cards")

    print(f"\nTotal mutation cards: {len(all_mutations)}")

    # Create output directory
    output_dir = DATA_DIR / "creative"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save mutations
    output_path = output_dir / "mutation_cards.json"
    with open(output_path, "w") as f:
        json.dump(
            {
                "version": "1.0.0",
                "total_cards": len(all_mutations),
                "cards_by_type": {
                    "intensify": len(
                        [m for m in all_mutations if m["mutation_type"] == "intensify"]
                    ),
                    "transform": len(
                        [m for m in all_mutations if m["mutation_type"] == "transform"]
                    ),
                    "complicate": len(
                        [m for m in all_mutations if m["mutation_type"] == "complicate"]
                    ),
                    "expose": len(
                        [m for m in all_mutations if m["mutation_type"] == "expose"]
                    ),
                    "merge": len(
                        [m for m in all_mutations if m["mutation_type"] == "merge"]
                    ),
                },
                "cards": all_mutations,
            },
            f,
            indent=2,
        )

    print(f"\nOutput: {output_path}")

    # Validation
    assert len(all_mutations) >= 75, (
        f"Expected at least 75 cards, got {len(all_mutations)}"
    )

    # Check all required fields
    for card in all_mutations:
        assert "card_id" in card
        assert "title" in card
        assert "hook" in card
        assert "source_element" in card
        assert "mutation_type" in card

    print("✓ Validation passed: >= 75 cards, all required fields present")

    # Show sample
    print("\nSample mutation cards:")
    for card in all_mutations[:3]:
        print(f"  {card['card_id']}: {card['title']}")
        print(f"    {card['hook'][:60]}...")


if __name__ == "__main__":
    main()
