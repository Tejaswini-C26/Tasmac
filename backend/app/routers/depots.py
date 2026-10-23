from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload, joinedload
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from ..cache import cache

router = APIRouter(prefix="/api/depots", tags=["Wholesale Depots"])

@router.get("", response_model=List[schemas.DepotResponse])
def get_depots(db: Session = Depends(get_db)):
    cached = cache.get("depots:all")
    if cached is not None:
        return cached

    depots = db.query(models.Depot).options(
        selectinload(models.Depot.stocks)
    ).all()
    results = []
    for d in depots:
        total_stock = sum(s.available_cases for s in d.stocks) if d.stocks else 0
        results.append(
            schemas.DepotResponse(
                id=d.id,
                code=d.code,
                name=d.name,
                region=d.region,
                address=d.address,
                manager_name=d.manager_name,
                phone=d.phone,
                capacity_cases=d.capacity_cases,
                total_stock_cases=total_stock
            )
        )
    cache.set("depots:all", results, ttl=60)
    return results

@router.get("/{depot_id}/inventory")
def get_depot_inventory(depot_id: int, db: Session = Depends(get_db)):
    cache_key = f"depots:{depot_id}:inventory"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    depot = db.query(models.Depot).filter(models.Depot.id == depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot not found")

    stocks = db.query(models.DepotStock).options(
        joinedload(models.DepotStock.brand).selectinload(models.Brand.prices)
    ).filter(models.DepotStock.depot_id == depot_id).all()

    inventory = []
    for s in stocks:
        brand = s.brand
        latest_price = brand.prices[0] if brand.prices else None
        btl_per_case = brand.bottles_per_case or (24 if "BEER" in (brand.category or "") and "500ml" in (brand.pack_size or "") else 12)
        cases = s.available_cases or 0
        inventory.append({
            "brand_id": brand.id,
            "brand_name": brand.name,
            "category": brand.category,
            "sub_category": brand.sub_category,
            "pack_size": brand.pack_size,
            "bottles_per_case": btl_per_case,
            "image_url": brand.image_url,
            "available_cases": cases,
            "available_bottles": cases * btl_per_case,
            "wholesale_price": latest_price.wholesale_issue_price if latest_price else 0,
            "mrp": latest_price.mrp_per_bottle if latest_price else 0
        })

    total_cases = sum(s.available_cases for s in stocks)
    total_bottles = sum((s.available_cases or 0) * (s.brand.bottles_per_case or 12) for s in stocks)

    res = {
        "depot_id": depot.id,
        "name": depot.name,
        "region": depot.region,
        "capacity_cases": depot.capacity_cases,
        "total_cases": total_cases,
        "total_bottles": total_bottles,
        "items": inventory
    }
    cache.set(cache_key, res, ttl=60)
    return res

@router.post("", response_model=schemas.DepotResponse)
def create_depot(depot_in: schemas.DepotCreateRequest, db: Session = Depends(get_db)):
    code_clean = depot_in.code.strip().upper()
    existing = db.query(models.Depot).filter(models.Depot.code == code_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Depot code '{code_clean}' already exists")

    new_depot = models.Depot(
        code=code_clean,
        name=depot_in.name.strip(),
        region=depot_in.region.strip(),
        address=depot_in.address.strip(),
        manager_name=depot_in.manager_name.strip(),
        phone=depot_in.phone.strip(),
        capacity_cases=depot_in.capacity_cases or 150000
    )
    db.add(new_depot)
    db.commit()
    db.refresh(new_depot)

    # Initialize depot stocks for existing active brands so this depot is immediately functional
    brands = db.query(models.Brand).filter(models.Brand.status == "ACTIVE").all()
    if not brands:
        brands = db.query(models.Brand).all()

    if brands:
        target_total = depot_in.initial_stock_cases if (depot_in.initial_stock_cases and depot_in.initial_stock_cases > 0) else 12000
        per_brand_cases = max(20, target_total // len(brands))
        for b in brands:
            stock = models.DepotStock(
                depot_id=new_depot.id,
                brand_id=b.id,
                available_cases=per_brand_cases,
                reserved_cases=0,
                damaged_cases=0
            )
            db.add(stock)
        db.commit()
        db.refresh(new_depot)

    # Invalidate cached depots
    cache.invalidate("depots")
    cache.invalidate("admin")

    total_stock = sum(s.available_cases for s in new_depot.stocks) if new_depot.stocks else 0
    return schemas.DepotResponse(
        id=new_depot.id,
        code=new_depot.code,
        name=new_depot.name,
        region=new_depot.region,
        address=new_depot.address,
        manager_name=new_depot.manager_name,
        phone=new_depot.phone,
        capacity_cases=new_depot.capacity_cases,
        total_stock_cases=total_stock
    )

