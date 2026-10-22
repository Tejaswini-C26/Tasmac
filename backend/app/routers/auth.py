import hashlib
import os
import hmac
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
import jwt

from ..database import get_db
from ..models import User
from ..schemas import UserLoginRequest, UserResponse, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("JWT_SECRET", "tasmac-production-secure-excise-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

def hash_password(password: str) -> str:
    salt = b"tasmac_salt_secret_2026"
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def format_user_response(user: User) -> UserResponse:
    raw_stages = getattr(user, "allowed_stages", None) or getattr(user, "default_stage", "suppliers")
    stages = [s.strip() for s in raw_stages.split(",") if s.strip()]
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        organization=user.organization,
        code=user.code,
        default_stage=user.default_stage or "suppliers",
        allowed_stages=stages,
        is_active=user.is_active
    )

def seed_default_users(db: Session):
    default_users = [
        # Master Admin (HQ - Handles Whole Project: Manufacturing & Retail)
        {
            "username": "admin",
            "email": "admin@tasmac.tn.gov",
            "full_name": "TASMAC Master Admin",
            "password": "tasmac123",
            "role": "ADMIN",
            "organization": "TASMAC Head Office (CMDA Tower, Egmore)",
            "code": "HQ-ADMIN-001",
            "default_stage": "suppliers",
            "allowed_stages": "suppliers,depots,inventory,catalog,orders,add-bottle",
            "assigned_region": "Statewide (All Regions)",
            "phone": "+91 44 2852 1101"
        },
        # 1. Manufacturing Supplier
        {
            "username": "supplier_owner",
            "email": "supplier@tasmac.tn.gov",
            "full_name": "Manufacturing Supplier",
            "password": "tasmac123",
            "role": "MANUFACTURING_SUPPLIER",
            "organization": "United Breweries & Mohan Distilleries Consortium",
            "code": "SUP-1001",
            "default_stage": "suppliers",
            "allowed_stages": "suppliers,depots",
            "assigned_region": "Statewide",
            "phone": "+91 98400 12345"
        },
        # 2. Retail Shops Supplier
        {
            "username": "shop_owner",
            "email": "shop@tasmac.tn.gov",
            "full_name": "Retail Shops Supplier",
            "password": "tasmac123",
            "role": "RETAIL_SUPPLIER",
            "organization": "TASMAC Retail Vend #1042 (T. Nagar Central)",
            "code": "SHOP-1042",
            "default_stage": "inventory",
            "allowed_stages": "inventory,catalog,orders",
            "assigned_region": "Chennai",
            "phone": "+91 98401 10420"
        },
        # Aliases for flexibility
        {
            "username": "manufacturing",
            "email": "manufacturing@tasmac.tn.gov",
            "full_name": "Manufacturing Supplier",
            "password": "tasmac123",
            "role": "MANUFACTURING_SUPPLIER",
            "organization": "Distilleries & Breweries Consortium",
            "code": "SUP-1001",
            "default_stage": "suppliers",
            "allowed_stages": "suppliers,depots",
            "assigned_region": "Statewide",
            "phone": "+91 98400 12345"
        },
        {
            "username": "retail",
            "email": "retail@tasmac.tn.gov",
            "full_name": "Retail Shops Supplier",
            "password": "tasmac123",
            "role": "RETAIL_SUPPLIER",
            "organization": "TASMAC Retail Vends Network",
            "code": "SHOP-1042",
            "default_stage": "inventory",
            "allowed_stages": "inventory,catalog,orders",
            "assigned_region": "Chennai",
            "phone": "+91 98401 10420"
        }
    ]

    for u in default_users:
        existing = db.query(User).filter(
            (User.email == u["email"]) | (User.username == u["username"])
        ).first()
        if existing:
            existing.role = u["role"]
            existing.full_name = u["full_name"]
            existing.default_stage = u["default_stage"]
            existing.allowed_stages = u["allowed_stages"]
            existing.organization = u["organization"]
            existing.code = u["code"]
            existing.assigned_region = u["assigned_region"]
            existing.phone = u["phone"]
        else:
            new_user = User(
                username=u["username"],
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                organization=u["organization"],
                code=u["code"],
                default_stage=u["default_stage"],
                allowed_stages=u["allowed_stages"],
                assigned_region=u["assigned_region"],
                phone=u["phone"],
                is_active=True
            )
            db.add(new_user)
    db.commit()

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    seed_default_users(db)
    identifier = payload.username_or_email.strip().lower()

    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.username.ilike(identifier))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials: user not found"
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials: incorrect password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently disabled"
        )

    access_token = create_access_token(data={
        "sub": user.username, 
        "user_id": user.id, 
        "role": user.role,
        "email": user.email
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=format_user_response(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found or inactive")

    return format_user_response(user)
