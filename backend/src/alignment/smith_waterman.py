"""Smith-Waterman sequence alignment for narrative beat matching."""

from dataclasses import dataclass
from enum import Enum

import numpy as np
from numpy.typing import NDArray


class AlignmentDirection(Enum):
    """Direction for traceback in alignment matrix."""

    NONE = 0
    DIAGONAL = 1
    UP = 2
    LEFT = 3


@dataclass
class AlignmentPath:
    """A single aligned pair in the sequence alignment."""

    source_idx: int
    target_idx: int
    score: float
    is_gap: bool = False


@dataclass
class SequenceAlignment:
    """Result of Smith-Waterman local sequence alignment."""

    path: list[AlignmentPath]
    score: float
    source_aligned: list[int]
    target_aligned: list[int]
    score_matrix: NDArray[np.float32]
    gap_count: int
    identity: float


class SmithWaterman:
    """Smith-Waterman algorithm for local sequence alignment.

    Adapted for narrative alignment where similarity between elements
    is provided by an external scoring function (e.g., SBERT cosine similarity).
    """

    def __init__(
        self,
        match_score: float = 2.0,
        mismatch_penalty: float = -1.0,
        gap_penalty: float = -1.0,
        similarity_weight: float = 1.0,
    ) -> None:
        """Initialize Smith-Waterman aligner.

        Args:
            match_score: Base score for matching elements (added to similarity).
            mismatch_penalty: Penalty for mismatched elements.
            gap_penalty: Penalty for gaps in alignment.
            similarity_weight: Weight for external similarity scores.
        """
        self.match_score = match_score
        self.mismatch_penalty = mismatch_penalty
        self.gap_penalty = gap_penalty
        self.similarity_weight = similarity_weight

    def _compute_score(
        self,
        similarity: float,
        threshold: float = 0.5,
    ) -> float:
        """Compute alignment score based on similarity.

        Args:
            similarity: External similarity score (0.0 to 1.0).
            threshold: Threshold above which elements are considered matching.

        Returns:
            Alignment score for this pair.
        """
        if similarity >= threshold:
            return self.match_score + (similarity * self.similarity_weight)
        else:
            return self.mismatch_penalty + (similarity * self.similarity_weight)

    def align(
        self,
        similarity_matrix: NDArray[np.float32],
        threshold: float = 0.5,
    ) -> SequenceAlignment:
        """Perform Smith-Waterman local alignment using similarity matrix.

        Args:
            similarity_matrix: Pre-computed similarity matrix (n x m).
            threshold: Similarity threshold for considering a match.

        Returns:
            SequenceAlignment with optimal local alignment.
        """
        n, m = similarity_matrix.shape
        if n == 0 or m == 0:
            return SequenceAlignment(
                path=[],
                score=0.0,
                source_aligned=[],
                target_aligned=[],
                score_matrix=np.array([]),
                gap_count=0,
                identity=0.0,
            )

        score_matrix = np.zeros((n + 1, m + 1), dtype=np.float32)
        traceback = np.zeros((n + 1, m + 1), dtype=np.int8)

        max_score = 0.0
        max_pos = (0, 0)

        for i in range(1, n + 1):
            for j in range(1, m + 1):
                sim = float(similarity_matrix[i - 1, j - 1])
                match = score_matrix[i - 1, j - 1] + self._compute_score(sim, threshold)
                delete = score_matrix[i - 1, j] + self.gap_penalty
                insert = score_matrix[i, j - 1] + self.gap_penalty

                best = max(0.0, match, delete, insert)
                score_matrix[i, j] = best

                if best == 0:
                    traceback[i, j] = AlignmentDirection.NONE.value
                elif best == match:
                    traceback[i, j] = AlignmentDirection.DIAGONAL.value
                elif best == delete:
                    traceback[i, j] = AlignmentDirection.UP.value
                else:
                    traceback[i, j] = AlignmentDirection.LEFT.value

                if best > max_score:
                    max_score = best
                    max_pos = (i, j)

        path = []
        source_aligned = []
        target_aligned = []
        gap_count = 0
        i, j = max_pos

        while i > 0 and j > 0 and score_matrix[i, j] > 0:
            direction = AlignmentDirection(traceback[i, j])

            if direction == AlignmentDirection.DIAGONAL:
                sim = float(similarity_matrix[i - 1, j - 1])
                path.append(
                    AlignmentPath(
                        source_idx=i - 1,
                        target_idx=j - 1,
                        score=sim,
                        is_gap=False,
                    )
                )
                source_aligned.append(i - 1)
                target_aligned.append(j - 1)
                i -= 1
                j -= 1
            elif direction == AlignmentDirection.UP:
                path.append(
                    AlignmentPath(
                        source_idx=i - 1,
                        target_idx=-1,
                        score=0.0,
                        is_gap=True,
                    )
                )
                gap_count += 1
                i -= 1
            elif direction == AlignmentDirection.LEFT:
                path.append(
                    AlignmentPath(
                        source_idx=-1,
                        target_idx=j - 1,
                        score=0.0,
                        is_gap=True,
                    )
                )
                gap_count += 1
                j -= 1
            else:
                break

        path.reverse()
        source_aligned.reverse()
        target_aligned.reverse()

        matches = sum(1 for p in path if not p.is_gap and p.score >= threshold)
        identity = matches / len(path) if path else 0.0

        return SequenceAlignment(
            path=path,
            score=float(max_score),
            source_aligned=source_aligned,
            target_aligned=target_aligned,
            score_matrix=score_matrix,
            gap_count=gap_count,
            identity=identity,
        )

    def align_with_scores(
        self,
        source_ids: list[str],
        target_ids: list[str],
        similarity_matrix: NDArray[np.float32],
        threshold: float = 0.5,
    ) -> dict:
        """Align and return a detailed result dict with IDs.

        Args:
            source_ids: IDs for source sequence elements.
            target_ids: IDs for target sequence elements.
            similarity_matrix: Pre-computed similarity matrix.
            threshold: Similarity threshold for matching.

        Returns:
            Dict with alignment details including mapped IDs.
        """
        alignment = self.align(similarity_matrix, threshold)

        aligned_pairs = []
        for p in alignment.path:
            if not p.is_gap:
                aligned_pairs.append(
                    {
                        "source_id": source_ids[p.source_idx],
                        "target_id": target_ids[p.target_idx],
                        "similarity": p.score,
                    }
                )

        return {
            "total_score": alignment.score,
            "aligned_pairs": aligned_pairs,
            "source_coverage": len(set(alignment.source_aligned)) / len(source_ids)
            if source_ids
            else 0.0,
            "target_coverage": len(set(alignment.target_aligned)) / len(target_ids)
            if target_ids
            else 0.0,
            "gap_count": alignment.gap_count,
            "identity": alignment.identity,
            "path_length": len(alignment.path),
        }

    def multi_align(
        self,
        similarity_matrix: NDArray[np.float32],
        top_k: int = 3,
        threshold: float = 0.5,
    ) -> list[SequenceAlignment]:
        """Find multiple non-overlapping local alignments.

        Args:
            similarity_matrix: Pre-computed similarity matrix.
            top_k: Maximum number of alignments to find.
            threshold: Similarity threshold for matching.

        Returns:
            List of non-overlapping SequenceAlignments.
        """
        alignments = []
        used_source = set()
        used_target = set()

        sim_copy = similarity_matrix.copy()

        for _ in range(top_k):
            alignment = self.align(sim_copy, threshold)

            if alignment.score < 1.0 or not alignment.path:
                break

            alignments.append(alignment)

            for p in alignment.path:
                if p.source_idx >= 0:
                    used_source.add(p.source_idx)
                    sim_copy[p.source_idx, :] = -1.0
                if p.target_idx >= 0:
                    used_target.add(p.target_idx)
                    sim_copy[:, p.target_idx] = -1.0

        return alignments
