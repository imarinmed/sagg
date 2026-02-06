"""
Advanced Consistency Solver with Rule Engine.
Implements forward-chaining inference for narrative consistency.
"""

from typing import Dict, List, Set, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import json


class RuleType(Enum):
    """Types of consistency rules."""

    TEMPORAL = "temporal"
    CAUSAL = "causal"
    CHARACTER = "character"
    MYTHOS = "mythos"
    NARRATIVE = "narrative"


@dataclass
class Fact:
    """A fact in the knowledge base."""

    predicate: str
    subject: str
    object: str
    confidence: float = 1.0
    source: str = "inferred"

    def __hash__(self):
        return hash((self.predicate, self.subject, self.object))

    def __eq__(self, other):
        if not isinstance(other, Fact):
            return False
        return (
            self.predicate == other.predicate
            and self.subject == other.subject
            and self.object == other.object
        )


@dataclass
class Rule:
    """A consistency rule for inference."""

    name: str
    rule_type: RuleType
    premises: List[Fact]
    conclusion: Fact
    confidence_factor: float = 1.0
    description: str = ""

    def evaluate(self, facts: Set[Fact]) -> Optional[Fact]:
        """
        Evaluate if rule can fire given current facts.

        Returns:
            Inferred fact if all premises match, None otherwise
        """
        # Check if all premises are satisfied
        for premise in self.premises:
            if not any(
                f.predicate == premise.predicate
                and f.subject == premise.subject
                and f.object == premise.object
                for f in facts
            ):
                return None

        # Calculate confidence
        inferred_confidence = (
            min(f.confidence for f in facts if f.predicate in [p.predicate for p in self.premises])
            * self.confidence_factor
        )

        return Fact(
            predicate=self.conclusion.predicate,
            subject=self.conclusion.subject,
            object=self.conclusion.object,
            confidence=inferred_confidence,
            source=f"inferred_from_{self.name}",
        )


@dataclass
class ConsistencyIssue:
    """A consistency violation found by the solver."""

    issue_type: str
    severity: str  # 'error', 'warning', 'info'
    description: str
    affected_entities: List[str]
    suggested_fix: Optional[str] = None
    rule_triggered: Optional[str] = None


class RuleEngine:
    """
    Forward-chaining rule engine for narrative consistency.

    Maintains a knowledge base of facts and applies rules to infer
    new facts and detect inconsistencies.
    """

    def __init__(self):
        self.facts: Set[Fact] = set()
        self.rules: List[Rule] = []
        self.inferred_facts: Set[Fact] = set()
        self.issues: List[ConsistencyIssue] = []

    def add_fact(self, fact: Fact):
        """Add a fact to the knowledge base."""
        self.facts.add(fact)

    def add_rule(self, rule: Rule):
        """Add a consistency rule."""
        self.rules.append(rule)

    def load_default_rules(self):
        """Load default narrative consistency rules."""

        # Rule: If A causes B, and B causes C, then A indirectly causes C
        self.add_rule(
            Rule(
                name="causal_transitivity",
                rule_type=RuleType.CAUSAL,
                premises=[Fact("causes", "?a", "?b"), Fact("causes", "?b", "?c")],
                conclusion=Fact("indirectly_causes", "?a", "?c"),
                confidence_factor=0.9,
                description="Transitivity of causation",
            )
        )

        # Rule: If character appears in episode, they must exist
        self.add_rule(
            Rule(
                name="character_existence",
                rule_type=RuleType.CHARACTER,
                premises=[Fact("appears_in", "?character", "?episode")],
                conclusion=Fact("exists", "?character", "true"),
                confidence_factor=1.0,
                description="Characters in episodes must exist",
            )
        )

        # Rule: If beat A is before beat B, and B is before C, then A is before C
        self.add_rule(
            Rule(
                name="temporal_transitivity",
                rule_type=RuleType.TEMPORAL,
                premises=[Fact("before", "?a", "?b"), Fact("before", "?b", "?c")],
                conclusion=Fact("before", "?a", "?c"),
                confidence_factor=1.0,
                description="Temporal ordering is transitive",
            )
        )

        # Rule: No self-causation
        self.add_rule(
            Rule(
                name="no_self_causation",
                rule_type=RuleType.CAUSAL,
                premises=[Fact("causes", "?x", "?x")],
                conclusion=Fact("inconsistent", "self_causation", "?x"),
                confidence_factor=1.0,
                description="Nothing can cause itself",
            )
        )

    def run_inference(self, max_iterations: int = 10) -> Set[Fact]:
        """
        Run forward-chaining inference.

        Args:
            max_iterations: Maximum number of inference iterations

        Returns:
            Set of all inferred facts
        """
        new_facts = True
        iteration = 0

        while new_facts and iteration < max_iterations:
            new_facts = False
            iteration += 1

            for rule in self.rules:
                # Try to match rule premises
                matches = self._match_rule_premises(rule)

                for match in matches:
                    # Substitute variables in conclusion
                    conclusion = self._substitute_variables(rule.conclusion, match)

                    # Add inferred fact if not already known
                    if conclusion not in self.facts and conclusion not in self.inferred_facts:
                        self.inferred_facts.add(conclusion)
                        new_facts = True

        return self.inferred_facts

    def check_consistency(self) -> List[ConsistencyIssue]:
        """
        Check for consistency violations.

        Returns:
            List of consistency issues found
        """
        self.issues = []

        # Check for inferred inconsistencies
        for fact in self.inferred_facts:
            if fact.predicate == "inconsistent":
                self.issues.append(
                    ConsistencyIssue(
                        issue_type=fact.object,
                        severity="error",
                        description=f"Inconsistency detected: {fact.object}",
                        affected_entities=[fact.subject],
                        rule_triggered=fact.source,
                    )
                )

        # Check for temporal contradictions
        self._check_temporal_consistency()

        # Check for causal loops
        self._check_causal_loops()

        return self.issues

    def _match_rule_premises(self, rule: Rule) -> List[Dict[str, str]]:
        """Find all ways to match rule premises to facts."""
        # Simplified matching - in practice would use unification
        matches = []

        # Check if we have facts that could match premises
        # This is a simplified version
        if len(rule.premises) <= len(self.facts):
            # Create a potential match with variables
            match = {}
            for premise in rule.premises:
                for fact in self.facts:
                    if premise.predicate == fact.predicate:
                        # Extract variable bindings
                        if premise.subject.startswith("?"):
                            match[premise.subject] = fact.subject
                        if premise.object.startswith("?"):
                            match[premise.object] = fact.object

            if len(match) >= len(rule.premises):
                matches.append(match)

        return matches

    def _substitute_variables(self, fact: Fact, bindings: Dict[str, str]) -> Fact:
        """Substitute variable bindings into a fact template."""
        return Fact(
            predicate=fact.predicate,
            subject=bindings.get(fact.subject, fact.subject),
            object=bindings.get(fact.object, fact.object),
            confidence=fact.confidence,
            source=fact.source,
        )

    def _check_temporal_consistency(self):
        """Check for temporal ordering contradictions."""
        before_facts = [f for f in self.facts.union(self.inferred_facts) if f.predicate == "before"]

        # Check for cycles
        for fact in before_facts:
            # If A before B, check that B is not before A
            reverse = Fact("before", fact.object, fact.subject)
            if reverse in self.facts or reverse in self.inferred_facts:
                self.issues.append(
                    ConsistencyIssue(
                        issue_type="temporal_contradiction",
                        severity="error",
                        description=f"Temporal contradiction: {fact.subject} cannot be both before and after {fact.object}",
                        affected_entities=[fact.subject, fact.object],
                    )
                )

    def _check_causal_loops(self):
        """Check for causal loops in the narrative."""
        causes_facts = [
            f
            for f in self.facts.union(self.inferred_facts)
            if f.predicate in ["causes", "indirectly_causes"]
        ]

        # Build causality graph
        graph: Dict[str, Set[str]] = {}
        for fact in causes_facts:
            if fact.subject not in graph:
                graph[fact.subject] = set()
            graph[fact.subject].add(fact.object)

        # Check for cycles using DFS
        def has_cycle(node: str, visited: Set[str], path: Set[str]) -> bool:
            if node in path:
                return True
            if node in visited:
                return False

            visited.add(node)
            path.add(node)

            for neighbor in graph.get(node, []):
                if has_cycle(neighbor, visited, path):
                    return True

            path.remove(node)
            return False

        for node in graph:
            if has_cycle(node, set(), set()):
                self.issues.append(
                    ConsistencyIssue(
                        issue_type="causal_loop",
                        severity="error",
                        description=f"Causal loop detected involving {node}",
                        affected_entities=[node],
                        suggested_fix="Break the cycle by removing one causal link",
                    )
                )

    def explain_issue(self, issue: ConsistencyIssue) -> str:
        """Generate human-readable explanation of an issue."""
        explanation = f"Issue: {issue.issue_type}\n"
        explanation += f"Severity: {issue.severity}\n"
        explanation += f"Description: {issue.description}\n"
        explanation += f"Affected: {', '.join(issue.affected_entities)}\n"

        if issue.suggested_fix:
            explanation += f"Suggested fix: {issue.suggested_fix}\n"

        if issue.rule_triggered:
            explanation += f"Rule triggered: {issue.rule_triggered}\n"

        return explanation


def run_advanced_validation() -> Dict:
    """
    Run the advanced consistency solver on narrative data.

    Returns:
        Validation report with issues and inferred facts
    """
    engine = RuleEngine()
    engine.load_default_rules()

    # Load facts from data
    from src.data import beats_db, causality_edges_db

    # Add temporal facts from beats
    sorted_beats = sorted(beats_db.values(), key=lambda b: (b.episode_id, b.timestamp))
    for i in range(len(sorted_beats) - 1):
        engine.add_fact(
            Fact(
                predicate="before",
                subject=sorted_beats[i].beat_id,
                object=sorted_beats[i + 1].beat_id,
                source="data",
            )
        )

    # Add causal facts from edges
    for edge in causality_edges_db.values():
        engine.add_fact(
            Fact(predicate="causes", subject=edge.from_beat, object=edge.to_beat, source="data")
        )

    # Run inference
    inferred = engine.run_inference()

    # Check consistency
    issues = engine.check_consistency()

    return {
        "total_facts": len(engine.facts),
        "inferred_facts": len(inferred),
        "issues_found": len(issues),
        "issues": [
            {
                "type": i.issue_type,
                "severity": i.severity,
                "description": i.description,
                "entities": i.affected_entities,
            }
            for i in issues
        ],
        "is_consistent": len([i for i in issues if i.severity == "error"]) == 0,
    }
