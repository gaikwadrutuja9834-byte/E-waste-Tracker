import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Bin
from app.schemas import BinResponse, BinPrediction, BinUpdateCapacity
from app.services.prediction import predict_bin_collection

router = APIRouter(prefix="/bins", tags=["Smart Bins & Predictive Monitoring"])


@router.get("", response_model=List[BinResponse])
def get_bins(db: Session = Depends(get_db)):
    bins = db.query(Bin).order_by(Bin.id.asc()).all()
    return bins


@router.get("/predictions", response_model=List[BinPrediction])
def get_bin_predictions(db: Session = Depends(get_db)):
    """
    Computes fill velocity predictions, estimated time-to-full (90%),
    and collection scheduling alerts for all campus smart bins.
    """
    bins = db.query(Bin).order_by(Bin.capacity_percent.desc()).all()
    predictions = []

    for b in bins:
        pred = predict_bin_collection(b.capacity_percent, b.hourly_fill_rate)
        predictions.append(
            BinPrediction(
                bin_id=b.id,
                name=b.name,
                location=b.location,
                bin_type=b.bin_type,
                capacity_percent=b.capacity_percent,
                status=pred["status"],
                hourly_fill_rate=b.hourly_fill_rate,
                estimated_hours_to_90=pred["estimated_hours_to_90"],
                estimated_minutes_to_90=pred["estimated_minutes_to_90"],
                collection_recommendation=pred["collection_recommendation"],
                priority=pred["priority"],
            )
        )
    return predictions


@router.get("/{bin_id}", response_model=BinResponse)
def get_bin(bin_id: int, db: Session = Depends(get_db)):
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    return bin_obj


@router.post("/{bin_id}/capacity", response_model=BinResponse)
def update_bin_capacity(
    bin_id: int,
    payload: BinUpdateCapacity,
    db: Session = Depends(get_db),
):
    """
    Allows updating capacity (0-100%) for live demo simulation.
    Automatically re-evaluates status (NORMAL, NEAR_CAPACITY, COLLECTION_REQUIRED).
    """
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")

    new_cap = max(0, min(100, payload.capacity_percent))
    bin_obj.capacity_percent = new_cap
    bin_obj.last_updated = datetime.datetime.utcnow()

    if new_cap >= 85:
        bin_obj.status = "COLLECTION_REQUIRED"
    elif new_cap >= 70:
        bin_obj.status = "NEAR_CAPACITY"
    else:
        bin_obj.status = "NORMAL"

    db.commit()
    db.refresh(bin_obj)
    return bin_obj


@router.post("/{bin_id}/empty", response_model=BinResponse)
def empty_bin(bin_id: int, db: Session = Depends(get_db)):
    """
    Simulates collection truck emptying the bin, resetting capacity to 0%.
    """
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")

    now = datetime.datetime.utcnow()
    bin_obj.capacity_percent = 0
    bin_obj.status = "NORMAL"
    bin_obj.last_emptied = now
    bin_obj.last_updated = now

    db.commit()
    db.refresh(bin_obj)
    return bin_obj
