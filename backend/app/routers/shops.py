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
            assigned_depot_id=s.assigned_depot_id,
            license_number=s.license_number,
            license_expiry_date=s.license_expiry_date,
            license_status=s.license_status,
            credit_limit=s.credit_limit,
            current_credit_used=s.current_credit_used,
            monthly_quota_cases=s.monthly_quota_cases
        )
        for s in shops
    ]
    return results

@router.post("", response_model=schemas.RetailShopResponse, status_code=201)
def create_shop(payload: schemas.RetailShopOnboardRequest, db: Session = Depends(get_db)):
    # 1. Check or generate unique shop_code
    existing = db.query(models.RetailShop).filter(models.RetailShop.shop_code == payload.shop_code).first()
    if existing or not payload.shop_code:
        max_id = db.query(func.max(models.RetailShop.id)).scalar() or 1000
        shop_code = f"SHOP-{max_id + 1}"
    else:
        shop_code = payload.shop_code.strip()

    # 2. Resolve depot
    depot_id = payload.assigned_depot_id
    if not depot_id:
        dist_lower = (payload.district or "").lower()
        depot = None
        if "chennai" in dist_lower:
            depot = db.query(models.Depot).filter(models.Depot.code.ilike("%CHN%")).first()
        elif "coimbatore" in dist_lower:
            depot = db.query(models.Depot).filter(models.Depot.code.ilike("%CBE%")).first()
        elif "madurai" in dist_lower:
            depot = db.query(models.Depot).filter(models.Depot.code.ilike("%MDU%")).first()
        elif "salem" in dist_lower:
            depot = db.query(models.Depot).filter(models.Depot.code.ilike("%SLM%")).first()
        elif "trichy" in dist_lower or "tiruchirappalli" in dist_lower:
            depot = db.query(models.Depot).filter(models.Depot.code.ilike("%TRY%")).first()
        
        if not depot:
            depot = db.query(models.Depot).first()
        depot_id = depot.id if depot else 1

    new_shop = models.RetailShop(
        shop_code=shop_code,
        name=payload.name.strip() if payload.name else f"TASMAC Outlet {shop_code}",
        shop_type=payload.shop_type or "STANDARD_VEND",
        district=payload.district or "Chennai",
        address=payload.address or f"TASMAC Outlet, {payload.district}",
        manager_name=payload.manager_name or "Station Officer",
        phone=payload.phone or "+91 98401 00000",
        assigned_depot_id=depot_id,
        license_number=payload.license_number or f"TN-EXC-RET-2026/{shop_code.replace('SHOP-', '')}",
        license_expiry_date=datetime.utcnow() + timedelta(days=365),
        license_status="ACTIVE",
        credit_limit=float(payload.credit_limit or 800000.0),
        current_credit_used=0.0,
        monthly_quota_cases=int(payload.monthly_quota_cases or 750),
        cases_ordered_this_month=0,
        lat=payload.lat or 13.0827,
        lng=payload.lng or 80.2707,
    )
    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)

    # 3. Seed initial stock shelves for this shop from active brands
    all_brands = db.query(models.Brand).all()
    for b in all_brands:
        inv = models.ShopInventory(
            shop_id=new_shop.id,
            brand_id=b.id,
            cases_on_hand=25,
            bottles_on_shelf=36,
            daily_sales_rate=8.5,
            reorder_threshold_cases=10,
        )
        db.add(inv)
    db.commit()

    cache.invalidate("shops")
    cache.invalidate("dashboard:metrics")

    return schemas.RetailShopResponse(
        id=new_shop.id,
        shop_code=new_shop.shop_code,
        name=new_shop.name,
        shop_type=new_shop.shop_type,
        district=new_shop.district,
        address=new_shop.address,
        manager_name=new_shop.manager_name,
        phone=new_shop.phone,
        assigned_depot_id=new_shop.assigned_depot_id,
        license_number=new_shop.license_number,
        license_expiry_date=new_shop.license_expiry_date,
        license_status=new_shop.license_status,
        credit_limit=new_shop.credit_limit,
        current_credit_used=new_shop.current_credit_used,
        monthly_quota_cases=new_shop.monthly_quota_cases
    )

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

