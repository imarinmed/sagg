"""
Automated Causal Inference Engine.
Infers causal relationships from narrative patterns and temporal sequences.
"""

from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import numpy as np
from collections import defaultdict


class CausalPattern(Enum):
    """Types of causal patterns that can be detected."""

    TEMPORAL_SEQUENCE = "temporal_sequence"
    CHARACTER_REACTION = "character_reaction"
    EVENT_DEPENDENCY = "event_dependency"
    THEMATIC_CAUSATION = "thematic_causation"
    CORRELATION = "correlation"


@dataclass
class InferredCausalLink:
    """A causality link inferred by the engine."""

    from_beat: str
    to_beat: str
    relationship_type: str
    confidence: float
    pattern: CausalPattern
    evidence: List[str]
    explanation: str


class CausalInferenceEngine:
    """
    Engine for automatically inferring causal relationships.

    Uses multiple inference strategies:
    - Temporal proximity (beats close in time likely related)
    - Character continuity (same character in consecutive beats)
    - Thematic similarity (similar tags suggest causation)
    - Event patterns (common narrative patterns)
    """

    def __init__(self, confidence_threshold: float = 0.6):
        """
        Initialize the inference engine.

        Args:
            confidence_threshold: Minimum confidence for inferred links
        """
        self.confidence_threshold = confidence_threshold
        self.inferred_links: List[InferredCausalLink] = []

    def infer_from_temporal_proximity(
        self,
        beats: Dict,
        max_time_gap: int = 300,  # 5 minutes
    ) -> List[InferredCausalLink]:
        """
        Infer causation from temporal proximity.

        Beats that occur close together in time are likely causally related.

        Args:
            beats: Dictionary of beats with timestamps
            max_time_gap: Maximum time gap to consider (seconds)

        Returns:
            List of inferred causal links
        """
        links = []

        # Sort beats by timestamp
        sorted_beats = sorted(beats.items(), key=lambda x: (x[1].episode_id, x[1].start_seconds))

        for i in range(len(sorted_beats) - 1):
            beat1_id, beat1 = sorted_beats[i]
            beat2_id, beat2 = sorted_beats[i + 1]

            # Only consider beats in same episode
            if beat1.episode_id != beat2.episode_id:
                continue

            time_gap = beat2.start_seconds - beat1.end_seconds

            if time_gap <= max_time_gap:
                # Calculate confidence based on proximity
                confidence = 1.0 - (time_gap / max_time_gap)
                confidence = max(0.5, confidence)  # Minimum 0.5

                if confidence >= self.confidence_threshold:
                    links.append(
                        InferredCausalLink(
                            from_beat=beat1_id,
                            to_beat=beat2_id,
                            relationship_type="enables",
                            confidence=confidence,
                            pattern=CausalPattern.TEMPORAL_SEQUENCE,
                            evidence=[
                                f"Time gap: {time_gap}s",
                                f"Same episode: {beat1.episode_id}",
                            ],
                            explanation=f"Sequential beats with {time_gap}s gap",
                        )
                    )

        return links

    def infer_from_character_continuity(
        self, beats: Dict, min_shared_characters: int = 2
    ) -> List[InferredCausalLink]:
        """
        Infer causation from character continuity.

        Beats sharing characters likely have causal relationships.

        Args:
            beats: Dictionary of beats
            min_shared_characters: Minimum characters to share

        Returns:
            List of inferred causal links
        """
        links = []

        beat_list = list(beats.items())

        for i in range(len(beat_list)):
            for j in range(i + 1, min(i + 10, len(beat_list))):
                beat1_id, beat1 = beat_list[i]
                beat2_id, beat2 = beat_list[j]

                # Get characters in each beat
                chars1 = set(beat1.characters) if hasattr(beat1, "characters") else set()
                chars2 = set(beat2.characters) if hasattr(beat2, "characters") else set()

                shared = chars1.intersection(chars2)

                if len(shared) >= min_shared_characters:
                    confidence = min(0.95, 0.5 + (len(shared) * 0.1))

                    if confidence >= self.confidence_threshold:
                        links.append(
                            InferredCausalLink(
                                from_beat=beat1_id,
                                to_beat=beat2_id,
                                relationship_type="motivates",
                                confidence=confidence,
                                pattern=CausalPattern.CHARACTER_REACTION,
                                evidence=[f"Shared characters: {', '.join(shared)}"],
                                explanation=f"Character continuity: {len(shared)} shared characters",
                            )
                        )

        return links

    def infer_from_thematic_similarity(
        self, beats: Dict, min_shared_tags: int = 2
    ) -> List[InferredCausalLink]:
        """
        Infer causation from thematic similarity.

        Beats with similar tags/themes may be causally related.

        Args:
            beats: Dictionary of beats
            min_shared_tags: Minimum tags to share

        Returns:
            List of inferred causal links
        """
        links = []

        beat_list = list(beats.items())

        for i in range(len(beat_list)):
            for j in range(i + 1, min(i + 20, len(beat_list))):
                beat1_id, beat1 = beat_list[i]
                beat2_id, beat2 = beat_list[j]

                # Get tags
                tags1 = set(beat1.tags) if hasattr(beat1, "tags") else set()
                tags2 = set(beat2.tags) if hasattr(beat2, "tags") else set()

                shared = tags1.intersection(tags2)

                if len(shared) >= min_shared_tags:
                    confidence = min(0.9, 0.4 + (len(shared) * 0.1))

                    if confidence >= self.confidence_threshold:
                        links.append(
                            InferredCausalLink(
                                from_beat=beat1_id,
                                to_beat=beat2_id,
                                relationship_type="thematically_related",
                                confidence=confidence,
                                pattern=CausalPattern.THEMATIC_CAUSATION,
                                evidence=[f"Shared tags: {', '.join(shared)}"],
                                explanation=f"Thematic similarity: {len(shared)} shared tags",
                            )
                        )

        return links

    def infer_from_narrative_patterns(self, beats: Dict) -> List[InferredCausalLink]:
        """
        Infer causation from common narrative patterns.

        Recognizes patterns like:
        - Temptation -> Fall
        - Conflict -> Resolution
        - Revelation -> Consequence

        Args:
            beats: Dictionary of beats

        Returns:
            List of inferred causal links
        """
        links = []

        # Define narrative patterns
        patterns = [
            ("temptation", "seduction", "causes", 0.8),
            ("confrontation", "revelation", "leads_to", 0.75),
            ("revelation", "transformation", "triggers", 0.85),
            ("seduction", "dependence", "creates", 0.7),
        ]

        beat_list = list(beats.items())

        for i in range(len(beat_list) - 1):
            beat1_id, beat1 = beat_list[i]
            beat2_id, beat2 = beat_list[i + 1]

            tags1 = set(beat1.tags) if hasattr(beat1, "tags") else set()
            tags2 = set(beat2.tags) if hasattr(beat2, "tags") else set()

            for tag1, tag2, relation, confidence in patterns:
                if tag1 in tags1 and tag2 in tags2:
                    if confidence >= self.confidence_threshold:
                        links.append(
                            InferredCausalLink(
                                from_beat=beat1_id,
                                to_beat=beat2_id,
                                relationship_type=relation,
                                confidence=confidence,
                                pattern=CausalPattern.EVENT_DEPENDENCY,
                                evidence=[f"Pattern: {tag1} -> {tag2}", f"Sequential beats"],
                                explanation=f"Narrative pattern: {tag1} leads to {tag2}",
                            )
                        )

        return links

    def run_all_inference(
        self, beats: Dict, existing_edges: Optional[Set[Tuple[str, str]]] = None
    ) -> List[InferredCausalLink]:
        """
        Run all inference strategies and combine results.

        Args:
            beats: Dictionary of beats
            existing_edges: Set of existing (from, to) edge tuples to avoid duplicates

        Returns:
            Combined list of inferred causal links
        """
        if existing_edges is None:
            existing_edges = set()

        all_links = []

        # Run all inference methods
        all_links.extend(self.infer_from_temporal_proximity(beats))
        all_links.extend(self.infer_from_character_continuity(beats))
        all_links.extend(self.infer_from_thematic_similarity(beats))
        all_links.extend(self.infer_from_narrative_patterns(beats))

        # Filter out duplicates and existing edges
        seen = set(existing_edges)
        unique_links = []

        for link in all_links:
            edge_tuple = (link.from_beat, link.to_beat)
            if edge_tuple not in seen:
                seen.add(edge_tuple)
                unique_links.append(link)

        # Sort by confidence
        unique_links.sort(key=lambda x: x.confidence, reverse=True)

        self.inferred_links = unique_links
        return unique_links

    def get_high_confidence_links(
        self, min_confidence: Optional[float] = None
    ) -> List[InferredCausalLink]:
        """
        Get links above a confidence threshold.

        Args:
            min_confidence: Minimum confidence (defaults to threshold)

        Returns:
            Filtered list of links
        """
        threshold = min_confidence or self.confidence_threshold
        return [link for link in self.inferred_links if link.confidence >= threshold]

    def export_to_edges(self, links: Optional[List[InferredCausalLink]] = None) -> List[Dict]:
        """
        Export inferred links to edge format.

        Args:
            links: Links to export (defaults to all inferred)

        Returns:
            List of edge dictionaries
        """
        if links is None:
            links = self.inferred_links

        edges = []
        for i, link in enumerate(links):
            edges.append(
                {
                    "edge_id": f"inferred_{i:04d}",
                    "from_beat": link.from_beat,
                    "to_beat": link.to_beat,
                    "relationship_type": link.relationship_type,
                    "confidence": link.confidence,
                    "inference_pattern": link.pattern.value,
                    "evidence": link.evidence,
                    "explanation": link.explanation,
                    "temporal_distance": "inferred",
                }
            )

        return edges


def auto_infer_causality(
    beats_db: Dict, existing_edges_db: Optional[Dict] = None, confidence_threshold: float = 0.6
) -> List[Dict]:
    """
    Convenience function to run automated causal inference.

    Args:
        beats_db: Database of beats
        existing_edges_db: Existing causality edges (to avoid duplicates)
        confidence_threshold: Minimum confidence for inference

    Returns:
        List of inferred edges in standard format
    """
    engine = CausalInferenceEngine(confidence_threshold)

    # Get existing edges
    existing = set()
    if existing_edges_db:
        for edge in existing_edges_db.values():
            existing.add((edge.from_beat, edge.to_beat))

    # Run inference
    inferred_links = engine.run_all_inference(beats_db, existing)

    # Export to edge format
    return engine.export_to_edges(inferred_links)
