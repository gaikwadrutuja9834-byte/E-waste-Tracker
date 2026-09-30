from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, GreenPoint, WastePassport, WasteScan
from app.schemas import GreenPointResponse, LeaderboardUser, UserImpactSummary
from app.auth import get_current_user
from app.services.impact import calculate_environmental_impact

router = APIRouter(prefix="/points", tags=["Green Points & Impact Scorecard"])


@router.get("/me", response_model=UserImpactSummary)
def get_user_impact(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scans_count = db.query(WasteScan).filter(WasteScan.user_id == current_user.id).count()
    passports = db.query(WastePassport).filter(WastePassport.user_id == current_user.id).all()

    ewaste_diverted_kg = 0.0
    total_waste_diverted_kg = 0.0
    co2_saved_kg = 0.0
    toxic_prevented_g = 0.0

    for p in passports:
        impact = calculate_environmental_impact(p.waste_type, p.weight_kg)
        total_waste_diverted_kg += impact["landfill_diversion_kg"]
        co2_saved_kg += impact["co2_saved_kg"]
        if p.waste_type == "E_WASTE":
            ewaste_diverted_kg += p.weight_kg
            toxic_prevented_g += impact["toxic_prevented_g"]

    # Rank among all users
    better_users = db.query(User).filter(User.green_points > current_user.green_points).count()
    rank = better_users + 1

    return UserImpactSummary(
        user_id=current_user.id,
        name=current_user.name,
        green_points=current_user.green_points,
        items_scanned=scans_count,
        passports_created=len(passports),
        ewaste_diverted_kg=round(ewaste_diverted_kg, 2),
        total_waste_diverted_kg=round(total_waste_diverted_kg, 2),
        co2_saved_kg=round(co2_saved_kg, 2),
        toxic_materials_prevented_g=round(toxic_prevented_g, 1),
        rank=rank,
    )


@router.get("/history", response_model=List[GreenPointResponse])
def get_points_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(GreenPoint)
        .filter(GreenPoint.user_id == current_user.id)
        .order_by(GreenPoint.created_at.desc())
        .limit(25)
        .all()
    )


@router.get("/leaderboard", response_model=List[LeaderboardUser])
def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns top campus sustainability leaders including demo heroes.
    """
    users = db.query(User).order_by(User.green_points.desc()).limit(15).all()

    leaderboard = []
    for idx, u in enumerate(users):
        p_count = db.query(WastePassport).filter(WastePassport.user_id == u.id).count()
        leaderboard.append(
            LeaderboardUser(
                rank=idx + 1,
                name=u.name,
                email=u.email,
                green_points=u.green_points,
                passports_count=p_count,
                is_current_user=(u.id == current_user.id),
            )
        )
    return leaderboard
