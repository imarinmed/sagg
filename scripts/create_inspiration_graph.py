#!/usr/bin/env python3
"""
Create Inspiration Graph for Shadow Lore Forge.
Bidirectional linking system with activation keys (NovelAI Lorebook pattern).
"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Any, Set

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


def load_beats() -> List[Dict]:
    """Load beats."""
    with open(DATA_DIR / "narratives" / "bst" / "beats.json") as f:
        return json.load(f)["beats"]


def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text for activation keys."""
    if not text:
        return []

    # Simple keyword extraction
    words = text.lower().split()
    # Filter for meaningful words (4+ chars)
    keywords = [w.strip(".,!?;:'\"") for w in words if len(w) >= 4]
    # Return unique keywords
    return list(set(keywords))[:10]  # Top 10 keywords


def create_inspiration_nodes(
    mythos: List[Dict], characters: List[Dict], beats: List[Dict]
) -> List[Dict]:
    """Create inspiration nodes from all content."""
    nodes = []
    node_id = 1

    # Create nodes for mythos elements
    for element in mythos:
        element_id = element.get("id", "")
        name = element.get("name", "")

        versions = element.get("versions", {})
        bst = versions.get("bst", {})

        content = bst.get("description", "")
        activation_keys = extract_keywords(content)
        activation_keys.extend([element_id, name.lower().replace(" ", "_")])

        node = {
            "node_id": f"insp-{node_id:04d}",
            "type": "canonical",
            "title": name,
            "content": content[:300] if content else "",
            "source": {"type": "mythos", "id": element_id},
            "activation_keys": list(set(activation_keys)),
            "links_to": [],
            "linked_from": [],
            "cascade_triggers": [],
            "creative_potential": 4,
            "is_discovered": True,
        }
        nodes.append(node)
        node_id += 1

    # Create nodes for characters
    for char in characters:
        char_id = char.get("id", "")
        name = char.get("name", "")

        versions = char.get("versions", {})
        bst = versions.get("bst", {})

        traits = bst.get("traits", [])
        arc = bst.get("arc", "")

        content = f"{name}: {', '.join(traits)}. Arc: {arc}"
        activation_keys = extract_keywords(content)
        activation_keys.extend([char_id, name.lower().replace(" ", "_")])

        node = {
            "node_id": f"insp-{node_id:04d}",
            "type": "canonical",
            "title": name,
            "content": content[:300],
            "source": {"type": "character", "id": char_id},
            "activation_keys": list(set(activation_keys)),
            "links_to": [],
            "linked_from": [],
            "cascade_triggers": [],
            "creative_potential": 5,
            "is_discovered": True,
        }
        nodes.append(node)
        node_id += 1

    # Create nodes for key beats
    for i, beat in enumerate(beats[:20]):  # Top 20 beats
        beat_id = beat.get("beat_id", "")
        summary = beat.get("summary", "")
        characters = beat.get("characters", [])

        activation_keys = extract_keywords(summary)
        activation_keys.extend(characters[:3])

        node = {
            "node_id": f"insp-{node_id:04d}",
            "type": "canonical",
            "title": f"Beat: {beat_id}",
            "content": summary[:300],
            "source": {"type": "beat", "id": beat_id},
            "activation_keys": list(set(activation_keys)),
            "links_to": [],
            "linked_from": [],
            "cascade_triggers": [],
            "creative_potential": 3,
            "is_discovered": True,
        }
        nodes.append(node)
        node_id += 1

    return nodes


def create_links(nodes: List[Dict]) -> List[Dict]:
    """Create bidirectional links between related nodes."""
    # Build keyword index
    keyword_to_nodes: Dict[str, List[int]] = {}
    for i, node in enumerate(nodes):
        for key in node.get("activation_keys", []):
            if key not in keyword_to_nodes:
                keyword_to_nodes[key] = []
            keyword_to_nodes[key].append(i)

    # Create links based on shared keywords
    links = []
    for i, node in enumerate(nodes):
        related = set()

        # Find nodes sharing activation keys
        for key in node.get("activation_keys", []):
            for other_idx in keyword_to_nodes.get(key, []):
                if other_idx != i:
                    related.add(other_idx)

        # Limit links per node
        related = list(related)[:5]

        for other_idx in related:
            other_node = nodes[other_idx]

            # Create link
            link = {
                "from_node": node["node_id"],
                "to_node": other_node["node_id"],
                "context": f"Shares keywords: {', '.join(set(node['activation_keys']) & set(other_node['activation_keys']))[:3]}",
            }
            links.append(link)

            # Update nodes with links (bidirectional)
            node["links_to"].append(
                {"node_id": other_node["node_id"], "context": link["context"]}
            )
            other_node["linked_from"].append(
                {"node_id": node["node_id"], "context": link["context"]}
            )

    return links


def add_cascade_triggers(nodes: List[Dict]) -> None:
    """Add cascade triggers for related discovery."""
    for node in nodes:
        # Cascade to nodes this one links to
        cascades = [link["node_id"] for link in node.get("links_to", [])[:3]]
        node["cascade_triggers"] = cascades


def main():
    """Main function."""
    print("Creating Inspiration Graph for Shadow Lore Forge...")

    # Load data
    mythos = load_mythos()
    characters = load_characters()
    beats = load_beats()

    print(f"Loaded {len(mythos)} mythos elements")
    print(f"Loaded {len(characters)} characters")
    print(f"Loaded {len(beats)} beats")

    # Create nodes
    print("\nCreating inspiration nodes...")
    nodes = create_inspiration_nodes(mythos, characters, beats)
    print(f"  Created {len(nodes)} nodes")

    # Create links
    print("Creating bidirectional links...")
    links = create_links(nodes)
    print(f"  Created {len(links)} links")

    # Add cascade triggers
    print("Adding cascade triggers...")
    add_cascade_triggers(nodes)

    # Create output directory
    output_dir = DATA_DIR / "creative"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save inspiration graph
    output_path = output_dir / "inspiration_graph.json"
    with open(output_path, "w") as f:
        json.dump(
            {
                "version": "1.0.0",
                "total_nodes": len(nodes),
                "total_links": len(links),
                "node_types": {
                    "canonical": len([n for n in nodes if n["type"] == "canonical"]),
                    "extension": len([n for n in nodes if n["type"] == "extension"]),
                    "what_if": len([n for n in nodes if n["type"] == "what_if"]),
                },
                "nodes": nodes,
                "links": links,
            },
            f,
            indent=2,
        )

    print(f"\nOutput: {output_path}")

    # Validation
    assert len(nodes) >= 30, f"Expected at least 30 nodes, got {len(nodes)}"
    assert len(links) >= 20, f"Expected at least 20 links, got {len(links)}"

    # Check bidirectional linking
    for node in nodes:
        for link in node.get("links_to", []):
            target_id = link["node_id"]
            target = next((n for n in nodes if n["node_id"] == target_id), None)
            if target:
                assert any(
                    l["node_id"] == node["node_id"]
                    for l in target.get("linked_from", [])
                ), f"Link not reciprocated: {node['node_id']} -> {target_id}"

    print("✓ Validation passed: bidirectional linking verified")

    # Show sample
    print("\nSample inspiration nodes:")
    for node in nodes[:3]:
        print(f"  {node['node_id']}: {node['title']}")
        print(f"    Keys: {', '.join(node['activation_keys'][:5])}")
        print(f"    Links: {len(node['links_to'])}")


if __name__ == "__main__":
    main()
