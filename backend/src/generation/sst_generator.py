"""
SST Content Generator - Auto-generates dark adaptation content from BST canon.
Uses rule-based transformations and mutation patterns.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
import re


@dataclass
class SSTGenerationResult:
    """Result of SST content generation."""

    original_bst: str
    generated_sst: str
    transformations_applied: List[str]
    confidence_score: float
    warnings: List[str]


class SSTContentGenerator:
    """
    Generator for creating SST (dark adaptation) content from BST (canon).

    Applies narrative transformation rules to create darker, more intense
    versions of canonical content while maintaining story coherence.
    """

    # Transformation rules for darkening content
    DARKENING_RULES = {
        "intensify_emotion": {
            "pattern": r"\b(sad|upset|worried)\b",
            "replacement": r"devastated",
            "description": "Intensify negative emotions",
        },
        "heighten_stakes": {
            "pattern": r"\b(risk|danger)\b",
            "replacement": r"life-threatening peril",
            "description": "Heighten stakes to life-or-death",
        },
        "add_corruption": {
            "pattern": r"\b(tempted|drawn to)\b",
            "replacement": r"consumed by",
            "description": "Add corruption/obsession elements",
        },
        "intensify_power": {
            "pattern": r"\b(strong|powerful)\b",
            "replacement": r"terrifyingly powerful",
            "description": "Intensify supernatural abilities",
        },
        "darken_atmosphere": {
            "pattern": r"\b(dark|shadowy)\b",
            "replacement": r"oppressively dark, suffocating",
            "description": "Intensify atmospheric darkness",
        },
    }

    # Trait transformations
    TRAIT_TRANSFORMATIONS = {
        "noble": "ruthlessly pragmatic",
        "kind": "calculating",
        "brave": "recklessly fearless",
        "loyal": "obsessively devoted",
        "honest": "brutally direct",
        "merciful": "ruthless",
        "patient": "coldly methodical",
    }

    def __init__(self, intensity: float = 0.7):
        """
        Initialize the SST generator.

        Args:
            intensity: How intense the dark adaptation should be (0.0-1.0)
        """
        self.intensity = intensity

    def transform_description(
        self, bst_description: str, element_type: str = "mythos"
    ) -> SSTGenerationResult:
        """
        Transform a BST description into SST dark adaptation.

        Args:
            bst_description: Original canonical description
            element_type: Type of narrative element (mythos, character, etc.)

        Returns:
            SSTGenerationResult with generated content and metadata
        """
        sst_description = bst_description
        transformations = []
        warnings = []

        # Apply darkening rules
        for rule_name, rule in self.DARKENING_RULES.items():
            if re.search(rule["pattern"], sst_description, re.IGNORECASE):
                sst_description = re.sub(
                    rule["pattern"], rule["replacement"], sst_description, flags=re.IGNORECASE
                )
                transformations.append(rule["description"])

        # Add dark adaptation framing
        if element_type == "mythos":
            sst_description = self._add_mythos_darkness(sst_description)
            transformations.append("Added mythos darkness framing")
        elif element_type == "character":
            sst_description = self._add_character_corruption(sst_description)
            transformations.append("Added character corruption elements")

        # Calculate confidence
        confidence = min(0.95, 0.5 + (len(transformations) * 0.1))

        # Generate warnings if too few transformations
        if len(transformations) < 2:
            warnings.append("Low transformation count - content may be too similar to BST")

        return SSTGenerationResult(
            original_bst=bst_description,
            generated_sst=sst_description,
            transformations_applied=transformations,
            confidence_score=confidence,
            warnings=warnings,
        )

    def transform_traits(self, bst_traits: List[str]) -> List[str]:
        """
        Transform BST traits into darker SST versions.

        Args:
            bst_traits: List of canonical traits

        Returns:
            List of dark-adapted traits
        """
        sst_traits = []

        for trait in bst_traits:
            trait_lower = trait.lower()
            if trait_lower in self.TRAIT_TRANSFORMATIONS:
                sst_traits.append(self.TRAIT_TRANSFORMATIONS[trait_lower])
            else:
                # Add "dark" or "corrupted" prefix
                sst_traits.append(f"corrupted {trait}")

        return sst_traits

    def _add_mythos_darkness(self, description: str) -> str:
        """Add mythos-specific darkness elements."""
        dark_prefixes = [
            "In its darkest form, ",
            "When pushed to extremes, ",
            "The hidden truth reveals that ",
            "Beneath the surface lies ",
        ]

        import random

        prefix = random.choice(dark_prefixes)

        # Capitalize first letter of description if adding prefix
        if description[0].islower():
            description = description[0].upper() + description[1:]

        return f"{prefix}{description} The cost is always greater than imagined."

    def _add_character_corruption(self, description: str) -> str:
        """Add character corruption elements."""
        corruption_suffixes = [
            " They no longer recognize themselves.",
            " The line between predator and prey has blurred.",
            " They embrace what they once feared.",
            " Their humanity erodes with each passing night.",
        ]

        import random

        suffix = random.choice(corruption_suffixes)

        return f"{description}{suffix}"

    def generate_divergences(self, bst_content: Dict, sst_content: Dict) -> List[Dict]:
        """
        Generate divergence points between BST and SST content.

        Args:
            bst_content: BST version data
            sst_content: SST version data

        Returns:
            List of divergence descriptions
        """
        divergences = []

        # Compare descriptions
        if bst_content.get("description") != sst_content.get("description"):
            divergences.append(
                {
                    "kind": "narrative_tone",
                    "bst": "Canonical tone - grounded, restrained",
                    "sst": "Dark adaptation - intense, visceral",
                }
            )

        # Compare traits
        bst_traits = set(bst_content.get("traits", []))
        sst_traits = set(sst_content.get("traits", []))

        if bst_traits != sst_traits:
            divergences.append(
                {
                    "kind": "character_traits",
                    "bst": f"Traits: {', '.join(bst_traits)}",
                    "sst": f"Traits: {', '.join(sst_traits)}",
                }
            )

        return divergences


def generate_sst_from_bst(
    bst_data: Dict, element_type: str = "mythos", intensity: float = 0.7
) -> Dict:
    """
    Convenience function to generate SST content from BST data.

    Args:
        bst_data: BST version data with description, traits, etc.
        element_type: Type of element being transformed
        intensity: Transformation intensity (0.0-1.0)

    Returns:
        Dictionary with SST version and metadata
    """
    generator = SSTContentGenerator(intensity=intensity)

    # Transform description
    desc_result = generator.transform_description(bst_data.get("description", ""), element_type)

    # Transform traits
    sst_traits = generator.transform_traits(bst_data.get("traits", []))

    # Build SST data structure
    sst_data = {
        "description": desc_result.generated_sst,
        "traits": sst_traits,
        "abilities": bst_data.get("abilities", []),
        "weaknesses": bst_data.get("weaknesses", []),
        "generation_metadata": {
            "confidence": desc_result.confidence_score,
            "transformations": desc_result.transformations_applied,
            "warnings": desc_result.warnings,
        },
    }

    return sst_data
