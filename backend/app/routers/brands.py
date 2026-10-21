from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload, joinedload
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from ..cache import cache

router = APIRouter(prefix="/api/brands", tags=["Wholesale Brands"])

PACK_RATES_BY_NAME = {
    "Absolut Vodka": [
        {"size": "1000ml", "label": "1000ml", "mrp": 2180.0, "wholesale_issue_price": 19600.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 1650.0, "wholesale_issue_price": 15180.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 850.0, "wholesale_issue_price": 15640.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 440.0, "wholesale_issue_price": 16200.0, "bottles_per_case": 48},
    ],
    "Bacardi": [
        {"size": "1000ml", "label": "1000ml", "mrp": 1120.0, "wholesale_issue_price": 10080.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 850.0, "wholesale_issue_price": 7820.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 440.0, "wholesale_issue_price": 8100.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 230.0, "wholesale_issue_price": 8460.0, "bottles_per_case": 48},
    ],
    "Chivas Regal": [
        {"size": "1000ml", "label": "1000ml", "mrp": 4750.0, "wholesale_issue_price": 42750.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 3600.0, "wholesale_issue_price": 33120.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 1850.0, "wholesale_issue_price": 34040.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 950.0, "wholesale_issue_price": 34960.0, "bottles_per_case": 48},
    ],
    "Dewar's": [
        {"size": "1000ml", "label": "1000ml", "mrp": 3100.0, "wholesale_issue_price": 27900.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 2350.0, "wholesale_issue_price": 21620.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 1200.0, "wholesale_issue_price": 22080.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 620.0, "wholesale_issue_price": 22820.0, "bottles_per_case": 48},
    ],
    "Eight PM": [
        {"size": "1000ml", "label": "1000ml", "mrp": 580.0, "wholesale_issue_price": 5220.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 440.0, "wholesale_issue_price": 4050.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 230.0, "wholesale_issue_price": 4230.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 120.0, "wholesale_issue_price": 4420.0, "bottles_per_case": 48},
    ],
    "Four Seasons": [
        {"size": "1000ml", "label": "1000ml", "mrp": 1120.0, "wholesale_issue_price": 9970.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 850.0, "wholesale_issue_price": 7560.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 440.0, "wholesale_issue_price": 7830.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 230.0, "wholesale_issue_price": 8190.0, "bottles_per_case": 48},
    ],
    "Glenfiddich": [
        {"size": "1000ml", "label": "1000ml", "mrp": 6500.0, "wholesale_issue_price": 58500.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 4950.0, "wholesale_issue_price": 45540.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 2550.0, "wholesale_issue_price": 46920.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 1300.0, "wholesale_issue_price": 47840.0, "bottles_per_case": 48},
    ],
    "Heineken": [
        {"size": "650ml", "label": "650ml", "mrp": 210.0, "wholesale_issue_price": 1900.0, "bottles_per_case": 12},
        {"size": "500ml", "label": "500ml", "mrp": 170.0, "wholesale_issue_price": 3080.0, "bottles_per_case": 24},
        {"size": "330ml", "label": "330ml", "mrp": 130.0, "wholesale_issue_price": 2350.0, "bottles_per_case": 24},
    ],
    "Imperial Blue": [
        {"size": "1000ml", "label": "1000ml", "mrp": 610.0, "wholesale_issue_price": 5490.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 460.0, "wholesale_issue_price": 4230.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 240.0, "wholesale_issue_price": 4420.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 120.0, "wholesale_issue_price": 4420.0, "bottles_per_case": 48},
    ],
    "Johnnie Walker": [
        {"size": "1000ml", "label": "1000ml", "mrp": 5100.0, "wholesale_issue_price": 45900.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 3850.0, "wholesale_issue_price": 35420.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 1980.0, "wholesale_issue_price": 36430.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 1020.0, "wholesale_issue_price": 37540.0, "bottles_per_case": 48},
    ],
    "Kingfisher": [
        {"size": "650ml", "label": "650ml", "mrp": 170.0, "wholesale_issue_price": 1540.0, "bottles_per_case": 12},
        {"size": "500ml", "label": "500ml", "mrp": 140.0, "wholesale_issue_price": 2540.0, "bottles_per_case": 24},
        {"size": "330ml", "label": "330ml", "mrp": 100.0, "wholesale_issue_price": 1810.0, "bottles_per_case": 24},
    ],
    "London Pilsner": [
        {"size": "650ml", "label": "650ml", "mrp": 170.0, "wholesale_issue_price": 1540.0, "bottles_per_case": 12},
        {"size": "500ml", "label": "500ml", "mrp": 140.0, "wholesale_issue_price": 2540.0, "bottles_per_case": 24},
        {"size": "330ml", "label": "330ml", "mrp": 100.0, "wholesale_issue_price": 1810.0, "bottles_per_case": 24},
    ],
    "McDowell's No.1": [
        {"size": "1000ml", "label": "1000ml", "mrp": 610.0, "wholesale_issue_price": 5490.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 460.0, "wholesale_issue_price": 4230.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 240.0, "wholesale_issue_price": 4420.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 120.0, "wholesale_issue_price": 4420.0, "bottles_per_case": 48},
    ],
    "Newcastle Brown Ale": [
        {"size": "650ml", "label": "650ml", "mrp": 290.0, "wholesale_issue_price": 2620.0, "bottles_per_case": 12},
        {"size": "500ml", "label": "500ml", "mrp": 240.0, "wholesale_issue_price": 4350.0, "bottles_per_case": 24},
        {"size": "330ml", "label": "330ml", "mrp": 180.0, "wholesale_issue_price": 3260.0, "bottles_per_case": 24},
    ],
    "Old Monk": [
        {"size": "1000ml", "label": "1000ml", "mrp": 560.0, "wholesale_issue_price": 5040.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 420.0, "wholesale_issue_price": 3860.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 220.0, "wholesale_issue_price": 4050.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 110.0, "wholesale_issue_price": 4050.0, "bottles_per_case": 48},
    ],
    "Royal Stag": [
        {"size": "1000ml", "label": "1000ml", "mrp": 690.0, "wholesale_issue_price": 6210.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 520.0, "wholesale_issue_price": 4780.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 270.0, "wholesale_issue_price": 4970.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 140.0, "wholesale_issue_price": 5150.0, "bottles_per_case": 48},
    ],
    "Signature": [
        {"size": "1000ml", "label": "1000ml", "mrp": 950.0, "wholesale_issue_price": 8550.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 720.0, "wholesale_issue_price": 6620.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 370.0, "wholesale_issue_price": 6810.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 190.0, "wholesale_issue_price": 7000.0, "bottles_per_case": 48},
    ],
    "Teachers": [
        {"size": "1000ml", "label": "1000ml", "mrp": 2750.0, "wholesale_issue_price": 24750.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 2100.0, "wholesale_issue_price": 19320.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 1080.0, "wholesale_issue_price": 19870.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 560.0, "wholesale_issue_price": 20610.0, "bottles_per_case": 48},
    ],
    "United Breweries": [
        {"size": "650ml", "label": "650ml", "mrp": 160.0, "wholesale_issue_price": 1450.0, "bottles_per_case": 12},
        {"size": "500ml", "label": "500ml", "mrp": 130.0, "wholesale_issue_price": 2350.0, "bottles_per_case": 24},
        {"size": "330ml", "label": "330ml", "mrp": 95.0, "wholesale_issue_price": 1720.0, "bottles_per_case": 24},
    ],
    "VAT 69": [
        {"size": "1000ml", "label": "1000ml", "mrp": 2450.0, "wholesale_issue_price": 22050.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 1850.0, "wholesale_issue_price": 17020.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 960.0, "wholesale_issue_price": 17660.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 490.0, "wholesale_issue_price": 18030.0, "bottles_per_case": 48},
    ],
    "White Mischief": [
        {"size": "1000ml", "label": "1000ml", "mrp": 520.0, "wholesale_issue_price": 4680.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 390.0, "wholesale_issue_price": 3590.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 205.0, "wholesale_issue_price": 3770.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 105.0, "wholesale_issue_price": 3860.0, "bottles_per_case": 48},
    ],
    "X-rated Fusion Liqueur": [
        {"size": "1000ml", "label": "1000ml", "mrp": 3900.0, "wholesale_issue_price": 35100.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 2950.0, "wholesale_issue_price": 27140.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 1520.0, "wholesale_issue_price": 27970.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 780.0, "wholesale_issue_price": 28700.0, "bottles_per_case": 48},
    ],
    "Yellow Tail": [
        {"size": "1000ml", "label": "1000ml", "mrp": 2050.0, "wholesale_issue_price": 18250.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 1550.0, "wholesale_issue_price": 13800.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 800.0, "wholesale_issue_price": 14240.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 420.0, "wholesale_issue_price": 14950.0, "bottles_per_case": 48},
    ],
    "Zing Vodka": [
        {"size": "1000ml", "label": "1000ml", "mrp": 2100.0, "wholesale_issue_price": 18900.0, "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": 1600.0, "wholesale_issue_price": 14720.0, "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": 830.0, "wholesale_issue_price": 15270.0, "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": 430.0, "wholesale_issue_price": 15820.0, "bottles_per_case": 48},
    ]
}

def get_pack_rates_for_brand(name: str, category: str, base_mrp: float):
    if name in PACK_RATES_BY_NAME:
        return PACK_RATES_BY_NAME[name]
    if "BEER" in category:
        return [
            {"size": "650ml", "label": "650ml", "mrp": float(round(base_mrp)), "wholesale_issue_price": float(round(base_mrp * 12 * 0.755)), "bottles_per_case": 12},
            {"size": "500ml", "label": "500ml", "mrp": float(round(base_mrp * 0.82 / 10) * 10), "wholesale_issue_price": float(round(base_mrp * 0.82 * 24 * 0.755)), "bottles_per_case": 24},
            {"size": "330ml", "label": "330ml", "mrp": float(round(base_mrp * 0.58 / 5) * 5), "wholesale_issue_price": float(round(base_mrp * 0.58 * 24 * 0.755)), "bottles_per_case": 24},
        ]
    return [
        {"size": "1000ml", "label": "1000ml", "mrp": float(round(base_mrp * 1.32 / 10) * 10), "wholesale_issue_price": float(round(base_mrp * 1.32 * 12 * 0.75)), "bottles_per_case": 12},
        {"size": "750ml", "label": "750ml", "mrp": float(round(base_mrp)), "wholesale_issue_price": float(round(base_mrp * 12 * 0.765)), "bottles_per_case": 12},
        {"size": "375ml", "label": "375ml", "mrp": float(round(base_mrp * 0.515 / 10) * 10), "wholesale_issue_price": float(round(base_mrp * 0.515 * 24 * 0.765)), "bottles_per_case": 24},
        {"size": "180ml", "label": "180ml", "mrp": float(round(base_mrp * 0.265 / 5) * 5), "wholesale_issue_price": float(round(base_mrp * 0.265 * 48 * 0.765)), "bottles_per_case": 48},
    ]

@router.get("", response_model=List[schemas.BrandResponse])
def get_brands(
    category: Optional[str] = Query(None),
    sub_category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    cache_key = f"brands:{category or 'ALL'}:{sub_category or 'ALL'}:{search or ''}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    query = db.query(models.Brand).options(
        selectinload(models.Brand.prices),
        selectinload(models.Brand.depot_stocks),
        joinedload(models.Brand.supplier)
    )
    if category and category != "ALL":
        query = query.filter(models.Brand.category == category)
    if sub_category and sub_category != "ALL":
        query = query.filter(models.Brand.sub_category == sub_category)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(models.Brand.name.ilike(s) | models.Brand.brand_code.ilike(s))

    brands = query.order_by(models.Brand.id.asc()).all()
    results = []
    for b in brands:
        latest_price = b.prices[0] if b.prices else None
        total_stock = sum(s.available_cases for s in b.depot_stocks) if b.depot_stocks else 0
        base_mrp = latest_price.mrp_per_bottle if latest_price else 500.0
        rates = get_pack_rates_for_brand(b.name, b.category, base_mrp)
        results.append({
            "id": b.id,
            "brand_code": b.brand_code,
            "supplier_id": b.supplier_id,
            "supplier_name": b.supplier.name if b.supplier else None,
            "name": b.name,
            "category": b.category,
            "sub_category": b.sub_category,
            "pack_size": b.pack_size,
            "bottles_per_case": b.bottles_per_case,
            "strength_percentage": b.strength_percentage,
            "image_url": b.image_url,
            "flavor_notes": b.flavor_notes,
            "status": b.status,
            "current_price": latest_price,
            "total_depot_stock": total_stock,
            "pack_rates": rates
        })
    cache.set(cache_key, results, ttl=60)
    return results

@router.get("/{brand_id}/depot-stocks", response_model=List[schemas.DepotStockResponse])
def get_brand_depot_stocks(brand_id: int, db: Session = Depends(get_db)):
    cache_key = f"brands:{brand_id}:depot_stocks"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    brand = db.query(models.Brand).filter(models.Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    stocks = db.query(models.DepotStock).options(
        joinedload(models.DepotStock.depot)
    ).filter(models.DepotStock.brand_id == brand_id).all()
    results = [
        {
            "depot_id": s.depot.id,
            "depot_name": s.depot.name,
            "region": s.depot.region,
            "available_cases": s.available_cases
        }
        for s in stocks
    ]
    cache.set(cache_key, results, ttl=60)
    return results

@router.post("", response_model=schemas.BrandResponse, status_code=201)
def create_brand(payload: schemas.BrandCreate, db: Session = Depends(get_db)):
    # Check if brand already exists
    existing = db.query(models.Brand).filter(models.Brand.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Brand '{payload.name}' already exists in catalog")

    # Generate next brand code
    count = db.query(models.Brand).count()
    brand_code = f"BRD-{2001 + count}"

    # Default supplier
    supplier = db.query(models.Supplier).first()
    supplier_id = supplier.id if supplier else 1

    # Primary pack size
    primary_pack_size = "750ml"
    if "BEER" in payload.category.upper():
        primary_pack_size = "650ml"
    elif payload.pack_rates and len(payload.pack_rates) > 0:
        primary_pack_size = payload.pack_rates[0].size

    # Create Brand record
    brand = models.Brand(
        brand_code=brand_code,
        supplier_id=supplier_id,
        name=payload.name.strip(),
        category=payload.category,
        sub_category=payload.sub_category,
        pack_size=primary_pack_size,
        bottles_per_case=12,
        strength_percentage=payload.strength_percentage,
        image_url=payload.image_url or "/brands/default.jpg",
        flavor_notes=payload.flavor_notes or f"Official TASMAC state supply edition of {payload.name}",
        status="APPROVED"
    )
    db.add(brand)
    db.flush()

    # Determine base pricing
    base_mrp = 500.0
    wholesale_price = 4500.0
    if payload.pack_rates and len(payload.pack_rates) > 0:
        rate_ref = next((r for r in payload.pack_rates if "750" in r.size or "650" in r.size), payload.pack_rates[0])
        base_mrp = float(rate_ref.mrp)
        wholesale_price = float(rate_ref.wholesale_issue_price)
        # Register into PACK_RATES_BY_NAME dictionary
        PACK_RATES_BY_NAME[payload.name.strip()] = [
            {
                "size": r.size,
                "label": r.label,
                "mrp": float(r.mrp),
                "wholesale_issue_price": float(r.wholesale_issue_price),
                "bottles_per_case": int(r.bottles_per_case)
            }
            for r in payload.pack_rates
        ]

    # Create BrandPrice
    brand_price = models.BrandPrice(
        brand_id=brand.id,
        ex_factory_price=round(wholesale_price * 0.65, 2),
        excise_duty=round(wholesale_price * 0.25, 2),
        vat_amount=round(wholesale_price * 0.10, 2),
        wholesale_issue_price=float(wholesale_price),
        bottled_cost=round(wholesale_price / 12, 2),
        mrp_per_bottle=float(base_mrp),
        case_margin=round(max(0.0, (base_mrp * 12) - wholesale_price), 2),
        margin_percentage=round(max(5.0, (((base_mrp * 12) - wholesale_price) / (base_mrp * 12)) * 100), 1),
        is_active=True
    )
    db.add(brand_price)

    # Initialize Depot Stock across all depots
    depots = db.query(models.Depot).all()
    num_depots = max(1, len(depots))
    stock_per_depot = max(100, (payload.initial_depot_stock or 1000) // num_depots)
    for d in depots:
        stock = models.DepotStock(
            depot_id=d.id,
            brand_id=brand.id,
            available_cases=stock_per_depot,
            reserved_cases=0,
            damaged_cases=0
        )
        db.add(stock)

    db.commit()
    db.refresh(brand)

    # Invalidate caches so new bottle is immediately reflected
    cache.invalidate("brands")
    cache.invalidate("depots")
    cache.invalidate("shops")

    rates = get_pack_rates_for_brand(brand.name, brand.category, base_mrp)
    return {
        "id": brand.id,
        "brand_code": brand.brand_code,
        "supplier_id": brand.supplier_id,
        "supplier_name": supplier.name if supplier else "State Supply Distillers",
        "name": brand.name,
        "category": brand.category,
        "sub_category": brand.sub_category,
        "pack_size": brand.pack_size,
        "bottles_per_case": brand.bottles_per_case,
        "strength_percentage": brand.strength_percentage,
        "image_url": brand.image_url,
        "flavor_notes": brand.flavor_notes,
        "status": brand.status,
        "current_price": brand_price,
        "total_depot_stock": stock_per_depot * num_depots,
        "pack_rates": rates
    }

