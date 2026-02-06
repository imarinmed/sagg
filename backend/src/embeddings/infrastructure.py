"""
Embeddings Infrastructure for narrative similarity and search.
Manages vector embeddings of narrative content for semantic operations.
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import numpy as np
import json
import hashlib
from pathlib import Path


@dataclass
class EmbeddingVector:
    """A vector embedding with metadata."""

    id: str
    vector: np.ndarray
    text: str
    entity_type: str  # 'beat', 'character', 'mythos', 'episode'
    entity_id: str
    metadata: Dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "vector": self.vector.tolist(),
            "text": self.text,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "EmbeddingVector":
        """Create from dictionary."""
        return cls(
            id=data["id"],
            vector=np.array(data["vector"]),
            text=data["text"],
            entity_type=data["entity_type"],
            entity_id=data["entity_id"],
            metadata=data.get("metadata", {}),
        )


class EmbeddingStore:
    """
    Storage and retrieval for narrative embeddings.

    Provides efficient similarity search and caching of embeddings.
    """

    def __init__(self, cache_dir: Optional[str] = None):
        """
        Initialize the embedding store.

        Args:
            cache_dir: Directory to cache embeddings (optional)
        """
        self.embeddings: Dict[str, EmbeddingVector] = {}
        self.cache_dir = Path(cache_dir) if cache_dir else None

        if self.cache_dir:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
            self._load_cache()

    def add(self, embedding: EmbeddingVector):
        """Add an embedding to the store."""
        self.embeddings[embedding.id] = embedding

    def get(self, embedding_id: str) -> Optional[EmbeddingVector]:
        """Retrieve an embedding by ID."""
        return self.embeddings.get(embedding_id)

    def search_similar(
        self, query_vector: np.ndarray, top_k: int = 10, entity_type: Optional[str] = None
    ) -> List[Tuple[EmbeddingVector, float]]:
        """
        Search for similar embeddings using cosine similarity.

        Args:
            query_vector: Vector to search for
            top_k: Number of results to return
            entity_type: Filter by entity type (optional)

        Returns:
            List of (embedding, similarity_score) tuples
        """
        results = []

        for emb in self.embeddings.values():
            # Filter by entity type if specified
            if entity_type and emb.entity_type != entity_type:
                continue

            # Calculate cosine similarity
            similarity = self._cosine_similarity(query_vector, emb.vector)
            results.append((emb, similarity))

        # Sort by similarity (descending)
        results.sort(key=lambda x: x[1], reverse=True)

        return results[:top_k]

    def search_by_text(
        self, query_text: str, embedder, top_k: int = 10, entity_type: Optional[str] = None
    ) -> List[Tuple[EmbeddingVector, float]]:
        """
        Search by text query (embeds query then searches).

        Args:
            query_text: Text to search for
            embedder: Function to create embeddings
            top_k: Number of results
            entity_type: Filter by entity type

        Returns:
            List of (embedding, similarity_score) tuples
        """
        query_vector = embedder(query_text)
        return self.search_similar(query_vector, top_k, entity_type)

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return float(np.dot(a, b) / (norm_a * norm_b))

    def save_cache(self):
        """Save embeddings to cache."""
        if not self.cache_dir:
            return

        cache_file = self.cache_dir / "embeddings_cache.json"
        data = {"embeddings": [emb.to_dict() for emb in self.embeddings.values()]}

        with open(cache_file, "w") as f:
            json.dump(data, f)

    def _load_cache(self):
        """Load embeddings from cache."""
        if not self.cache_dir:
            return

        cache_file = self.cache_dir / "embeddings_cache.json"

        if not cache_file.exists():
            return

        try:
            with open(cache_file, "r") as f:
                data = json.load(f)

            for emb_data in data.get("embeddings", []):
                emb = EmbeddingVector.from_dict(emb_data)
                self.embeddings[emb.id] = emb

            print(f"Loaded {len(self.embeddings)} embeddings from cache")
        except Exception as e:
            print(f"Error loading cache: {e}")

    def get_stats(self) -> Dict:
        """Get statistics about the embedding store."""
        type_counts = {}
        for emb in self.embeddings.values():
            type_counts[emb.entity_type] = type_counts.get(emb.entity_type, 0) + 1

        return {
            "total_embeddings": len(self.embeddings),
            "by_type": type_counts,
            "vector_dimension": next(iter(self.embeddings.values())).vector.shape[0]
            if self.embeddings
            else 0,
        }


class EmbeddingGenerator:
    """
    Generator for creating embeddings from narrative content.

    Uses SBERT or other embedding models to create vector representations.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the embedding generator.

        Args:
            model_name: Name of the sentence-transformers model
        """
        self.model_name = model_name
        self.model = None

    def _load_model(self):
        """Lazy load the embedding model."""
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer

                self.model = SentenceTransformer(self.model_name)
            except ImportError:
                raise ImportError(
                    "sentence-transformers required. "
                    "Install with: pip install sentence-transformers"
                )

    def generate(self, text: str) -> np.ndarray:
        """
        Generate embedding for text.

        Args:
            text: Text to embed

        Returns:
            Vector embedding
        """
        self._load_model()
        return self.model.encode(text, convert_to_numpy=True)

    def generate_for_entity(
        self, entity_id: str, entity_type: str, text: str, metadata: Optional[Dict] = None
    ) -> EmbeddingVector:
        """
        Generate embedding for a narrative entity.

        Args:
            entity_id: Unique identifier for entity
            entity_type: Type of entity (beat, character, etc.)
            text: Text content to embed
            metadata: Additional metadata

        Returns:
            EmbeddingVector with generated embedding
        """
        vector = self.generate(text)

        # Create unique ID
        embedding_id = f"{entity_type}_{entity_id}_{self._hash_text(text)}"

        return EmbeddingVector(
            id=embedding_id,
            vector=vector,
            text=text,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata=metadata or {},
        )

    def _hash_text(self, text: str) -> str:
        """Create hash of text for ID generation."""
        return hashlib.md5(text.encode()).hexdigest()[:8]


class NarrativeSimilaritySearch:
    """
    High-level interface for narrative similarity search.

    Combines embedding generation and storage for easy similarity operations.
    """

    def __init__(self, cache_dir: Optional[str] = None):
        """
        Initialize the similarity search.

        Args:
            cache_dir: Directory to cache embeddings
        """
        self.store = EmbeddingStore(cache_dir)
        self.generator = EmbeddingGenerator()

    def index_entity(
        self, entity_id: str, entity_type: str, text: str, metadata: Optional[Dict] = None
    ):
        """
        Index a narrative entity for similarity search.

        Args:
            entity_id: Unique identifier
            entity_type: Type of entity
            text: Text content
            metadata: Additional metadata
        """
        embedding = self.generator.generate_for_entity(entity_id, entity_type, text, metadata)
        self.store.add(embedding)

    def find_similar(
        self, query_text: str, top_k: int = 10, entity_type: Optional[str] = None
    ) -> List[Tuple[EmbeddingVector, float]]:
        """
        Find entities similar to query text.

        Args:
            query_text: Text to search for
            top_k: Number of results
            entity_type: Filter by entity type

        Returns:
            List of (embedding, similarity) tuples
        """
        query_vector = self.generator.generate(query_text)
        return self.store.search_similar(query_vector, top_k, entity_type)

    def find_similar_to_entity(
        self, entity_id: str, top_k: int = 10, entity_type: Optional[str] = None
    ) -> List[Tuple[EmbeddingVector, float]]:
        """
        Find entities similar to a specific entity.

        Args:
            entity_id: ID of entity to search from
            top_k: Number of results
            entity_type: Filter by entity type

        Returns:
            List of (embedding, similarity) tuples
        """
        # Find the entity's embedding
        for emb in self.store.embeddings.values():
            if emb.entity_id == entity_id:
                return self.store.search_similar(emb.vector, top_k, entity_type)

        return []

    def save(self):
        """Save the embedding store to cache."""
        self.store.save_cache()

    def get_stats(self) -> Dict:
        """Get statistics about the indexed content."""
        return self.store.get_stats()


def build_narrative_embeddings(cache_dir: str = "data/embeddings") -> NarrativeSimilaritySearch:
    """
    Build embeddings for all narrative content.

    Args:
        cache_dir: Directory to cache embeddings

    Returns:
        NarrativeSimilaritySearch with all content indexed
    """
    search = NarrativeSimilaritySearch(cache_dir)

    # Import data
    from src.data import beats_db, characters_db, mythos_db

    # Index beats
    for beat_id, beat in beats_db.items():
        text = f"{beat.content} {' '.join(beat.tags)}"
        search.index_entity(
            beat_id,
            "beat",
            text,
            metadata={"episode": beat.episode_id, "timestamp": beat.timestamp},
        )

    # Index characters
    for char_id, char in characters_db.items():
        text = f"{char.name} {char.role}"
        if hasattr(char, "canonical_traits"):
            text += f" {' '.join(char.canonical_traits)}"

        search.index_entity(char_id, "character", text, metadata={"role": char.role})

    # Index mythos
    for myth_id, myth in mythos_db.items():
        text = f"{myth.name} {myth.description}"
        if hasattr(myth, "versions"):
            if "bst" in myth.versions:
                text += f" {myth.versions['bst'].get('description', '')}"

        search.index_entity(myth_id, "mythos", text, metadata={"category": myth.category})

    # Save cache
    search.save()

    return search
