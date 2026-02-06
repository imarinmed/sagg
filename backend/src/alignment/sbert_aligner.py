"""SBERT-based semantic alignment for narrative elements."""

from dataclasses import dataclass, field
from typing import TypeVar

import numpy as np
from numpy.typing import NDArray

T = TypeVar("T")


@dataclass
class SimilarityMatch:
    """A single similarity match between two narrative elements."""

    source_id: str
    target_id: str
    source_text: str
    target_text: str
    score: float
    rank: int = 0


@dataclass
class AlignmentResult:
    """Result of SBERT alignment between two narrative sequences."""

    source_ids: list[str]
    target_ids: list[str]
    similarity_matrix: NDArray[np.float32]
    top_matches: list[SimilarityMatch]
    mean_similarity: float
    max_similarity: float
    alignment_coverage: float


@dataclass
class EmbeddingCache:
    """Cache for SBERT embeddings to avoid recomputation."""

    embeddings: dict[str, NDArray[np.float32]] = field(default_factory=dict)
    model_name: str = ""


class SBERTAligner:
    """Aligner using Sentence-BERT for semantic similarity matching.

    Uses cosine similarity between SBERT embeddings to find semantically
    similar narrative elements between BST and SST sequences.
    """

    DEFAULT_MODEL = "all-MiniLM-L6-v2"

    def __init__(self, model_name: str | None = None, cache: EmbeddingCache | None = None) -> None:
        """Initialize SBERT aligner.

        Args:
            model_name: SBERT model to use. Defaults to all-MiniLM-L6-v2.
            cache: Optional embedding cache for reuse across calls.
        """
        self.model_name = model_name or self.DEFAULT_MODEL
        self._model = None
        self._cache = cache or EmbeddingCache(model_name=self.model_name)

    @property
    def model(self):
        """Lazy-load SBERT model."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer

                self._model = SentenceTransformer(self.model_name)
            except ImportError as e:
                raise ImportError(
                    "sentence-transformers is required. "
                    "Install with: pip install sentence-transformers"
                ) from e
        return self._model

    def encode(self, texts: list[str], ids: list[str] | None = None) -> NDArray[np.float32]:
        """Encode texts to embeddings, using cache when available.

        Args:
            texts: List of text strings to encode.
            ids: Optional IDs for caching. If provided, cached embeddings are used.

        Returns:
            Numpy array of shape (len(texts), embedding_dim).
        """
        if ids is None:
            return self.model.encode(texts, convert_to_numpy=True)

        embeddings_list = []
        texts_to_encode = []
        indices_to_encode = []

        for i, (text, id_) in enumerate(zip(texts, ids, strict=False)):
            if id_ in self._cache.embeddings:
                embeddings_list.append((i, self._cache.embeddings[id_]))
            else:
                texts_to_encode.append(text)
                indices_to_encode.append(i)

        if texts_to_encode:
            new_embeddings = self.model.encode(texts_to_encode, convert_to_numpy=True)
            for idx, emb in zip(indices_to_encode, new_embeddings, strict=False):
                self._cache.embeddings[ids[idx]] = emb
                embeddings_list.append((idx, emb))

        embeddings_list.sort(key=lambda x: x[0])
        return np.array([emb for _, emb in embeddings_list])

    def cosine_similarity(
        self, embeddings_a: NDArray[np.float32], embeddings_b: NDArray[np.float32]
    ) -> NDArray[np.float32]:
        """Compute cosine similarity matrix between two sets of embeddings.

        Args:
            embeddings_a: Array of shape (n, dim).
            embeddings_b: Array of shape (m, dim).

        Returns:
            Similarity matrix of shape (n, m) with values in [-1, 1].
        """
        norm_a = embeddings_a / np.linalg.norm(embeddings_a, axis=1, keepdims=True)
        norm_b = embeddings_b / np.linalg.norm(embeddings_b, axis=1, keepdims=True)
        return np.dot(norm_a, norm_b.T).astype(np.float32)

    def align(
        self,
        source_texts: list[str],
        target_texts: list[str],
        source_ids: list[str] | None = None,
        target_ids: list[str] | None = None,
        top_k: int = 5,
        threshold: float = 0.5,
    ) -> AlignmentResult:
        """Align source texts to target texts using semantic similarity.

        Args:
            source_texts: BST narrative texts (e.g., beat summaries).
            target_texts: SST narrative texts to align against.
            source_ids: Optional IDs for source elements.
            target_ids: Optional IDs for target elements.
            top_k: Number of top matches to return per source.
            threshold: Minimum similarity score to include in matches.

        Returns:
            AlignmentResult with similarity matrix and top matches.
        """
        if not source_texts or not target_texts:
            return AlignmentResult(
                source_ids=source_ids or [],
                target_ids=target_ids or [],
                similarity_matrix=np.array([]),
                top_matches=[],
                mean_similarity=0.0,
                max_similarity=0.0,
                alignment_coverage=0.0,
            )

        src_ids = source_ids or [f"src_{i}" for i in range(len(source_texts))]
        tgt_ids = target_ids or [f"tgt_{i}" for i in range(len(target_texts))]

        source_emb = self.encode(source_texts, src_ids)
        target_emb = self.encode(target_texts, tgt_ids)

        similarity_matrix = self.cosine_similarity(source_emb, target_emb)

        top_matches = []
        matched_targets = set()

        for i, src_id in enumerate(src_ids):
            row = similarity_matrix[i]
            top_indices = np.argsort(row)[::-1][:top_k]

            for rank, j in enumerate(top_indices):
                score = float(row[j])
                if score >= threshold:
                    match = SimilarityMatch(
                        source_id=src_id,
                        target_id=tgt_ids[j],
                        source_text=source_texts[i][:200],
                        target_text=target_texts[j][:200],
                        score=score,
                        rank=rank + 1,
                    )
                    top_matches.append(match)
                    matched_targets.add(j)

        top_matches.sort(key=lambda m: m.score, reverse=True)

        mean_sim = float(np.mean(similarity_matrix)) if similarity_matrix.size > 0 else 0.0
        max_sim = float(np.max(similarity_matrix)) if similarity_matrix.size > 0 else 0.0
        coverage = len(matched_targets) / len(tgt_ids) if tgt_ids else 0.0

        return AlignmentResult(
            source_ids=src_ids,
            target_ids=tgt_ids,
            similarity_matrix=similarity_matrix,
            top_matches=top_matches,
            mean_similarity=mean_sim,
            max_similarity=max_sim,
            alignment_coverage=coverage,
        )

    def find_best_match(
        self, query_text: str, candidates: list[str], candidate_ids: list[str] | None = None
    ) -> SimilarityMatch | None:
        """Find the single best matching candidate for a query.

        Args:
            query_text: Text to find match for.
            candidates: List of candidate texts.
            candidate_ids: Optional IDs for candidates.

        Returns:
            Best matching SimilarityMatch or None if no candidates.
        """
        if not candidates:
            return None

        result = self.align(
            source_texts=[query_text],
            target_texts=candidates,
            source_ids=["query"],
            target_ids=candidate_ids,
            top_k=1,
            threshold=0.0,
        )

        return result.top_matches[0] if result.top_matches else None

    def batch_align(
        self,
        pairs: list[tuple[str, str]],
    ) -> list[float]:
        """Compute similarity scores for pre-paired texts.

        Args:
            pairs: List of (text_a, text_b) tuples to compare.

        Returns:
            List of similarity scores for each pair.
        """
        if not pairs:
            return []

        texts_a, texts_b = zip(*pairs, strict=False)
        emb_a = self.encode(list(texts_a))
        emb_b = self.encode(list(texts_b))

        norm_a = emb_a / np.linalg.norm(emb_a, axis=1, keepdims=True)
        norm_b = emb_b / np.linalg.norm(emb_b, axis=1, keepdims=True)

        scores = np.sum(norm_a * norm_b, axis=1)
        return scores.tolist()
