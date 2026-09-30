import hashlib
import json
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime


def serialize_timestamp(val: Any) -> str:
    if isinstance(val, datetime):
        return val.isoformat()
    return str(val)


def generate_event_hash(
    passport_id: str,
    status: str,
    location: str,
    actor: str,
    timestamp: datetime,
    previous_hash: Optional[str],
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Computes a cryptographic SHA-256 hash representing the tamper-evident state
    of a lifecycle event linked with the previous event's hash.
    """
    payload = {
        "passport_id": passport_id,
        "status": status,
        "location": location,
        "actor": actor,
        "timestamp": serialize_timestamp(timestamp),
        "previous_hash": previous_hash if previous_hash else "GENESIS",
        "metadata": metadata or {},
    }

    # Deterministic canonical JSON serialization
    canonical_json = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()


def verify_lifecycle_chain(events: List[Any]) -> Tuple[bool, Optional[int], str]:
    """
    Verifies the cryptographic SHA-256 integrity of a passport's event chain.
    Returns: (is_valid, tampered_event_id, explanation_message)
    """
    if not events:
        return True, None, "No events recorded in chain."

    expected_prev_hash: Optional[str] = None

    for idx, event in enumerate(events):
        # 1. Check previous_hash link
        if idx == 0:
            if event.previous_hash is not None and event.previous_hash != "GENESIS":
                return (
                    False,
                    event.id,
                    f"Genesis event has invalid previous_hash '{event.previous_hash}' (expected None or GENESIS)",
                )
        else:
            if event.previous_hash != expected_prev_hash:
                return (
                    False,
                    event.id,
                    f"Hash link broken at event #{event.id} ({event.status}): expected previous hash '{expected_prev_hash}', got '{event.previous_hash}'",
                )

        # 2. Recompute hash
        try:
            meta = json.loads(event.metadata_json) if getattr(event, "metadata_json", None) else {}
        except Exception:
            meta = {}

        computed_hash = generate_event_hash(
            passport_id=event.passport_id,
            status=event.status,
            location=event.location,
            actor=event.actor,
            timestamp=event.timestamp,
            previous_hash=event.previous_hash,
            metadata=meta,
        )

        if computed_hash != event.event_hash:
            return (
                False,
                event.id,
                f"Payload mismatch at event #{event.id} ({event.status}): recorded hash does not match computed SHA-256 digest!",
            )

        expected_prev_hash = event.event_hash

    return True, None, "All cryptographic SHA-256 signatures and chain links successfully verified."
