#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
MYTHOS_SRC = ROOT / "data" / "mythos"
DOCS_SRC = ROOT / "docs"
KB_ROOT = ROOT / "data" / "kb"
KB_MYTHOS = KB_ROOT / "mythos"
KB_FOUNDATIONS = KB_ROOT / "foundations"
KB_META = KB_ROOT / "meta"
FRONTEND_PUBLIC_KB_META = ROOT / "frontend" / "public" / "kb" / "meta"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def dump_frontmatter(data: dict[str, Any]) -> str:
    return yaml.safe_dump(
        data,
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False,
    ).strip()


def md_list(items: list[str]) -> str:
    if not items:
        return "- None"
    return "\n".join(f"- {item}" for item in items)


@dataclass
class MythosEntry:
    id: str
    slug: str
    name: str
    category: str
    tags: list[str]
    aliases: list[str]
    related_ids: list[str]
    provenance: str
    versions: dict[str, Any]
    divergences: list[Any]
    file_path: Path

    def frontmatter(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "category": self.category,
            "tags": self.tags,
            "aliases": self.aliases,
            "related_ids": self.related_ids,
            "provenance": self.provenance,
            "versions": self.versions,
            "divergences": self.divergences,
            "kind": "mythos",
            "updated_at": now_iso(),
        }

    def body(self) -> str:
        bst = self.versions.get("bst", {})
        sst = self.versions.get("sst", {})
        bst_traits = bst.get("traits", [])
        bst_abilities = bst.get("abilities", [])
        bst_weaknesses = bst.get("weaknesses", [])
        sst_traits = sst.get("traits", [])
        source_eps = bst.get("source_episodes", [])

        return (
            f"# {self.name}\n\n"
            f"## Summary\n\n"
            f"{(bst.get('description') or '').strip()}\n\n"
            f"## BST\n\n"
            f"### Traits\n{md_list(bst_traits)}\n\n"
            f"### Abilities\n{md_list(bst_abilities)}\n\n"
            f"### Weaknesses\n{md_list(bst_weaknesses)}\n\n"
            f"### Significance\n{(bst.get('significance') or '').strip()}\n\n"
            f"### Source Episodes\n{md_list(source_eps)}\n\n"
            f"## SST\n\n"
            f"### Description\n{(sst.get('description') or '').strip()}\n\n"
            f"### Traits\n{md_list(sst_traits)}\n\n"
            f"### Significance\n{(sst.get('significance') or '').strip()}\n\n"
            f"### Mechanics\n{(sst.get('mechanics') or '').strip()}\n\n"
            f"### Erotic Implications\n{(sst.get('erotic_implications') or '').strip()}\n"
        )


def load_mythos(path: Path) -> MythosEntry:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    name = raw.get("name", path.stem)
    entry_id = raw.get("id", path.stem)
    slug = slugify(name or entry_id)
    category = raw.get("category", "uncategorized")
    tags = sorted(
        {
            category,
            "mythos",
            "bst",
            "sst",
            *raw.get("versions", {}).get("bst", {}).get("traits", []),
            *raw.get("versions", {}).get("sst", {}).get("traits", []),
        }
    )
    related_ids = list(raw.get("related_characters", []))
    aliases: list[str] = []

    return MythosEntry(
        id=entry_id,
        slug=slug,
        name=name,
        category=category,
        tags=tags,
        aliases=aliases,
        related_ids=related_ids,
        provenance=str(path.relative_to(ROOT)),
        versions=raw.get("versions", {}),
        divergences=raw.get("divergences", []),
        file_path=path,
    )


def first_heading_or_name(content: str, fallback: str) -> str:
    for line in content.splitlines():
        if line.startswith("# "):
            return line[2:].strip() or fallback
    return fallback


def parse_mdx_frontmatter(path: Path) -> dict[str, Any]:
    content = path.read_text(encoding="utf-8")
    if not content.startswith("---\n"):
        return {}
    parts = content.split("---\n", 2)
    if len(parts) < 3:
        return {}
    frontmatter = yaml.safe_load(parts[1])
    if not isinstance(frontmatter, dict):
        return {}
    return frontmatter


def as_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if item is not None]
    return []


def build_lore_payload(kb_paths: list[Path]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for path in kb_paths:
        fm = parse_mdx_frontmatter(path)
        rel_path = str(path.relative_to(ROOT))

        entry_id = str(fm.get("id") or "").strip()
        slug = str(fm.get("slug") or "").strip()
        name = str(fm.get("name") or fm.get("title") or "").strip()

        if not entry_id and slug:
            entry_id = slug
        if not slug and entry_id:
            slug = slugify(entry_id)
        if not entry_id and not slug:
            slug = slugify(path.stem)
            entry_id = slug
        if not name:
            name = path.stem.replace("-", " ").replace("_", " ").title()

        entry: dict[str, Any] = {
            "id": entry_id,
            "slug": slug,
            "name": name,
            "title": str(fm.get("title") or name),
            "category": str(fm.get("category") or "uncategorized"),
            "kind": str(fm.get("kind") or "lore"),
            "tags": as_list(fm.get("tags")),
            "aliases": as_list(fm.get("aliases")),
            "related_ids": as_list(fm.get("related_ids")),
            "versions": fm.get("versions")
            if isinstance(fm.get("versions"), dict)
            else {},
            "provenance": str(fm.get("provenance") or rel_path),
            "path": rel_path,
            "updated_at": str(fm.get("updated_at") or ""),
        }

        for key, value in fm.items():
            if key not in entry:
                entry[key] = value

        normalized.append(entry)

    normalized.sort(key=lambda item: (item["id"], item["slug"], item["path"]))

    seen_ids: set[str] = set()
    seen_slugs: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for item in normalized:
        item_id = item["id"]
        item_slug = item["slug"]

        if item_id and item_id in seen_ids:
            continue
        if item_slug and item_slug in seen_slugs:
            continue

        deduped.append(item)
        if item_id:
            seen_ids.add(item_id)
        if item_slug:
            seen_slugs.add(item_slug)

    return deduped


def ingest_foundation(path: Path) -> dict[str, Any]:
    content = path.read_text(encoding="utf-8")
    title = first_heading_or_name(content, path.stem.replace("-", " ").title())
    slug = slugify(path.stem)
    fm = {
        "title": title,
        "slug": slug,
        "tags": ["mythos", "foundational", "bst", "sst"],
        "role": "foundational",
        "provenance": str(path.relative_to(ROOT)),
        "kind": "foundation",
        "updated_at": now_iso(),
    }
    out_path = KB_FOUNDATIONS / f"{slug}.mdx"
    out_path.write_text(
        f"---\n{dump_frontmatter(fm)}\n---\n\n{content.rstrip()}\n",
        encoding="utf-8",
    )
    return {
        "id": slug,
        "slug": slug,
        "title": title,
        "path": str(out_path.relative_to(ROOT)),
        "provenance": fm["provenance"],
        "kind": "foundation",
    }


def ensure_dirs() -> None:
    KB_MYTHOS.mkdir(parents=True, exist_ok=True)
    KB_FOUNDATIONS.mkdir(parents=True, exist_ok=True)
    KB_META.mkdir(parents=True, exist_ok=True)
    FRONTEND_PUBLIC_KB_META.mkdir(parents=True, exist_ok=True)


def write_mythos(entries: list[MythosEntry]) -> list[dict[str, Any]]:
    output = []
    for entry in entries:
        out_path = KB_MYTHOS / f"{entry.slug}.mdx"
        out_path.write_text(
            f"---\n{dump_frontmatter(entry.frontmatter())}\n---\n\n{entry.body().rstrip()}\n",
            encoding="utf-8",
        )
        output.append(
            {
                "id": entry.id,
                "slug": entry.slug,
                "name": entry.name,
                "category": entry.category,
                "path": str(out_path.relative_to(ROOT)),
                "provenance": entry.provenance,
                "kind": "mythos",
            }
        )
    return output


def build_index(
    mythos_items: list[dict[str, Any]], foundation_items: list[dict[str, Any]]
) -> None:
    categories: dict[str, int] = {}
    for item in mythos_items:
        categories[item["category"]] = categories.get(item["category"], 0) + 1

    index = {
        "generated_at": now_iso(),
        "counts": {
            "mythos": len(mythos_items),
            "foundations": len(foundation_items),
            "total": len(mythos_items) + len(foundation_items),
        },
        "categories": categories,
        "mythos": mythos_items,
        "foundations": foundation_items,
    }
    (KB_META / "index.json").write_text(
        json.dumps(index, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def build_mythos_payload(entries: list[MythosEntry]) -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for entry in entries:
        bst = entry.versions.get("bst", {})
        sst = entry.versions.get("sst", {})
        payload.append(
            {
                "id": entry.id,
                "slug": entry.slug,
                "name": entry.name,
                "category": entry.category,
                "description": bst.get("description", ""),
                "short_description": bst.get("description", ""),
                "related_episodes": bst.get("source_episodes", []),
                "related_characters": entry.related_ids,
                "traits": bst.get("traits", []),
                "abilities": bst.get("abilities", []),
                "weaknesses": bst.get("weaknesses", []),
                "significance": bst.get("significance", ""),
                "dark_variant": sst.get("description", ""),
                "erotic_implications": sst.get("erotic_implications", ""),
                "horror_elements": sst.get("traits", []),
                "taboo_potential": sst.get("significance", ""),
                "versions": entry.versions,
                "divergences": entry.divergences,
                "kind": "mythos",
                "provenance": entry.provenance,
                "created_at": now_iso(),
                "updated_at": now_iso(),
            }
        )
    return payload


def build_foundations_payload(
    foundation_items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for item in foundation_items:
        payload.append(
            {
                "id": item["id"],
                "slug": item["slug"],
                "title": item["title"],
                "path": item["path"],
                "provenance": item["provenance"],
                "kind": "foundation",
            }
        )
    return payload


def write_public_payloads(
    mythos_payload: list[dict[str, Any]],
    foundations_payload: list[dict[str, Any]],
    lore_payload: list[dict[str, Any]],
) -> None:
    (FRONTEND_PUBLIC_KB_META / "mythos.json").write_text(
        json.dumps(mythos_payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (FRONTEND_PUBLIC_KB_META / "foundations.json").write_text(
        json.dumps(foundations_payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (FRONTEND_PUBLIC_KB_META / "lore.json").write_text(
        json.dumps(lore_payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    ensure_dirs()

    mythos_entries = [load_mythos(path) for path in sorted(MYTHOS_SRC.glob("*.yaml"))]
    mythos_items = write_mythos(mythos_entries)

    foundation_items = [
        ingest_foundation(path) for path in sorted(DOCS_SRC.glob("*.md"))
    ]

    mythos_payload = build_mythos_payload(mythos_entries)
    foundations_payload = build_foundations_payload(foundation_items)
    lore_payload = build_lore_payload(sorted(KB_ROOT.glob("**/*.mdx")))

    build_index(mythos_items, foundation_items)
    write_public_payloads(mythos_payload, foundations_payload, lore_payload)

    print(f"Generated {len(mythos_items)} mythos MDX files")
    print(f"Generated {len(foundation_items)} foundation MDX files")
    print(f"Wrote {KB_META / 'index.json'}")
    print(f"Wrote {FRONTEND_PUBLIC_KB_META / 'mythos.json'}")
    print(f"Wrote {FRONTEND_PUBLIC_KB_META / 'foundations.json'}")
    print(
        f"Wrote {FRONTEND_PUBLIC_KB_META / 'lore.json'} ({len(lore_payload)} entries)"
    )


if __name__ == "__main__":
    main()
