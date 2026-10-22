import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base, SessionLocal
from .seed_data import seed_retail_supplier_database
from .routers import brands, orders, depots, shops, suppliers, auth, finance

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TASMAC B2B Wholesale Retail Supplier Platform",
    description="Enterprise B2B Wholesale Supply & Indent Management Platform for Retail Liquor Shops across Tamil Nadu",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static brands directory if exists
brands_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "brands"))
if os.path.exists(brands_dir):
    app.mount("/brands", StaticFiles(directory=brands_dir), name="brands")

# Include Routers
app.include_router(auth.router)
app.include_router(brands.router)
app.include_router(orders.router)
app.include_router(depots.router)
app.include_router(shops.router)
app.include_router(suppliers.router)
app.include_router(finance.router)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_retail_supplier_database(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "TASMAC B2B Wholesale Supplier Platform",
        "version": "2.0.0",
        "endpoints": {
            "brands": "/api/brands",
            "orders": "/api/orders",
            "depots": "/api/depots",
            "shops": "/api/shops",
            "metrics": "/api/shops/dashboard/metrics"
        }
    }

@app.get("/api/health")
def health():
    return {"status": "healthy"}

