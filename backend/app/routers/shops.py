from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from .. import models, schemas
from ..cache import cache

router = APIRouter(prefix="/api/shops", tags=["Retail Shops & Dashboard"])

@router.get("/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    cached = cache.get("dashboard:metrics")
    if cached is not None:
        return cached

    # Aggregated category counts in 1 single query
    cat_rows = db.query(models.Brand.category, func.count(models.Brand.id)).group_by(models.Brand.category).all()
    cat_counts = {cat: count for cat, count in cat_rows}

    total_brands = sum(cat_counts.values())
    total_shops = db.query(func.count(models.RetailShop.id)).scalar() or 0
    total_depots = db.query(func.count(models.Depot.id)).scalar() or 0

    total_wholesale_cases = db.query(func.coalesce(func.sum(models.DepotStock.available_cases), 0)).scalar() or 0

    orders = db.query(models.ShopOrder.status, models.ShopOrder.total_payable).all()
    total_orders = len(orders)
    total_sales_value = sum(o.total_payable for o in orders)
    pending_orders = sum(1 for o in orders if o.status in ["CONFIRMED", "DISPATCHED", "IN_TRANSIT"])

    result = {
        "total_brands": total_brands,
        "total_shops": total_shops,
        "total_depots": total_depots,
        "total_wholesale_cases": int(total_wholesale_cases),
        "total_orders": total_orders,
        "total_sales_value": round(float(total_sales_value), 2),
        "pending_orders": pending_orders,
        "categories": {
            "BEER": cat_counts.get("BEER", 0),
            "WHISKY": cat_counts.get("WHISKY", 0),
            "RUM": cat_counts.get("RUM", 0),
            "BRANDY": cat_counts.get("BRANDY", 0),
            "VODKA_GIN": cat_counts.get("VODKA", 0) + cat_counts.get("GIN", 0),
            "WINE": cat_counts.get("WINE", 0)
        }
    }
    cache.set("dashboard:metrics", result, ttl=30)
    return result

@router.get("", response_model=List[schemas.RetailShopResponse])
def get_shops(
    search: Optional[str] = Query(None, description="Search by shop code, name, address, or manager"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db)
):
    query = db.query(models.RetailShop)
    if district and district != "ALL":
        query = query.filter(models.RetailShop.district.ilike(f"%{district.strip()}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (models.RetailShop.shop_code.ilike(s)) |
            (models.RetailShop.name.ilike(s)) |
            (models.RetailShop.district.ilike(s)) |
            (models.RetailShop.address.ilike(s)) |
            (models.RetailShop.manager_name.ilike(s))
        )
    shops = query.all()
    results = [
        schemas.RetailShopResponse(
            id=s.id,
            shop_code=s.shop_code,
            name=s.name,
            shop_type=s.shop_type,
            district=s.district,
            address=s.address,
            manager_name=s.manager_name,
            phone=s.phone,
            assigned_depot_id=s.assigned_depot_id
        )
        for s in shops
    ]
    return results

@router.get("/{shop_id}", response_model=schemas.RetailShopResponse)
def get_shop(shop_id: int, db: Session = Depends(get_db)):
    cache_key = f"shops:{shop_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    shop = db.query(models.RetailShop).filter(models.RetailShop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    result = schemas.RetailShopResponse(
        id=shop.id,
        shop_code=shop.shop_code,
        name=shop.name,
        shop_type=shop.shop_type,
        district=shop.district,
        address=shop.address,
        manager_name=shop.manager_name,
        phone=shop.phone,
        assigned_depot_id=shop.assigned_depot_id
    )
    cache.set(cache_key, result, ttl=60)
    return result

@router.get("/{shop_id}/inventory", response_model=List[schemas.ShopInventoryResponse])
def get_shop_inventory(shop_id: int, db: Session = Depends(get_db)):
    cache_key = f"shops:{shop_id}:inventory"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    shop = db.query(models.RetailShop).filter(models.RetailShop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    # Single eager-loaded query to eliminate N+1 roundtrips to Supabase
    items = db.query(models.ShopInventory).options(
        joinedload(models.ShopInventory.brand).selectinload(models.Brand.prices)
    ).filter(models.ShopInventory.shop_id == shop_id).all()

    results = []
    for item in items:
        brand = item.brand
        latest_price = brand.prices[0] if (brand and brand.prices) else None
        mrp = latest_price.mrp_per_bottle if latest_price else 0.0
        btl_count = 24 if (brand and brand.category == 'BEER' and '500ml' in (brand.pack_size or '')) else 12
        ws_price = latest_price.wholesale_issue_price if (latest_price and latest_price.wholesale_issue_price) else round(mrp * btl_count * 0.755, 2)
        is_low = item.cases_on_hand <= item.reorder_threshold_cases

        results.append(
            schemas.ShopInventoryResponse(
                id=item.id,
                shop_id=item.shop_id,
                brand_id=item.brand_id,
                brand_code=brand.brand_code if brand else f"BRD-{item.brand_id}",
                brand_name=brand.name if brand else "Unknown",
                category=brand.category if brand else "OTHER",
                pack_size=brand.pack_size if brand else "750ml",
                image_url=brand.image_url if brand else None,
                cases_on_hand=item.cases_on_hand,
                bottles_on_shelf=item.bottles_on_shelf,
                daily_sales_rate=item.daily_sales_rate,
                reorder_threshold_cases=item.reorder_threshold_cases,
                mrp_per_bottle=mrp,
                wholesale_issue_price=ws_price,
                is_low_stock=is_low
            )
        )

    cache.set(cache_key, results, ttl=60)
    return results

class QuotaExtensionRequest(BaseModel):
    cases: Optional[int] = 100

@router.post("/{shop_id}/extend-quota")
def extend_shop_quota(shop_id: int, payload: Optional[QuotaExtensionRequest] = None, db: Session = Depends(get_db)):
    shop = db.query(models.RetailShop).filter(models.RetailShop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    additional_cases = payload.cases if payload and payload.cases else 100
    shop.monthly_quota_cases = (getattr(shop, "monthly_quota_cases", 750) or 750) + additional_cases
    db.commit()
    db.refresh(shop)
    cache.invalidate("shops")
    return {
        "status": "success",
        "shop_id": shop.id,
        "new_monthly_quota_cases": shop.monthly_quota_cases,
        "message": f"Quota for {shop.name} extended by +{additional_cases} cases"
    }

@router.post("/{shop_id}/renew-license")
def renew_shop_license(shop_id: int, db: Session = Depends(get_db)):
    shop = db.query(models.RetailShop).filter(models.RetailShop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop.license_status = "ACTIVE"
    shop.license_expiry = datetime.utcnow() + timedelta(days=365)
    db.commit()
    db.refresh(shop)
    cache.invalidate("shops")
    return {
        "status": "success",
        "shop_id": shop.id,
        "license_status": shop.license_status,
        "license_expiry": shop.license_expiry.strftime("%Y-%m-%d"),
        "message": f"Excise license for {shop.name} renewed for 1 year"
    }

