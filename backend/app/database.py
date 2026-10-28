import os
import time
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./retail_supplier.db"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SQLITE_URL = "sqlite:///./retail_supplier.db"
is_sqlite = DATABASE_URL.startswith("sqlite")

primary_engine = None
if not is_sqlite:
    try:
        primary_engine = create_engine(
            DATABASE_URL,
            pool_size=20,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_timeout=10,
            connect_args={"connect_timeout": 5}
        )
    except Exception as e:
        logging.warning(f"Could not initialize primary database engine: {e}")

sqlite_engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False}
)

engine = primary_engine if primary_engine is not None else sqlite_engine

PrimarySession = sessionmaker(autocommit=False, autoflush=False, bind=primary_engine) if primary_engine else None
SqliteSession = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

Base = declarative_base()

_primary_db_available = True if PrimarySession else False
_last_primary_check = 0

def SessionLocal():
    global _primary_db_available, _last_primary_check
    now = time.time()

    if PrimarySession and _primary_db_available:
        try:
            return PrimarySession()
        except Exception as e:
            _primary_db_available = False
            _last_primary_check = now
            logging.warning(f"Primary DB checkout failed ({e}). Using ultra-fast local SQLite database.")
            return SqliteSession()

    if PrimarySession and not _primary_db_available and (now - _last_primary_check > 60):
        _last_primary_check = now
        try:
            s = PrimarySession()
            s.execute(text("SELECT 1"))
            _primary_db_available = True
            return s
        except Exception:
            pass

    return SqliteSession()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

