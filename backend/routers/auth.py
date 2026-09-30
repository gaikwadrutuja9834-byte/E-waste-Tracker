from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    email_norm = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email == email_norm).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in or use a different email.",
        )

    # Allow role override only if explicitly requested, default to USER
    role = "ADMIN" if user_in.role and user_in.role.upper() == "ADMIN" else "USER"

    new_user = User(
        name=user_in.name.strip(),
        email=email_norm,
        password_hash=get_password_hash(user_in.password),
        role=role,
        green_points=50,  # Welcome bonus points for joining!
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post("/login", response_model=Token)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    email_norm = creds.email.strip().lower()
    user = db.query(User).filter(User.email == email_norm).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials.",
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/demo-login/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """
    Convenient 1-Click demo authentication for hackathon evaluation:
    role: 'student' or 'admin'
    """
    target_role = "ADMIN" if role.lower() == "admin" else "USER"
    user = db.query(User).filter(User.role == target_role).first()
    if not user:
        # Fallback create demo user if not yet seeded
        if target_role == "ADMIN":
            user = User(
                name="Prof. Sarah Chen (Admin)",
                email="admin@ecotrace.ai",
                password_hash=get_password_hash("admin123"),
                role="ADMIN",
                green_points=1200,
            )
        else:
            user = User(
                name="Alex Rivera (Student)",
                email="student@campus.edu",
                password_hash=get_password_hash("student123"),
                role="USER",
                green_points=240,
            )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }
