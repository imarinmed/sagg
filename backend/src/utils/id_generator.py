def generate_beat_id(episode_id: str, sequence: int) -> str:
    """Generate beat ID: beat-s01e01-001"""
    return f"beat-{episode_id}-{sequence:03d}"


def generate_claim_id(sequence: int) -> str:
    """Generate claim ID: claim-0001"""
    return f"claim-{sequence:04d}"


def generate_edge_id(sequence: int) -> str:
    """Generate edge ID: edge-0001"""
    return f"edge-{sequence:04d}"


def validate_id_format(id_str: str, prefix: str) -> bool:
    """Validate ID starts with expected prefix"""
    return id_str.startswith(f"{prefix}-")
