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
            pool_pre_ping=True,
            pool_recycle=300,
            pool_timeout=2,
            connect_args={"connect_timeout": 2}
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

    # If primary failed previously, do not penalize every request with DNS timeouts.
    # Recheck at most once every 60 seconds.
    if PrimarySession and (_primary_db_available or (now - _last_primary_check > 60)):
        _last_primary_check = now
        try:
            s = PrimarySession()
            s.execute(text("SELECT 1"))
            _primary_db_available = True
            return s
        except Exception as e:
            _primary_db_available = False
            logging.warning(f"Primary DB unavailable ({e}). Using ultra-fast local SQLite database.")
            if 's' in locals() and s:
                try:
                    s.close()
                except Exception:
                    pass
    return SqliteSession()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

