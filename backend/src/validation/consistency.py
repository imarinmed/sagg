"""
Consistency validation for Shadow Lore Forge data.

Validates data integrity across beats, claims, edges, and relationships
to ensure referential consistency and logical correctness.
"""

from dataclasses import dataclass
from typing import Any

from src.data import beats_db, causality_edges_db, claims_db


@dataclass
class ValidationError:
    """A single validation error."""

    rule: str
    severity: str  # "error" | "warning"
    message: str
    context: dict[str, Any] | None = None


class ValidationReport:
    """Report of validation results."""

    def __init__(self):
        self.errors: list[ValidationError] = []
        self.warnings: list[ValidationError] = []
        self.passed_rules: list[str] = []

    def add_error(self, rule: str, message: str, context: dict[str, Any] | None = None):
        """Add an error to the report."""
        error = ValidationError(rule=rule, severity="error", message=message, context=context)
        self.errors.append(error)

    def add_warning(self, rule: str, message: str, context: dict[str, Any] | None = None):
        """Add a warning to the report."""
        warning = ValidationError(rule=rule, severity="warning", message=message, context=context)
        self.warnings.append(warning)

    def mark_passed(self, rule: str):
        """Mark a rule as passed."""
        self.passed_rules.append(rule)

    def is_valid(self) -> bool:
        """Check if validation passed (no errors)."""
        return len(self.errors) == 0

    def summary(self) -> dict[str, Any]:
        """Get summary of validation results."""
        return {
            "valid": self.is_valid(),
            "total_errors": len(self.errors),
            "total_warnings": len(self.warnings),
            "passed_rules": len(self.passed_rules),
            "errors": [
                {"rule": e.rule, "message": e.message, "context": e.context} for e in self.errors
            ],
            "warnings": [
                {"rule": w.rule, "message": w.message, "context": w.context} for w in self.warnings
            ],
        }


def validate_beat_id_existence(report: ValidationReport) -> None:
    """
    Validate that all beat IDs referenced in edges exist in beats database.

    Rule: All from_beat_id and to_beat_id in edges must reference existing beats.
    """
    rule_name = "beat_id_existence"

    # Get all beat IDs
    beat_ids = set(beats_db.keys())

    # Check all edges
    for edge in causality_edges_db.values():
        # Check from_beat_id
        if edge.get("from_beat_id") not in beat_ids:
            report.add_error(
                rule=rule_name,
                message=f"Edge references non-existent from_beat_id: {edge.get('from_beat_id')}",
                context={
                    "edge_id": edge.get("edge_id"),
                    "from_beat_id": edge.get("from_beat_id"),
                    "to_beat_id": edge.get("to_beat_id"),
                },
            )

        # Check to_beat_id
        if edge.get("to_beat_id") not in beat_ids:
            report.add_error(
                rule=rule_name,
                message=f"Edge references non-existent to_beat_id: {edge.get('to_beat_id')}",
                context={
                    "edge_id": edge.get("edge_id"),
                    "from_beat_id": edge.get("from_beat_id"),
                    "to_beat_id": edge.get("to_beat_id"),
                },
            )

    # If no errors were added, mark as passed
    if not any(e.rule == rule_name for e in report.errors):
        report.mark_passed(rule_name)


def validate_no_dangling_references(report: ValidationReport) -> None:
    """
    Validate that all entity_id references in claims exist.

    Rule: All subject/object/entity_id references in claims should point to valid entities.
    Note: This is a warning rather than error since some references may be implicit.
    """
    rule_name = "no_dangling_references"

    # Get all known entity IDs from beats and other sources
    known_entities = set(beats_db.keys())

    # Check claims for entity references
    dangling_count = 0
    for claim in claims_db.values():
        subject = claim.get("subject", "")

        # Check if subject looks like an ID (contains hyphens or underscores)
        if ("-" in subject or "_" in subject) and subject not in known_entities:
            dangling_count += 1
            # Only warn for first 10 to avoid spam
            if dangling_count <= 10:
                report.add_warning(
                    rule=rule_name,
                    message=f"Claim references potentially unknown entity: {subject}",
                    context={
                        "claim_id": claim.get("claim_id"),
                        "subject": subject,
                        "type": claim.get("type"),
                    },
                )

    if dangling_count == 0:
        report.mark_passed(rule_name)
    elif dangling_count > 10:
        report.add_warning(
            rule=rule_name,
            message=f"Found {dangling_count} potentially dangling references (showing first 10)",
            context={"total_dangling": dangling_count},
        )


def validate_no_self_loops(report: ValidationReport) -> None:
    """
    Validate that no edge has the same from_beat and to_beat.

    Rule: An edge cannot connect a beat to itself (no self-causal loops).
    """
    rule_name = "no_self_loops"

    for edge in causality_edges_db.values():
        from_beat = edge.get("from_beat_id")
        to_beat = edge.get("to_beat_id")

        if from_beat == to_beat:
            report.add_error(
                rule=rule_name,
                message=f"Edge has self-loop: {from_beat} -> {to_beat}",
                context={
                    "edge_id": edge.get("edge_id"),
                    "beat_id": from_beat,
                    "edge_type": edge.get("type"),
                },
            )

    if not any(e.rule == rule_name for e in report.errors):
        report.mark_passed(rule_name)


def validate_temporal_consistency(report: ValidationReport) -> None:
    rule_name = "temporal_consistency"

    for edge in causality_edges_db.values():
        from_beat_id = edge.get("from_beat_id")
        to_beat_id = edge.get("to_beat_id")

        from_beat = beats_db.get(from_beat_id)
        to_beat = beats_db.get(to_beat_id)

        if from_beat and to_beat:
            from_episode = from_beat.get("episode_id", "")
            to_episode = to_beat.get("episode_id", "")

            if from_episode == to_episode:
                from_seconds = from_beat.get("start_seconds", 0)
                to_seconds = to_beat.get("start_seconds", 0)

                if from_seconds > to_seconds:
                    report.add_error(
                        rule=rule_name,
                        message=f"Cause beat occurs after effect beat in same episode: "
                        f"{from_beat_id} ({from_seconds}s) -> {to_beat_id} ({to_seconds}s)",
                        context={
                            "edge_id": edge.get("edge_id"),
                            "from_beat_id": from_beat_id,
                            "to_beat_id": to_beat_id,
                            "episode_id": from_episode,
                            "from_seconds": from_seconds,
                            "to_seconds": to_seconds,
                            "edge_type": edge.get("type"),
                        },
                    )
            else:
                if from_episode > to_episode:
                    report.add_error(
                        rule=rule_name,
                        message=f"Cause beat from later episode than effect beat: "
                        f"{from_beat_id} ({from_episode}) -> {to_beat_id} ({to_episode})",
                        context={
                            "edge_id": edge.get("edge_id"),
                            "from_beat_id": from_beat_id,
                            "to_beat_id": to_beat_id,
                            "from_episode": from_episode,
                            "to_episode": to_episode,
                            "edge_type": edge.get("type"),
                        },
                    )

    if not any(e.rule == rule_name for e in report.errors):
        report.mark_passed(rule_name)


def run_validation() -> ValidationReport:
    """
    Run all consistency validation rules.

    Returns:
        ValidationReport with all validation results
    """
    report = ValidationReport()

    # Run all validation rules
    validate_beat_id_existence(report)
    validate_no_dangling_references(report)
    validate_no_self_loops(report)
    validate_temporal_consistency(report)

    return report
