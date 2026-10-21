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
    # PBKDF2 HMAC SHA256 standard
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
        {
            "username": "distillery_admin",
            "email": "distillery@tasmac.tn.gov",
            "full_name": "K. Selvakumar",
            "password": "tasmac123",
            "role": "DISTILLERY",
            "organization": "Empee Distilleries Ltd (Unit 2)",
            "code": "DIST-EMP-004",
            "default_stage": "suppliers",
            "allowed_stages": "suppliers"
        },
        {
            "username": "depot_manager",
            "email": "depot@tasmac.tn.gov",
            "full_name": "M. Rajendran",
            "password": "tasmac123",
            "role": "DEPOT",
            "organization": "Ambattur Central Wholesale Depot",
            "code": "DEPOT-AMB-101",
            "default_stage": "depots",
            "allowed_stages": "depots"
        },
        {
            "username": "shop_supervisor",
            "email": "shop@tasmac.tn.gov",
            "full_name": "R. Vignesh",
            "password": "tasmac123",
            "role": "SHOP",
            "organization": "TASMAC Shop #4012 (Anna Nagar)",
            "code": "SHOP-CH-4012",
            "default_stage": "inventory",
            "allowed_stages": "inventory"
        },
        {
            "username": "catalog_manager",
            "email": "catalog@tasmac.tn.gov",
            "full_name": "P. Murugan",
            "password": "tasmac123",
            "role": "CATALOG",
            "organization": "Wholesale Indent & Price Division",
            "code": "CAT-WHS-205",
            "default_stage": "catalog",
            "allowed_stages": "catalog"
        },
        {
            "username": "excise_inspector",
            "email": "excise@tasmac.tn.gov",
            "full_name": "S. Jayaraman, IPS",
            "password": "tasmac123",
            "role": "EXCISE",
            "organization": "Tamil Nadu Prohibition & Excise Dept",
            "code": "EXCISE-TN-892",
            "default_stage": "orders",
            "allowed_stages": "orders"
        },
        {
            "username": "admin",
            "email": "admin@tasmac.tn.gov",
            "full_name": "Director of State Logistics",
            "password": "tasmac123",
            "role": "ADMIN",
            "organization": "TASMAC Head Office (CMDA Tower)",
            "code": "HQ-ADMIN-001",
            "default_stage": "suppliers",
            "allowed_stages": "suppliers,depots,inventory,catalog,orders"
        }
    ]

    for u in default_users:
        existing = db.query(User).filter(
            (User.email == u["email"]) | (User.username == u["username"])
        ).first()
        if existing:
            existing.default_stage = u["default_stage"]
            existing.allowed_stages = u["allowed_stages"]
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
            detail="Invalid credentials: password incorrect"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or pending excise re-clearance"
        )

    token = create_access_token({
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
        "code": user.code
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )

    token = authorization.split("Bearer ")[1].strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired, please re-authenticate")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")

    return format_user_response(user)

