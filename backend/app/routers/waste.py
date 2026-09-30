from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WasteScan
from app.schemas import WasteScanResponse
from app.auth import get_current_user, User

router = APIRouter(prefix="/waste", tags=["Waste Scans Archive"])


@router.get("", response_model=List[WasteScanResponse])
def get_user_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scans = (
        db.query(WasteScan)
        .filter(WasteScan.user_id == current_user.id)
        .order_by(WasteScan.created_at.desc())
        .limit(50)
        .all()
    )
    return scans


@router.get("/{scan_id}", response_model=WasteScanResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(WasteScan).filter(WasteScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return scan
