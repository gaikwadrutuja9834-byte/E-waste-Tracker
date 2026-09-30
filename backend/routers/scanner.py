import base64
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User, WasteScan, GreenPoint
from app.schemas import AIClassificationResult, WasteScanResponse
from app.services.classifier import classify_waste_image
from app.auth import get_optional_user, get_current_user

router = APIRouter(prefix="/scanner", tags=["AI Waste Scanner"])


@router.post("/predict", response_model=AIClassificationResult)
async def predict_waste(
    image: Optional[UploadFile] = File(None),
    item_preset: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Multimodal AI endpoint that identifies waste from an image or preset identifier.
    Returns normalized SDG 11 category, risk level, bin advice, and operational instructions.
    """
    image_bytes = None
    preview_url = None
    filename = None

    if image is not None:
        filename = image.filename
        image_bytes = await image.read()
        # Create base64 preview for instant rendering
        mime = image.content_type or "image/jpeg"
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        preview_url = f"data:{mime};base64,{b64}"

    # Classify item
    result = classify_waste_image(
        image_bytes=image_bytes,
        filename=filename,
        hint=item_preset,
    )
    result["preview_url"] = preview_url

    # If user is authenticated, log scan and grant +5 scan points
    if current_user:
        scan_record = WasteScan(
            user_id=current_user.id,
            image_path=filename or item_preset or "live_scan.jpg",
            object_name=result["object_name"],
            predicted_category=result["predicted_category"],
            confidence=result["confidence"],
            risk_level=result["risk_level"],
            recommended_bin=result["recommended_bin"],
            special_handling=result["special_handling"],
            hazard_level=result["hazard_level"],
            disposal_instructions=result["disposal_instructions"],
            estimated_weight_kg=result["estimated_weight_kg"],
        )
        db.add(scan_record)

        # Grant +5 scan points
        current_user.green_points += 5
        db.add(
            GreenPoint(
                user_id=current_user.id,
                points=5,
                reason=f"AI waste scan completed: {result['object_name']}",
            )
        )
        db.commit()

    return result


@router.post("/confirm-disposal")
def confirm_disposal(
    object_name: str = Form(...),
    category: str = Form(...),
    weight_kg: float = Form(0.3),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Confirm proper disposal of standard dry/bio waste items to reward points.
    """
    points = 10
    current_user.green_points += points
    db.add(
        GreenPoint(
            user_id=current_user.id,
            points=points,
            reason=f"Proper disposal confirmed in {category} bin: {object_name}",
        )
    )
    db.commit()
    return {
        "success": True,
        "message": f"Verified disposal of {object_name}. +{points} Green Points credited!",
        "new_balance": current_user.green_points,
    }
