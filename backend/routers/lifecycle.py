import json
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, WastePassport, LifecycleEvent, GreenPoint
from app.schemas import LifecycleEventCreate, LifecycleEventResponse
from app.auth import get_current_user
from app.services.hash_chain import generate_event_hash

router = APIRouter(prefix="/passports", tags=["Lifecycle & Hash Chaining"])


VALID_STATUS_FLOW = [
    "REGISTERED",
    "COLLECTED",
    "STORED",
    "IN_TRANSIT",
    "AT_RECYCLER",
    "RECYCLED",
]


@router.post("/{passport_id}/events", response_model=LifecycleEventResponse)
def add_lifecycle_event(
    passport_id: str,
    payload: LifecycleEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Appends a new verified event to the passport lifecycle, cryptographically
    chaining its SHA-256 hash to the previous event's hash.
    """
    passport = db.query(WastePassport).filter(WastePassport.passport_id == passport_id).first()
    if not passport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Passport '{passport_id}' not found.",
        )

    # Fetch last event to link hashes
    last_event = (
        db.query(LifecycleEvent)
        .filter(LifecycleEvent.passport_id == passport_id)
        .order_by(LifecycleEvent.id.desc())
        .first()
    )

    prev_hash = last_event.event_hash if last_event else None
    now = datetime.datetime.utcnow()

    metadata = payload.metadata or {}
    metadata["logged_by_role"] = current_user.role
    metadata["logged_by_user_id"] = current_user.id

    new_hash = generate_event_hash(
        passport_id=passport_id,
        status=payload.status,
        location=payload.location,
        actor=payload.actor,
        timestamp=now,
        previous_hash=prev_hash,
        metadata=metadata,
    )

    event = LifecycleEvent(
        passport_id=passport_id,
        status=payload.status,
        location=payload.location,
        actor=payload.actor,
        timestamp=now,
        previous_hash=prev_hash,
        event_hash=new_hash,
        metadata_json=json.dumps(metadata),
    )
    db.add(event)

    # Update passport current status
    passport.current_status = payload.status
    passport.updated_at = now

    # If item reaches RECYCLED, credit +50 green points to original owner
    if payload.status == "RECYCLED":
        owner = db.query(User).filter(User.id == passport.user_id).first()
        if owner:
            bonus = 50
            owner.green_points += bonus
            db.add(
                GreenPoint(
                    user_id=owner.id,
                    passport_id=passport.passport_id,
                    points=bonus,
                    reason=f"Recycling verified complete by certified facility: {passport.object_name}",
                )
            )

    db.commit()
    db.refresh(event)
    return event


@router.get("/{passport_id}/events", response_model=List[LifecycleEventResponse])
def get_passport_events(
    passport_id: str,
    db: Session = Depends(get_db),
):
    events = (
        db.query(LifecycleEvent)
        .filter(LifecycleEvent.passport_id == passport_id)
        .order_by(LifecycleEvent.id.asc())
        .all()
    )
    return events
