#!/usr/bin/env python3
"""CLI for running SBERT/Smith-Waterman narrative alignment."""

import argparse
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def load_beats(narrative: str = "bst") -> list[dict]:
    """Load narrative beats from JSON file."""
    beats_file = DATA_DIR / "narratives" / narrative / "beats.json"
    if not beats_file.exists():
        print(f"Error: beats.json not found at {beats_file}")
        return []

    with open(beats_file, encoding="utf-8") as f:
        data = json.load(f)

    return data.get("beats", [])


def extract_beat_texts(beats: list[dict]) -> tuple[list[str], list[str]]:
    """Extract text content and IDs from beats for alignment."""
    texts = []
    ids = []

    for beat in beats:
        beat_id = beat.get("beat_id", "")
        summary = beat.get("summary", "")
        location = beat.get("location", "")
        characters = ", ".join(beat.get("characters", []))
        content_types = ", ".join(beat.get("content_types", []))

        text = f"{summary} Location: {location}. Characters: {characters}. Content: {content_types}"
        texts.append(text)
        ids.append(beat_id)

    return texts, ids


def run_sbert_alignment(
    source_texts: list[str],
    target_texts: list[str],
    source_ids: list[str],
    target_ids: list[str],
    top_k: int = 5,
    threshold: float = 0.5,
    model: str = "all-MiniLM-L6-v2",
) -> dict:
    """Run SBERT alignment between two narrative sequences."""
    sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

    try:
        from backend.src.alignment import SBERTAligner
    except ImportError:
        from src.alignment import SBERTAligner

    aligner = SBERTAligner(model_name=model)
    result = aligner.align(
        source_texts=source_texts,
        target_texts=target_texts,
        source_ids=source_ids,
        target_ids=target_ids,
        top_k=top_k,
        threshold=threshold,
    )

    return {
        "mean_similarity": result.mean_similarity,
        "max_similarity": result.max_similarity,
        "alignment_coverage": result.alignment_coverage,
        "total_matches": len(result.top_matches),
        "top_matches": [
            {
                "source_id": m.source_id,
                "target_id": m.target_id,
                "score": round(m.score, 4),
                "rank": m.rank,
                "source_text": m.source_text[:100] + "..."
                if len(m.source_text) > 100
                else m.source_text,
                "target_text": m.target_text[:100] + "..."
                if len(m.target_text) > 100
                else m.target_text,
            }
            for m in result.top_matches[:20]
        ],
    }


def run_smith_waterman_alignment(
    source_texts: list[str],
    target_texts: list[str],
    source_ids: list[str],
    target_ids: list[str],
    threshold: float = 0.5,
    model: str = "all-MiniLM-L6-v2",
) -> dict:
    """Run combined SBERT + Smith-Waterman alignment."""
    sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

    try:
        from backend.src.alignment import SBERTAligner, SmithWaterman
    except ImportError:
        from src.alignment import SBERTAligner, SmithWaterman

    sbert = SBERTAligner(model_name=model)
    sbert_result = sbert.align(
        source_texts=source_texts,
        target_texts=target_texts,
        source_ids=source_ids,
        target_ids=target_ids,
        top_k=1,
        threshold=0.0,
    )

    sw = SmithWaterman(
        match_score=2.0,
        mismatch_penalty=-1.0,
        gap_penalty=-1.0,
        similarity_weight=1.5,
    )

    alignment = sw.align_with_scores(
        source_ids=source_ids,
        target_ids=target_ids,
        similarity_matrix=sbert_result.similarity_matrix,
        threshold=threshold,
    )

    return {
        "sbert_mean_similarity": sbert_result.mean_similarity,
        "sbert_max_similarity": sbert_result.max_similarity,
        "sw_total_score": alignment["total_score"],
        "sw_source_coverage": alignment["source_coverage"],
        "sw_target_coverage": alignment["target_coverage"],
        "sw_identity": alignment["identity"],
        "sw_gap_count": alignment["gap_count"],
        "sw_path_length": alignment["path_length"],
        "aligned_pairs": alignment["aligned_pairs"][:20],
    }


def run_self_alignment_analysis(
    beats: list[dict], model: str = "all-MiniLM-L6-v2"
) -> dict:
    """Analyze self-similarity within a single narrative (find recurring themes)."""
    texts, ids = extract_beat_texts(beats)

    sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

    try:
        from backend.src.alignment import SBERTAligner
    except ImportError:
        from src.alignment import SBERTAligner

    aligner = SBERTAligner(model_name=model)
    result = aligner.align(
        source_texts=texts,
        target_texts=texts,
        source_ids=ids,
        target_ids=ids,
        top_k=3,
        threshold=0.7,
    )

    similar_pairs = [
        m for m in result.top_matches if m.source_id != m.target_id and m.score >= 0.7
    ]

    similar_pairs = sorted(similar_pairs, key=lambda m: m.score, reverse=True)[:30]

    return {
        "total_beats": len(beats),
        "mean_self_similarity": result.mean_similarity,
        "recurring_themes": [
            {
                "beat_a": m.source_id,
                "beat_b": m.target_id,
                "similarity": round(m.score, 4),
            }
            for m in similar_pairs
        ],
    }


def main():
    parser = argparse.ArgumentParser(
        description="Run SBERT/Smith-Waterman narrative alignment"
    )
    parser.add_argument(
        "--mode",
        choices=["sbert", "smith-waterman", "self-analysis"],
        default="sbert",
        help="Alignment mode: sbert (semantic matching), smith-waterman (sequence alignment), self-analysis (find recurring themes)",
    )
    parser.add_argument(
        "--source",
        default="bst",
        help="Source narrative (default: bst)",
    )
    parser.add_argument(
        "--target",
        default="bst",
        help="Target narrative for comparison (default: same as source)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.5,
        help="Similarity threshold (default: 0.5)",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Number of top matches per source (default: 5)",
    )
    parser.add_argument(
        "--model",
        default="all-MiniLM-L6-v2",
        help="SBERT model name (default: all-MiniLM-L6-v2)",
    )
    parser.add_argument(
        "--output",
        help="Output JSON file (optional, defaults to stdout)",
    )

    args = parser.parse_args()

    print(f"Loading {args.source} beats...", file=sys.stderr)
    source_beats = load_beats(args.source)
    if not source_beats:
        print("Error: No source beats loaded", file=sys.stderr)
        sys.exit(1)

    print(f"Loaded {len(source_beats)} source beats", file=sys.stderr)

    if args.mode == "self-analysis":
        print("Running self-similarity analysis...", file=sys.stderr)
        result = run_self_alignment_analysis(source_beats, model=args.model)
    else:
        target_beats = source_beats
        if args.target != args.source:
            print(f"Loading {args.target} beats...", file=sys.stderr)
            target_beats = load_beats(args.target)
            if not target_beats:
                print("Error: No target beats loaded", file=sys.stderr)
                sys.exit(1)
            print(f"Loaded {len(target_beats)} target beats", file=sys.stderr)

        source_texts, source_ids = extract_beat_texts(source_beats)
        target_texts, target_ids = extract_beat_texts(target_beats)

        if args.mode == "sbert":
            print("Running SBERT semantic alignment...", file=sys.stderr)
            result = run_sbert_alignment(
                source_texts=source_texts,
                target_texts=target_texts,
                source_ids=source_ids,
                target_ids=target_ids,
                top_k=args.top_k,
                threshold=args.threshold,
                model=args.model,
            )
        else:
            print("Running Smith-Waterman sequence alignment...", file=sys.stderr)
            result = run_smith_waterman_alignment(
                source_texts=source_texts,
                target_texts=target_texts,
                source_ids=source_ids,
                target_ids=target_ids,
                threshold=args.threshold,
                model=args.model,
            )

    output_json = json.dumps(result, indent=2, ensure_ascii=False)

    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"Results written to {output_path}", file=sys.stderr)
    else:
        print(output_json)


if __name__ == "__main__":
    main()
