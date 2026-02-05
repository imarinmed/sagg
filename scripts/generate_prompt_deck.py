#!/usr/bin/env python3
"""
Generate Prompt Deck for Shadow Lore Forge.
Creates 100+ combinatorial creative prompts for SST adaptation.
"""

import json
import random
from pathlib import Path
from typing import Dict, List, Any

DATA_DIR = Path(__file__).parent.parent / "data"


def load_tag_library() -> Dict:
    """Load tag library."""
    with open(DATA_DIR / "tags" / "library.json") as f:
        return json.load(f)


def load_mythos() -> List[Dict]:
    """Load mythos elements."""
    import yaml

    mythos = []
    for yaml_file in (DATA_DIR / "mythos").glob("*.yaml"):
        with open(yaml_file) as f:
            mythos.append(yaml.safe_load(f))
    return mythos


def load_characters() -> List[Dict]:
    """Load characters."""
    import yaml

    chars = []
    for yaml_file in (DATA_DIR / "characters").glob("*.yaml"):
        with open(yaml_file) as f:
            chars.append(yaml.safe_load(f))
    return chars


def generate_what_if_prompts(
    tags: List[str], elements: List[str], count: int = 30
) -> List[Dict]:
    """Generate 'What if...' prompts."""
    prompts = []
    templates = [
        "What if {element} had {tag} as its defining characteristic?",
        "What if {element} became a source of {tag} instead of its original purpose?",
        "What if {element} led to {tag} in unexpected ways?",
        "What if the {tag} aspects of {element} were amplified tenfold?",
        "What if {element} was reimagined through the lens of {tag}?",
    ]

    for i in range(count):
        element = random.choice(elements)
        tag = random.choice(tags)
        template = random.choice(templates)

        prompts.append(
            {
                "prompt_id": f"prompt-whatif-{i + 1:03d}",
                "type": "what_if",
                "title": f"The {tag.title()} {element}",
                "prompt": template.format(element=element, tag=tag),
                "source_elements": [element],
                "tags": [tag],
                "constraints": [
                    "Must maintain internal consistency",
                    "Must serve narrative arc",
                ],
                "variations": [
                    {"twist": "From antagonist's perspective", "focus": "motivation"},
                    {"twist": "Without dialogue", "focus": "visual_storytelling"},
                    {"twist": "In a public setting", "focus": "social_dynamics"},
                ],
                "difficulty": random.choice(["easy", "medium", "hard"]),
                "creative_potential": random.randint(3, 5),
            }
        )

    return prompts


def generate_yes_and_prompts(
    tags: List[str], elements: List[str], count: int = 25
) -> List[Dict]:
    """Generate 'Yes, and...' prompts."""
    prompts = []
    templates = [
        "Yes, {element} exists, and it also creates {tag} in those who encounter it.",
        "Yes, there's {tag}, and it manifests through {element} in surprising ways.",
        "Yes, {element} has {tag}, and this combination creates new possibilities.",
        "Yes, the story has {element}, and {tag} becomes its hidden undercurrent.",
    ]

    for i in range(count):
        element = random.choice(elements)
        tag = random.choice(tags)
        template = random.choice(templates)

        prompts.append(
            {
                "prompt_id": f"prompt-yesand-{i + 1:03d}",
                "type": "yes_and",
                "title": f"Yes, And: {element} + {tag}",
                "prompt": template.format(element=element, tag=tag),
                "source_elements": [element],
                "tags": [tag],
                "constraints": [
                    "Must build on established lore",
                    "Must add meaningful depth",
                ],
                "variations": [
                    {"twist": "Add complication", "focus": "conflict"},
                    {"twist": "Add secondary character", "focus": "relationship"},
                    {"twist": "Add time pressure", "focus": "urgency"},
                ],
                "difficulty": random.choice(["medium", "hard"]),
                "creative_potential": random.randint(3, 5),
            }
        )

    return prompts


def generate_tell_from_prompts(characters: List[str], count: int = 25) -> List[Dict]:
    """Generate 'Tell from...' perspective prompts."""
    prompts = []
    perspectives = [
        ("the victim's perspective", "vulnerability"),
        ("the predator's perspective", "desire"),
        ("an outsider's perspective", "confusion"),
        ("a child's perspective", "innocence"),
        ("the setting itself", "atmosphere"),
        ("an inanimate object", "symbolism"),
    ]

    for i in range(count):
        char = random.choice(characters)
        perspective, focus = random.choice(perspectives)

        prompts.append(
            {
                "prompt_id": f"prompt-perspective-{i + 1:03d}",
                "type": "tell_from",
                "title": f"{char}: Through {perspective.title()}",
                "prompt": f"Tell a scene involving {char} from {perspective}, emphasizing {focus}.",
                "source_elements": [char],
                "tags": [focus, "perspective_shift"],
                "constraints": [
                    "Must maintain character voice",
                    "Must reveal new information",
                ],
                "variations": [
                    {"twist": "Add sensory details", "focus": "immersion"},
                    {"twist": "Use stream of consciousness", "focus": "psychology"},
                    {"twist": "Include unreliable narration", "focus": "ambiguity"},
                ],
                "difficulty": random.choice(["medium", "hard"]),
                "creative_potential": random.randint(4, 5),
            }
        )

    return prompts


def generate_without_prompts(
    elements: List[str], tags: List[str], count: int = 20
) -> List[Dict]:
    """Generate constraint-based 'Without...' prompts."""
    prompts = []
    constraints = [
        ("without dialogue", "physicality"),
        ("in exactly 7 words", "precision"),
        ("without mentioning the protagonist", "supporting_cast"),
        ("using only sensory details", "immersion"),
        ("in reverse chronological order", "structure"),
    ]

    for i in range(count):
        element = random.choice(elements)
        constraint, focus = random.choice(constraints)
        tag = random.choice(tags)

        prompts.append(
            {
                "prompt_id": f"prompt-without-{i + 1:03d}",
                "type": "without",
                "title": f"{element}: {constraint.title()}",
                "prompt": f"Write about {element} and {tag} {constraint}.",
                "source_elements": [element],
                "tags": [tag, focus],
                "constraints": [
                    f"Must follow constraint: {constraint}",
                    "Must still convey complete idea",
                ],
                "variations": [
                    {"twist": "Add second constraint", "focus": "difficulty"},
                    {"twist": "Change genre mid-piece", "focus": "subversion"},
                    {"twist": "End with twist", "focus": "surprise"},
                ],
                "difficulty": "hard",
                "creative_potential": random.randint(4, 5),
            }
        )

    return prompts


def main():
    """Main function."""
    print("Generating Prompt Deck for Shadow Lore Forge...")

    # Load data
    tag_library = load_tag_library()
    mythos = load_mythos()
    characters = load_characters()

    # Extract tags
    all_tags = []
    for category in tag_library.get("categories", {}).values():
        for tag in category.get("tags", []):
            all_tags.append(tag["id"])

    # Extract elements
    mythos_elements = [m.get("id", "unknown") for m in mythos]
    character_names = [c.get("id", "unknown") for c in characters]
    all_elements = mythos_elements + character_names

    print(f"Loaded {len(all_tags)} tags")
    print(
        f"Loaded {len(all_elements)} elements ({len(mythos_elements)} mythos, {len(character_names)} characters)"
    )

    # Generate prompts
    print("\nGenerating 'What if...' prompts...")
    what_if_prompts = generate_what_if_prompts(all_tags, all_elements, 30)

    print("Generating 'Yes, and...' prompts...")
    yes_and_prompts = generate_yes_and_prompts(all_tags, all_elements, 25)

    print("Generating 'Tell from...' prompts...")
    perspective_prompts = generate_tell_from_prompts(character_names, 25)

    print("Generating 'Without...' prompts...")
    without_prompts = generate_without_prompts(all_elements, all_tags, 20)

    # Combine all prompts
    all_prompts = (
        what_if_prompts + yes_and_prompts + perspective_prompts + without_prompts
    )

    print(f"\nTotal prompts: {len(all_prompts)}")

    # Create output directory
    output_dir = DATA_DIR / "creative"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save prompts
    output_path = output_dir / "prompt_deck.json"
    with open(output_path, "w") as f:
        json.dump(
            {
                "version": "1.0.0",
                "total_prompts": len(all_prompts),
                "prompts_by_type": {
                    "what_if": len(what_if_prompts),
                    "yes_and": len(yes_and_prompts),
                    "tell_from": len(perspective_prompts),
                    "without": len(without_prompts),
                },
                "prompts": all_prompts,
            },
            f,
            indent=2,
        )

    print(f"\nOutput: {output_path}")

    # Validation
    assert len(all_prompts) >= 100, (
        f"Expected at least 100 prompts, got {len(all_prompts)}"
    )

    # Check all prompts have required fields
    for prompt in all_prompts:
        assert "prompt_id" in prompt
        assert "type" in prompt
        assert "prompt" in prompt
        assert "variations" in prompt
        assert len(prompt["variations"]) >= 2

    print("✓ Validation passed: >= 100 prompts, all required fields present")

    # Show sample
    print("\nSample prompts:")
    for prompt in all_prompts[:3]:
        print(f"  {prompt['prompt_id']}: {prompt['title']}")
        print(f"    {prompt['prompt'][:70]}...")


if __name__ == "__main__":
    main()
