from pydantic import BaseModel
try:
    import email_validator  # noqa: F401
    from pydantic import EmailStr
except (ImportError, Exception):
    EmailStr = str

from typing import Optional, List, Dict, Any
from datetime import datetime



# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "USER"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    green_points: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- AI & Scanner Schemas ---
class AIClassificationResult(BaseModel):
    object_name: str
    predicted_category: str  # BIODEGRADABLE, DRY_RECYCLABLE, E_WASTE
    confidence: float
    risk_level: str  # LOW, MEDIUM, HIGH
    recommended_bin: str
    special_handling: bool
    hazard_level: str
    disposal_instructions: str
    estimated_weight_kg: float
    points_reward: int
    preview_url: Optional[str] = None


class WasteScanCreate(BaseModel):
    object_name: str
    predicted_category: str
    confidence: float
    risk_level: str
    recommended_bin: str
    special_handling: bool = False
    hazard_level: str = "None"
    disposal_instructions: Optional[str] = None
    estimated_weight_kg: float = 0.5
    image_path: Optional[str] = None


class WasteScanResponse(BaseModel):
    id: int
    user_id: Optional[int]
    image_path: Optional[str]
    object_name: str
    predicted_category: str
    confidence: float
    risk_level: str
    recommended_bin: str
    special_handling: bool
    hazard_level: str
    disposal_instructions: Optional[str]
    estimated_weight_kg: float
    created_at: datetime

    class Config:
        from_attributes = True


# --- Lifecycle & Hash Chain Schemas ---
class LifecycleEventCreate(BaseModel):
    status: str
    location: str
    actor: str
    metadata: Optional[Dict[str, Any]] = None


class LifecycleEventResponse(BaseModel):
    id: int
    passport_id: str
    status: str
    location: str
    actor: str
    timestamp: datetime
    previous_hash: Optional[str]
    event_hash: str
    metadata_json: Optional[str] = "{}"

    class Config:
        from_attributes = True


class ChainVerificationResponse(BaseModel):
    passport_id: str
    is_valid: bool
    status_summary: str
    events_count: int
    events: List[LifecycleEventResponse]
    current_status: str
    tampered_event_id: Optional[int] = None
    verification_message: str


# --- Passport Schemas ---
class WastePassportCreate(BaseModel):
    scan_id: Optional[int] = None
    object_name: str
    waste_type: str
    weight_kg: float
    recycler_partner: Optional[str] = "EcoTrace Verified Recyclers"


class WastePassportResponse(BaseModel):
    id: int
    passport_id: str
    waste_scan_id: Optional[int]
    user_id: int
    waste_type: str
    object_name: str
    weight_kg: float
    qr_token: str
    qr_code_image: Optional[str]
    current_status: str
    recycler_partner: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WastePassportDetailResponse(WastePassportResponse):
    events: List[LifecycleEventResponse] = []
    user_name: Optional[str] = None


# --- Smart Bin Schemas ---
class BinResponse(BaseModel):
    id: int
    name: str
    location: str
    bin_type: str
    capacity_percent: int
    hourly_fill_rate: float
    status: str
    last_emptied: datetime
    last_updated: datetime

    class Config:
        from_attributes = True


class BinPrediction(BaseModel):
    bin_id: int
    name: str
    location: str
    bin_type: str
    capacity_percent: int
    status: str
    hourly_fill_rate: float
    estimated_hours_to_90: Optional[float]
    estimated_minutes_to_90: Optional[int]
    collection_recommendation: str
    priority: str  # HIGH, MEDIUM, LOW


class BinUpdateCapacity(BaseModel):
    capacity_percent: int


# --- Green Points & Impact Schemas ---
class GreenPointResponse(BaseModel):
    id: int
    points: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardUser(BaseModel):
    rank: int
    name: str
    email: str
    green_points: int
    passports_count: int
    is_current_user: bool = False


class UserImpactSummary(BaseModel):
    user_id: int
    name: str
    green_points: int
    items_scanned: int
    passports_created: int
    ewaste_diverted_kg: float
    total_waste_diverted_kg: float
    co2_saved_kg: float
    toxic_materials_prevented_g: float
    rank: int


# --- Admin Stats Schemas ---
class AdminStatsResponse(BaseModel):
    total_users: int
    total_scans: int
    total_passports: int
    total_ewaste_kg: float
    total_diverted_kg: float
    co2_saved_kg: float
    active_bins_count: int
    bins_needing_collection: int
    status_distribution: Dict[str, int]
    category_distribution: Dict[str, int]
