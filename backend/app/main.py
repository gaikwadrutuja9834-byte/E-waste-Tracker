import os
import json
import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import User, Bin, WasteScan, WastePassport, LifecycleEvent, GreenPoint
from app.utils.security import get_password_hash
from app.services.qr_service import generate_passport_qr_data_uri
from app.services.hash_chain import generate_event_hash

from app.routers import (
    auth,
    scanner,
    passport,
    lifecycle,
    bins,
    points,
    admin,
    waste,
)

app = FastAPI(
    title="EcoTrace AI API",
    description="Campus & City Waste Segregation & E-Waste Lifecycle Tracker (UN SDG 11)",
    version="1.0.0",
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_database():
    """Seeds initial demonstration data if tables are freshly created."""
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() == 0:
            print("[EcoTrace AI] Seeding initial database with hackathon demo data...")

            # 1. Create Users
            admin_user = User(
                name="Prof. Sarah Chen",
                email="admin@ecotrace.ai",
                password_hash=get_password_hash("admin123"),
                role="ADMIN",
                green_points=1250,
            )
            student_user = User(
                name="Alex Rivera",
                email="student@campus.edu",
                password_hash=get_password_hash("student123"),
                role="USER",
                green_points=240,
            )
            db.add_all([admin_user, student_user])

            # Seed community leaders for leaderboard
            leader1 = User(
                name="Aarav Sharma",
                email="aarav@campus.edu",
                password_hash=get_password_hash("demo123"),
                role="USER",
                green_points=540,
            )
            leader2 = User(
                name="Priya Patel",
                email="priya@campus.edu",
                password_hash=get_password_hash("demo123"),
                role="USER",
                green_points=490,
            )
            leader3 = User(
                name="Rohan Gupta",
                email="rohan@campus.edu",
                password_hash=get_password_hash("demo123"),
                role="USER",
                green_points=430,
            )
            db.add_all([leader1, leader2, leader3])
            db.flush()

            # 2. Seed Smart Bins
            bin1 = Bin(
                name="Library Plaza Organic Station",
                location="Main Library Plaza - Ground Level",
                bin_type="BIODEGRADABLE",
                capacity_percent=72,
                hourly_fill_rate=3.5,
                status="NORMAL",
                last_emptied=datetime.datetime.utcnow() - datetime.timedelta(hours=14),
            )
            bin2 = Bin(
                name="Engineering Quad Recyclables Hub",
                location="Engineering Quad - West Wing",
                bin_type="DRY_RECYCLABLE",
                capacity_percent=88,
                hourly_fill_rate=6.0,
                status="COLLECTION_REQUIRED",
                last_emptied=datetime.datetime.utcnow() - datetime.timedelta(hours=22),
            )
            bin3 = Bin(
                name="Science Block E-Waste Vault",
                location="Science Complex Block B - Electronics Depot",
                bin_type="E_WASTE",
                capacity_percent=34,
                hourly_fill_rate=1.8,
                status="NORMAL",
                last_emptied=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            )
            bin4 = Bin(
                name="Student Center Paper & Dry Bin",
                location="Student Union Dining & Commons",
                bin_type="DRY_RECYCLABLE",
                capacity_percent=54,
                hourly_fill_rate=4.2,
                status="NORMAL",
                last_emptied=datetime.datetime.utcnow() - datetime.timedelta(hours=8),
            )
            db.add_all([bin1, bin2, bin3, bin4])

            # 3. Seed Fully Recycled Demo Passport with complete SHA-256 Hash Chain
            p1_id = "ET-2026-A83F92"
            p1_qr = generate_passport_qr_data_uri(p1_id)
            passport1 = WastePassport(
                passport_id=p1_id,
                user_id=student_user.id,
                waste_type="E_WASTE",
                object_name="Laptop Computer (ThinkPad T480)",
                weight_kg=1.80,
                qr_token=p1_id,
                qr_code_image=p1_qr,
                current_status="RECYCLED",
                recycler_partner="EcoCycle Certified Urban Recyclers Ltd",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
            )
            db.add(passport1)
            db.flush()

            # Build authentic sequential SHA-256 chain for Passport 1
            chain_stages = [
                (
                    "REGISTERED",
                    "Campus Eco-Drop Hub #1",
                    "Alex Rivera (Student Submitter)",
                    datetime.datetime.utcnow() - datetime.timedelta(days=3),
                    {"device": "Laptop", "serial": "TP-480-9921", "battery_removed": False},
                ),
                (
                    "COLLECTED",
                    "Campus Logistics Electric Van #2",
                    "Fleet Collector Mark Vance",
                    datetime.datetime.utcnow() - datetime.timedelta(days=2, hours=18),
                    {"van_id": "EV-TRUCK-02", "bin_origin": "Science Block Vault"},
                ),
                (
                    "STORED",
                    "Campus Safe Materials Staging Facility",
                    "Hazmat Custodian Elena Rostova",
                    datetime.datetime.utcnow() - datetime.timedelta(days=2, hours=4),
                    {"temperature_c": 19.5, "fire_containment_bay": "BAY-B4"},
                ),
                (
                    "IN_TRANSIT",
                    "Certified Regional Green Freight",
                    "Logistics Hauler Davis",
                    datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=8),
                    {"route": "Campus -> EcoCycle Smelting Facility", "manifest_id": "MF-88301"},
                ),
                (
                    "AT_RECYCLER",
                    "EcoCycle High-Tech Extraction Facility",
                    "Inspector Zhang (Recycler Staff)",
                    datetime.datetime.utcnow() - datetime.timedelta(hours=16),
                    {"intact_verification": True, "weighed_kg": 1.81},
                ),
                (
                    "RECYCLED",
                    "Circular Metals Recovery Line #3",
                    "Chief Metallurgist Dr. Aris Thorne",
                    datetime.datetime.utcnow() - datetime.timedelta(hours=4),
                    {
                        "recovered_copper_g": 180,
                        "recovered_gold_mg": 45,
                        "landfill_diversion_kg": 1.80,
                    },
                ),
            ]

            prev_hash = None
            for status_name, loc, actor, dt, meta in chain_stages:
                h = generate_event_hash(
                    passport_id=p1_id,
                    status=status_name,
                    location=loc,
                    actor=actor,
                    timestamp=dt,
                    previous_hash=prev_hash,
                    metadata=meta,
                )
                evt = LifecycleEvent(
                    passport_id=p1_id,
                    status=status_name,
                    location=loc,
                    actor=actor,
                    timestamp=dt,
                    previous_hash=prev_hash,
                    event_hash=h,
                    metadata_json=json.dumps(meta),
                )
                db.add(evt)
                prev_hash = h

            # Seed a second active passport in AT_RECYCLER stage
            p2_id = "ET-2026-B19C44"
            p2_qr = generate_passport_qr_data_uri(p2_id)
            passport2 = WastePassport(
                passport_id=p2_id,
                user_id=student_user.id,
                waste_type="E_WASTE",
                object_name="Lithium-Ion Battery Pack",
                weight_kg=0.45,
                qr_token=p2_id,
                qr_code_image=p2_qr,
                current_status="AT_RECYCLER",
                recycler_partner="EcoCycle Certified Urban Recyclers Ltd",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            )
            db.add(passport2)
            db.flush()

            # Chain for passport 2
            prev2 = None
            for status_name, loc, actor, dt, meta in chain_stages[:5]:
                h = generate_event_hash(
                    passport_id=p2_id,
                    status=status_name,
                    location=loc,
                    actor=actor,
                    timestamp=dt,
                    previous_hash=prev2,
                    metadata=meta,
                )
                evt = LifecycleEvent(
                    passport_id=p2_id,
                    status=status_name,
                    location=loc,
                    actor=actor,
                    timestamp=dt,
                    previous_hash=prev2,
                    event_hash=h,
                    metadata_json=json.dumps(meta),
                )
                db.add(evt)
                prev2 = h

            db.commit()
            print("[EcoTrace AI] Database successfully seeded with demo entities.")
    except Exception as e:
        db.rollback()
        print(f"[EcoTrace AI] Note during database seeding: {e}")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()


# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(scanner.router, prefix="/api")
app.include_router(passport.router, prefix="/api")
app.include_router(lifecycle.router, prefix="/api")
app.include_router(bins.router, prefix="/api")
app.include_router(points.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(waste.router, prefix="/api")


@app.get("/")
def root():
    return {
        "project": "EcoTrace AI",
        "tagline": "Don't just throw it. Know it. Track it. Prove it.",
        "status": "online",
        "version": "1.0.0",
        "sdg": "UN SDG 11: Sustainable Cities and Communities",
        "docs_url": "/docs",
    }
