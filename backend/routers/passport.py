import uuid
import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, WastePassport, LifecycleEvent, GreenPoint
from app.schemas import (
    WastePassportCreate,
    WastePassportResponse,
    WastePassportDetailResponse,
    ChainVerificationResponse,
    LifecycleEventResponse,
)
from app.auth import get_current_user
from app.services.qr_service import generate_passport_qr_data_uri
from app.services.hash_chain import generate_event_hash, verify_lifecycle_chain

router = APIRouter(tags=["Digital Waste Passports"])


def create_unique_passport_id() -> str:
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"ET-2026-{short_uuid}"


@router.post("/passports", response_model=WastePassportDetailResponse)
def create_passport(
    payload: WastePassportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new Digital Waste Passport with embedded QR identifier and
    registers the Genesis Lifecycle Event in the tamper-evident SHA-256 chain.
    """
    passport_id = create_unique_passport_id()
    qr_data_uri = generate_passport_qr_data_uri(passport_id)

    passport = WastePassport(
        passport_id=passport_id,
        waste_scan_id=payload.scan_id,
        user_id=current_user.id,
        waste_type=payload.waste_type,
        object_name=payload.object_name,
        weight_kg=payload.weight_kg,
        qr_token=passport_id,
        qr_code_image=qr_data_uri,
        current_status="REGISTERED",
        recycler_partner=payload.recycler_partner or "EcoTrace Certified Recyclers",
    )
    db.add(passport)
    db.flush()

    # Genesis event in the SHA-256 chain
    now = datetime.datetime.utcnow()
    genesis_location = "Campus Eco-Drop Hub #1"
    genesis_actor = f"{current_user.name} (Citizen Submitter)"
    genesis_metadata = {
        "device_weight_kg": payload.weight_kg,
        "initial_category": payload.waste_type,
        "sdg_target": "SDG 11.6 - Reduce environmental impact of cities",
    }

    genesis_hash = generate_event_hash(
        passport_id=passport_id,
        status="REGISTERED",
        location=genesis_location,
        actor=genesis_actor,
        timestamp=now,
        previous_hash=None,
        metadata=genesis_metadata,
    )

    genesis_event = LifecycleEvent(
        passport_id=passport_id,
        status="REGISTERED",
        location=genesis_location,
        actor=genesis_actor,
        timestamp=now,
        previous_hash=None,
        event_hash=genesis_hash,
        metadata_json=json.dumps(genesis_metadata),
    )
    db.add(genesis_event)

    # Award +25 green points for registering an item with passport
    reward_points = 25
    current_user.green_points += reward_points
    db.add(
        GreenPoint(
            user_id=current_user.id,
            passport_id=passport_id,
            points=reward_points,
            reason=f"Registered Digital Waste Passport: {payload.object_name}",
        )
    )

    db.commit()
    db.refresh(passport)

    response = WastePassportDetailResponse.model_validate(passport)
    response.events = [LifecycleEventResponse.model_validate(genesis_event)]
    response.user_name = current_user.name
    return response


@router.get("/passports", response_model=List[WastePassportResponse])
def get_passports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns passports. Users see their own passports; Admins see all passports.
    """
    if current_user.role == "ADMIN":
        passports = db.query(WastePassport).order_by(WastePassport.created_at.desc()).all()
    else:
        passports = (
            db.query(WastePassport)
            .filter(WastePassport.user_id == current_user.id)
            .order_by(WastePassport.created_at.desc())
            .all()
        )
    return passports


@router.get("/passports/{passport_id}", response_model=WastePassportDetailResponse)
def get_passport(
    passport_id: str,
    db: Session = Depends(get_db),
):
    passport = db.query(WastePassport).filter(WastePassport.passport_id == passport_id).first()
    if not passport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste Passport '{passport_id}' not found.",
        )

    events = (
        db.query(LifecycleEvent)
        .filter(LifecycleEvent.passport_id == passport_id)
        .order_by(LifecycleEvent.id.asc())
        .all()
    )

    owner = db.query(User).filter(User.id == passport.user_id).first()

    res = WastePassportDetailResponse.model_validate(passport)
    res.events = [LifecycleEventResponse.model_validate(e) for e in events]
    res.user_name = owner.name if owner else "EcoTrace User"
    return res


@router.get("/passports/{passport_id}/verify", response_model=ChainVerificationResponse)
def verify_passport(
    passport_id: str,
    db: Session = Depends(get_db),
):
    """
    Cryptographically verifies the SHA-256 hash chain of the passport lifecycle.
    """
    passport = db.query(WastePassport).filter(WastePassport.passport_id == passport_id).first()
    if not passport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste Passport '{passport_id}' not found.",
        )

    events = (
        db.query(LifecycleEvent)
        .filter(LifecycleEvent.passport_id == passport_id)
        .order_by(LifecycleEvent.id.asc())
        .all()
    )

    is_valid, tampered_id, message = verify_lifecycle_chain(events)

    return ChainVerificationResponse(
        passport_id=passport_id,
        is_valid=is_valid,
        status_summary="VERIFIED_AUTHENTIC" if is_valid else "TAMPER_DETECTED",
        events_count=len(events),
        events=[LifecycleEventResponse.model_validate(e) for e in events],
        current_status=passport.current_status,
        tampered_event_id=tampered_id,
        verification_message=message,
    )


@router.get("/verify/{passport_id}", response_model=ChainVerificationResponse)
def public_verify_passport(
    passport_id: str,
    db: Session = Depends(get_db),
):
    """
    Public QR verification endpoint (accessible without login) so anyone scanning the
    physical QR tag on an e-waste item can verify its authenticity and lifecycle status.
    """
    return verify_passport(passport_id=passport_id, db=db)
