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
        inventory.append({
            "brand_id": brand.id,
            "brand_name": brand.name,
            "category": brand.category,
            "sub_category": brand.sub_category,
            "pack_size": brand.pack_size,
            "image_url": brand.image_url,
            "available_cases": s.available_cases,
            "wholesale_price": latest_price.wholesale_issue_price if latest_price else 0,
            "mrp": latest_price.mrp_per_bottle if latest_price else 0
        })

    res = {
        "depot_id": depot.id,
        "name": depot.name,
        "region": depot.region,
        "capacity_cases": depot.capacity_cases,
        "total_cases": sum(s.available_cases for s in stocks),
        "items": inventory
    }
    cache.set(cache_key, res, ttl=60)
    return res
