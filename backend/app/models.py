import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER")  # "USER" or "ADMIN"
    green_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    scans = relationship("WasteScan", back_populates="user")
    passports = relationship("WastePassport", back_populates="user")
    point_logs = relationship("GreenPoint", back_populates="user")


class WasteScan(Base):
    __tablename__ = "waste_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String(500), nullable=True)
    object_name = Column(String(120), nullable=False)
    predicted_category = Column(String(50), nullable=False)  # BIODEGRADABLE, DRY_RECYCLABLE, E_WASTE
    confidence = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    recommended_bin = Column(String(100), nullable=False)
    special_handling = Column(Boolean, default=False)
    hazard_level = Column(String(50), default="None")
    disposal_instructions = Column(Text, nullable=True)
    estimated_weight_kg = Column(Float, default=0.5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scans")
    passport = relationship("WastePassport", back_populates="scan", uselist=False)


class WastePassport(Base):
    __tablename__ = "waste_passports"

    id = Column(Integer, primary_key=True, index=True)
    passport_id = Column(String(64), unique=True, index=True, nullable=False)  # ET-2026-XXXXXX
    waste_scan_id = Column(Integer, ForeignKey("waste_scans.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    waste_type = Column(String(50), nullable=False)
    object_name = Column(String(120), nullable=False)
    weight_kg = Column(Float, default=1.0)
    qr_token = Column(String(255), nullable=False)
    qr_code_image = Column(Text, nullable=True)  # Base64 data URI
    current_status = Column(String(50), default="DETECTED")
    recycler_partner = Column(String(150), default="EcoTrace Verified Recyclers")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="passports")
    scan = relationship("WasteScan", back_populates="passport")
    events = relationship(
        "LifecycleEvent",
        back_populates="passport",
        cascade="all, delete-orphan",
        order_by="LifecycleEvent.id",
    )


class LifecycleEvent(Base):
    __tablename__ = "lifecycle_events"

    id = Column(Integer, primary_key=True, index=True)
    passport_id = Column(String(64), ForeignKey("waste_passports.passport_id"), nullable=False)
    status = Column(String(50), nullable=False)
    location = Column(String(200), nullable=False)
    actor = Column(String(150), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    previous_hash = Column(String(128), nullable=True)
    event_hash = Column(String(128), nullable=False)
    metadata_json = Column(Text, default="{}")

    passport = relationship("WastePassport", back_populates="events")


class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    location = Column(String(180), nullable=False)
    bin_type = Column(String(50), nullable=False)  # BIODEGRADABLE, DRY_RECYCLABLE, E_WASTE
    capacity_percent = Column(Integer, default=0)
    hourly_fill_rate = Column(Float, default=5.0)  # Average percent increase per hour
    status = Column(String(50), default="NORMAL")  # NORMAL, NEAR_CAPACITY, COLLECTION_REQUIRED
    last_emptied = Column(DateTime, default=datetime.datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class GreenPoint(Base):
    __tablename__ = "green_points"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    passport_id = Column(String(64), nullable=True)
    points = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="point_logs")
