import json
import datetime
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, WasteScan, WastePassport, LifecycleEvent, Bin
from app.schemas import AdminStatsResponse, WastePassportDetailResponse, WasteScanResponse
from app.auth import get_current_admin
from app.services.impact import calculate_environmental_impact
from app.services.hash_chain import generate_event_hash

router = APIRouter(prefix="/admin", tags=["Admin Command Center"])

LIFECYCLE_STAGES = [
    "REGISTERED",
    "COLLECTED",
    "STORED",
    "IN_TRANSIT",
    "AT_RECYCLER",
    "RECYCLED",
]

STAGE_DETAILS = {
    "COLLECTED": {
        "location": "Campus Collection Fleet Van #4",
        "actor": "Fleet Custodian Mark Vance",
    },
    "STORED": {
        "location": "Campus Central Hazardous Storage Facility",
        "actor": "Facility Supervisor Elena Rostova",
    },
    "IN_TRANSIT": {
        "location": "Regional Green Hauler Transit Vehicle #82",
        "actor": "Certified Logistics Handler Davis",
    },
    "AT_RECYCLER": {
        "location": "EcoCycle State-of-the-Art Processing Center",
        "actor": "Inbound Materials Inspector Zhang",
    },
    "RECYCLED": {
        "location": "EcoCycle Circular Economy Smelting & Recovery Line",
        "actor": "Chief Metallurgical Officer Dr. Aris Thorne",
    },
}


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_scans = db.query(WasteScan).count()
    total_passports = db.query(WastePassport).count()

    passports = db.query(WastePassport).all()
    total_ewaste_kg = 0.0
    total_diverted_kg = 0.0
    co2_saved_kg = 0.0

    status_dist = {s: 0 for s in LIFECYCLE_STAGES}
    cat_dist = {"E_WASTE": 0, "DRY_RECYCLABLE": 0, "BIODEGRADABLE": 0}

    for p in passports:
        status_dist[p.current_status] = status_dist.get(p.current_status, 0) + 1
        cat_dist[p.waste_type] = cat_dist.get(p.waste_type, 0) + 1

        impact = calculate_environmental_impact(p.waste_type, p.weight_kg)
        total_diverted_kg += impact["landfill_diversion_kg"]
        co2_saved_kg += impact["co2_saved_kg"]
        if p.waste_type == "E_WASTE":
            total_ewaste_kg += p.weight_kg

    bins = db.query(Bin).all()
    bins_needing_col = sum(1 for b in bins if b.status == "COLLECTION_REQUIRED")

    return AdminStatsResponse(
        total_users=total_users,
        total_scans=total_scans,
        total_passports=total_passports,
        total_ewaste_kg=round(total_ewaste_kg, 2),
        total_diverted_kg=round(total_diverted_kg, 2),
        co2_saved_kg=round(co2_saved_kg, 2),
        active_bins_count=len(bins),
        bins_needing_collection=bins_needing_col,
        status_distribution=status_dist,
        category_distribution=cat_dist,
    )


@router.get("/waste", response_model=List[WasteScanResponse])
def get_all_scans(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(WasteScan).order_by(WasteScan.created_at.desc()).limit(100).all()


@router.post("/passports/{passport_id}/advance", response_model=WastePassportDetailResponse)
def advance_passport_stage(
    passport_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    1-Click demo controller: Advances a waste passport to the next verified lifecycle
    stage and automatically links its cryptographic SHA-256 hash.
    """
    passport = db.query(WastePassport).filter(WastePassport.passport_id == passport_id).first()
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")

    current_idx = (
        LIFECYCLE_STAGES.index(passport.current_status)
        if passport.current_status in LIFECYCLE_STAGES
        else 0
    )

    if current_idx >= len(LIFECYCLE_STAGES) - 1:
        raise HTTPException(
            status_code=400,
            detail=f"Passport is already at final stage: {passport.current_status}",
        )

    next_stage = LIFECYCLE_STAGES[current_idx + 1]
    stage_info = STAGE_DETAILS.get(
        next_stage,
        {"location": "Campus Central Hub", "actor": current_admin.name},
    )

    last_event = (
        db.query(LifecycleEvent)
        .filter(LifecycleEvent.passport_id == passport_id)
        .order_by(LifecycleEvent.id.desc())
        .first()
    )

    prev_hash = last_event.event_hash if last_event else None
    now = datetime.datetime.utcnow()

    metadata = {
        "transition": f"{passport.current_status} -> {next_stage}",
        "admin_authorized_by": current_admin.name,
        "facility_seal": f"SEAL-{next_stage[:3]}-2026",
    }

    new_hash = generate_event_hash(
        passport_id=passport_id,
        status=next_stage,
        location=stage_info["location"],
        actor=stage_info["actor"],
        timestamp=now,
        previous_hash=prev_hash,
        metadata=metadata,
    )

    event = LifecycleEvent(
        passport_id=passport_id,
        status=next_stage,
        location=stage_info["location"],
        actor=stage_info["actor"],
        timestamp=now,
        previous_hash=prev_hash,
        event_hash=new_hash,
        metadata_json=json.dumps(metadata),
    )
    db.add(event)

    passport.current_status = next_stage
    passport.updated_at = now

    # If completed recycling, credit owner
    if next_stage == "RECYCLED":
        from app.models import GreenPoint

        owner = db.query(User).filter(User.id == passport.user_id).first()
        if owner:
            owner.green_points += 50
            db.add(
                GreenPoint(
                    user_id=owner.id,
                    passport_id=passport.passport_id,
                    points=50,
                    reason=f"Recycling verified: {passport.object_name}",
                )
            )

    db.commit()
    db.refresh(passport)

    events = (
        db.query(LifecycleEvent)
        .filter(LifecycleEvent.passport_id == passport_id)
        .order_by(LifecycleEvent.id.asc())
        .all()
    )
    res = WastePassportDetailResponse.model_validate(passport)
    res.events = events
    return res
