import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload, joinedload
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from ..cache import cache

router = APIRouter(prefix="/api/orders", tags=["Retail Indents & Orders"])

@router.get("", response_model=List[schemas.OrderResponse])
def get_orders(
    shop_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    cache_key = f"orders:{shop_id or 'ALL'}:{status or 'ALL'}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    query = db.query(models.ShopOrder).options(
        selectinload(models.ShopOrder.items).joinedload(models.ShopOrderItem.brand),
        joinedload(models.ShopOrder.shop).joinedload(models.RetailShop.assigned_depot),
        joinedload(models.ShopOrder.depot)
    )

    if shop_id:
        query = query.filter(models.ShopOrder.shop_id == shop_id)
    if status and status != "ALL":
        query = query.filter(models.ShopOrder.status == status)

    orders = query.order_by(models.ShopOrder.created_at.desc()).all()
    results = []
    for o in orders:
        items = [
            schemas.OrderItemResponse(
                id=item.id,
                brand_id=item.brand_id,
                brand_name=item.brand.name if item.brand else f"Brand #{item.brand_id}",
                cases_ordered=item.cases_ordered,
                case_wholesale_price=item.case_wholesale_price,
                total_price=item.total_price
            )
            for item in o.items
        ]
        depot_name = o.depot.name if o.depot else (
            o.shop.assigned_depot.name if (o.shop and o.shop.assigned_depot) else f"Depot #{o.depot_id}"
        )
        results.append(
            schemas.OrderResponse(
                id=o.id,
                order_no=o.order_no,
                shop_id=o.shop_id,
                shop_name=o.shop.name if o.shop else f"Shop #{o.shop_id}",
                depot_id=o.depot_id,
                depot_name=depot_name,
                total_cases=o.total_cases,
                subtotal_amount=o.subtotal_amount,
                tax_duty_amount=o.tax_duty_amount,
                total_payable=o.total_payable,
                status=o.status,
                transit_pass_no=o.transit_pass_no,
                vehicle_no=o.vehicle_no,
                created_at=o.created_at,
                expected_delivery=o.expected_delivery,
                items=items
            )
        )
    cache.set(cache_key, results, ttl=60)
    return results

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    cache_key = f"orders:{order_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    o = db.query(models.ShopOrder).options(
        selectinload(models.ShopOrder.items).joinedload(models.ShopOrderItem.brand),
        joinedload(models.ShopOrder.shop),
        joinedload(models.ShopOrder.depot)
    ).filter(models.ShopOrder.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")

    items = [
        schemas.OrderItemResponse(
            id=item.id,
            brand_id=item.brand_id,
            brand_name=item.brand.name if item.brand else f"Brand #{item.brand_id}",
            cases_ordered=item.cases_ordered,
            case_wholesale_price=item.case_wholesale_price,
            total_price=item.total_price
        )
        for item in o.items
    ]
    result = schemas.OrderResponse(
        id=o.id,
        order_no=o.order_no,
        shop_id=o.shop_id,
        shop_name=o.shop.name if o.shop else f"Shop #{o.shop_id}",
        depot_id=o.depot_id,
        depot_name=o.depot.name if o.depot else f"Depot #{o.depot_id}",
        total_cases=o.total_cases,
        subtotal_amount=o.subtotal_amount,
        tax_duty_amount=o.tax_duty_amount,
        total_payable=o.total_payable,
        status=o.status,
        transit_pass_no=o.transit_pass_no,
        vehicle_no=o.vehicle_no,
        created_at=o.created_at,
        expected_delivery=o.expected_delivery,
        items=items
    )
    cache.set(cache_key, result, ttl=60)
    return result

@router.post("", response_model=schemas.OrderResponse, status_code=201)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    shop = db.query(models.RetailShop).filter(models.RetailShop.id == payload.shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Retail Shop not found")

    depot = db.query(models.Depot).filter(models.Depot.id == payload.depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot not found")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_cases = 0
    subtotal = 0.0
    items_to_create = []

    for item_data in payload.items:
        brand = db.query(models.Brand).filter(models.Brand.id == item_data.brand_id).first()
        if not brand:
            raise HTTPException(status_code=404, detail=f"Brand {item_data.brand_id} not found")

        price_entry = brand.prices[0] if brand.prices else None
        case_price = price_entry.wholesale_issue_price if price_entry else 2500.0

        item_total = case_price * item_data.cases_ordered
        total_cases += item_data.cases_ordered
        subtotal += item_total

        # Check / deduct depot stock
        depot_stock = db.query(models.DepotStock).filter(
            models.DepotStock.depot_id == payload.depot_id,
            models.DepotStock.brand_id == item_data.brand_id
        ).first()
        if depot_stock:
            depot_stock.available_cases = max(0, depot_stock.available_cases - item_data.cases_ordered)

        items_to_create.append({
            "brand_id": brand.id,
            "brand_name": brand.name,
            "cases_ordered": item_data.cases_ordered,
            "case_wholesale_price": case_price,
            "total_price": item_total
        })

    tax_duty = round(subtotal * 0.05, 2)
    total_payable = round(subtotal + tax_duty, 2)

    # Phase 2: Pre-checkout Approval Gate Validations
    if getattr(shop, "license_status", "ACTIVE") in ["EXPIRED", "BLOCKED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Order rejected: Retail Vend #{shop.shop_code} license is {shop.license_status}. Indenting suspended by Prohibition & Excise."
        )

    credit_limit = getattr(shop, "credit_limit", 800000.0) or 800000.0
    current_credit = getattr(shop, "current_credit_used", 0.0) or 0.0
    is_credit_exceeded = (current_credit + total_payable) > credit_limit

    monthly_quota = getattr(shop, "monthly_quota_cases", 750) or 750
    cases_used = getattr(shop, "cases_ordered_this_month", 0) or 0
    is_quota_exceeded = (cases_used + total_cases) > monthly_quota

    # Orders exceeding limits require Regional Manager sign-off
    initial_status = "PENDING_APPROVAL" if (is_credit_exceeded or is_quota_exceeded) else "CONFIRMED"

    order_rand = random.randint(1000, 9999)
    order_no = f"IND-2026-{order_rand}"
    tp_no = f"TP/{depot.region[:3].upper()}/2026/{random.randint(10000, 99999)}"
    vehicle_districts = ["01", "02", "04", "07", "09", "18", "22", "38"]
    vehicle_no = f"TN {random.choice(vehicle_districts)} {chr(random.randint(65, 90))}{chr(random.randint(65, 90))} {random.randint(1000, 9999)}"

    new_order = models.ShopOrder(
        order_no=order_no,
        shop_id=shop.id,
        depot_id=depot.id,
        total_cases=total_cases,
        subtotal_amount=round(subtotal, 2),
        tax_duty_amount=tax_duty,
        total_payable=total_payable,
        status=initial_status,
        transit_pass_no=tp_no,
        vehicle_no=vehicle_no,
        created_at=datetime.utcnow(),
        expected_delivery=datetime.utcnow() + timedelta(hours=random.choice([12, 18, 24]))
    )
    db.add(new_order)

    # Update shop usage telemetry
    shop.cases_ordered_this_month = cases_used + total_cases
    shop.current_credit_used = round(current_credit + total_payable, 2)
    db.flush()

    response_items = []
    for it in items_to_create:
        order_item = models.ShopOrderItem(
            order_id=new_order.id,
            brand_id=it["brand_id"],
            cases_ordered=it["cases_ordered"],
            case_wholesale_price=it["case_wholesale_price"],
            total_price=it["total_price"]
        )
        db.add(order_item)
        db.flush()

        response_items.append(
            schemas.OrderItemResponse(
                id=order_item.id,
                brand_id=order_item.brand_id,
                brand_name=it["brand_name"],
                cases_ordered=order_item.cases_ordered,
                case_wholesale_price=order_item.case_wholesale_price,
                total_price=order_item.total_price
            )
        )

    db.commit()
    db.refresh(new_order)

    # Invalidate stale caches after state change
    cache.invalidate("orders")
    cache.invalidate("depots")
    cache.invalidate("shops")
    cache.invalidate("dashboard")

    return schemas.OrderResponse(
        id=new_order.id,
        order_no=new_order.order_no,
        shop_id=shop.id,
        shop_name=shop.name,
        depot_id=depot.id,
        depot_name=depot.name,
        total_cases=new_order.total_cases,
        subtotal_amount=new_order.subtotal_amount,
        tax_duty_amount=new_order.tax_duty_amount,
        total_payable=new_order.total_payable,
        status=new_order.status,
        transit_pass_no=new_order.transit_pass_no,
        vehicle_no=new_order.vehicle_no,
        created_at=new_order.created_at,
        expected_delivery=new_order.expected_delivery,
        items=response_items
    )

@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    valid_statuses = ["PENDING", "PENDING_APPROVAL", "APPROVED", "CONFIRMED", "PACKED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "CANCELLED"]
    new_status = payload.status.upper().strip()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Must be one of {valid_statuses}"
        )

    order = db.query(models.ShopOrder).options(
        selectinload(models.ShopOrder.items).joinedload(models.ShopOrderItem.brand),
        joinedload(models.ShopOrder.shop),
        joinedload(models.ShopOrder.depot)
    ).filter(models.ShopOrder.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    order.status = new_status

    # If transitioning to DELIVERED, automatically restock the retail shop inventory
    if new_status == "DELIVERED" and old_status != "DELIVERED":
        for item in order.items:
            inventory = db.query(models.ShopInventory).filter(
                models.ShopInventory.shop_id == order.shop_id,
                models.ShopInventory.brand_id == item.brand_id
            ).first()
            if inventory:
                inventory.cases_on_hand += item.cases_ordered
                inventory.last_restocked = datetime.utcnow()
            else:
                new_inv = models.ShopInventory(
                    shop_id=order.shop_id,
                    brand_id=item.brand_id,
                    cases_on_hand=item.cases_ordered,
                    bottles_on_shelf=24,
                    daily_sales_rate=5.0,
                    reorder_threshold_cases=10,
                    last_restocked=datetime.utcnow()
                )
                db.add(new_inv)

    db.commit()
    db.refresh(order)

    # Invalidate caches
    cache.invalidate("orders")
    cache.invalidate("shops")
    cache.invalidate("dashboard")

    items = [
        schemas.OrderItemResponse(
            id=item.id,
            brand_id=item.brand_id,
            brand_name=item.brand.name if item.brand else f"Brand #{item.brand_id}",
            cases_ordered=item.cases_ordered,
            case_wholesale_price=item.case_wholesale_price,
            total_price=item.total_price
        )
        for item in order.items
    ]

    return schemas.OrderResponse(
        id=order.id,
        order_no=order.order_no,
        shop_id=order.shop_id,
        shop_name=order.shop.name if order.shop else f"Shop #{order.shop_id}",
        depot_id=order.depot_id,
        depot_name=order.depot.name if order.depot else f"Depot #{order.depot_id}",
        total_cases=order.total_cases,
        subtotal_amount=order.subtotal_amount,
        tax_duty_amount=order.tax_duty_amount,
        total_payable=order.total_payable,
        status=order.status,
        transit_pass_no=order.transit_pass_no,
        vehicle_no=order.vehicle_no,
        created_at=order.created_at,
        expected_delivery=order.expected_delivery,
        items=items
    )
