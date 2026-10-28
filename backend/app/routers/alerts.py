import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import uuid

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/alerts", tags=["System & Supply Chain Alerts"])

def evaluate_and_generate_alerts(db: Session):
    """
    Two-tier supply chain replenishment alert engine:
    Tier 1: Shop stock <= reorder threshold -> Alert Depot Manager & create indent alert
    Tier 2: Depot stock <= 350 cases -> Alert Manufacturing Distillery & create requisition alert
    """
    new_alerts = []

    # -------------------------------------------------------------
    # TIER 1: Retail Shop Low Stock -> Alert Assigned Depot
    # -------------------------------------------------------------
    low_shop_items = db.query(models.ShopInventory).options(
        joinedload(models.ShopInventory.shop),
        joinedload(models.ShopInventory.brand)
    ).filter(
        models.ShopInventory.cases_on_hand <= models.ShopInventory.reorder_threshold_cases
    ).all()

    for item in low_shop_items:
        shop = item.shop
        brand = item.brand
        if not shop or not brand:
            continue

        depot = db.query(models.Depot).filter(models.Depot.id == shop.assigned_depot_id).first()
        depot_name = depot.name if depot else "Assigned Wholesale Depot"

        # Check if an active alert already exists for this shop & brand
        title = f"Low Stock: {shop.name}"
        existing = db.query(models.SystemAlert).filter(
            models.SystemAlert.title == title,
            models.SystemAlert.message.like(f"%{brand.name}%"),
            models.SystemAlert.status != "DISMISSED"
        ).first()

        if not existing:
            alert = models.SystemAlert(
                alert_type="RETAIL_REPLENISHMENT",
                recipient=depot_name,
                recipient_role="DEPOT_MANAGER",
                title=title,
                message=f"{brand.name} has only {item.cases_on_hand} cases on hand (reorder threshold: {item.reorder_threshold_cases} cs). Replenishment indent dispatched to {depot_name}.",
                status="ACTIVE",
                created_at=datetime.utcnow()
            )
            db.add(alert)
            new_alerts.append(alert)

    # -------------------------------------------------------------
    # TIER 2: Wholesale Depot Low Stock -> Alert Manufacturing Company
    # -------------------------------------------------------------
    low_depot_stocks = db.query(models.DepotStock).options(
        joinedload(models.DepotStock.depot),
        joinedload(models.DepotStock.brand).joinedload(models.Brand.supplier)
    ).filter(
        models.DepotStock.available_cases <= 350
    ).all()

    for stock in low_depot_stocks:
        depot = stock.depot
        brand = stock.brand
        if not depot or not brand:
            continue

        supplier = brand.supplier
        supplier_name = supplier.name if supplier else "State Distilleries Pool"

        title = f"Depot Low Buffer: {depot.name}"
        existing = db.query(models.SystemAlert).filter(
            models.SystemAlert.title == title,
            models.SystemAlert.message.like(f"%{brand.name}%"),
            models.SystemAlert.status != "DISMISSED"
        ).first()

        if not existing:
            alert = models.SystemAlert(
                alert_type="DEPOT_REQUISITION",
                recipient=supplier_name,
                recipient_role="MANUFACTURER",
                title=title,
                message=f"{depot.name} stock for {brand.name} dropped to {stock.available_cases} cases (buffer: 350 cs). Inward consignment requisition dispatched to {supplier_name}.",
                status="ACTIVE",
                created_at=datetime.utcnow()
            )
            db.add(alert)
            new_alerts.append(alert)

    if new_alerts:
        try:
            db.commit()
        except Exception:
            db.rollback()

@router.get("", response_model=List[schemas.SystemAlertResponse])
def get_alerts(role: Optional[str] = None, db: Session = Depends(get_db)):
    # Run evaluation dynamically to catch any fresh threshold breaches
    evaluate_and_generate_alerts(db)

    query = db.query(models.SystemAlert).filter(models.SystemAlert.status != "DISMISSED")
    if role:
        query = query.filter(models.SystemAlert.recipient_role == role)

    alerts = query.order_by(models.SystemAlert.created_at.desc()).limit(50).all()
    return alerts

@router.post("/trigger-replenishment", response_model=schemas.ReplenishmentTriggerResponse)
def trigger_auto_replenishment(db: Session = Depends(get_db)):
    """
    Executes automated supply chain fulfillment:
    1. Generates ShopOrder indents for low-stock retail shops.
    2. Generates SupplierConsignment inward shipments for low-stock depots.
    """
    evaluate_and_generate_alerts(db)

    indents_created = 0
    consignments_created = 0

    # 1. Create indents for low shop items
    low_shop_items = db.query(models.ShopInventory).options(
        joinedload(models.ShopInventory.shop),
        joinedload(models.ShopInventory.brand).selectinload(models.Brand.prices)
    ).filter(
        models.ShopInventory.cases_on_hand <= models.ShopInventory.reorder_threshold_cases
    ).all()

    # Group by shop
    from collections import defaultdict
    shop_groups = defaultdict(list)
    for item in low_shop_items:
        if item.shop:
            shop_groups[item.shop].append(item)

    for shop, items in shop_groups.items():
        # Check if an active indent already exists today
        existing_order = db.query(models.ShopOrder).filter(
            models.ShopOrder.shop_id == shop.id,
            models.ShopOrder.status.in_(["CONFIRMED", "DISPATCHED", "IN_TRANSIT"])
        ).first()

        if not existing_order:
            order_no = f"IND-AUTO-{int(datetime.utcnow().timestamp()) % 10000:04d}-{random.randint(100, 999)}"
            order = models.ShopOrder(
                order_no=order_no,
                shop_id=shop.id,
                depot_id=shop.assigned_depot_id or 1,
                status="CONFIRMED",
                total_cases=0,
                total_payable=0.0,
                vehicle_no="TN 07 NO 3188",
                transit_pass_no=f"TN-TP-{int(datetime.utcnow().timestamp()) % 100000:05d}-VERIFIED",
                created_at=datetime.utcnow()
            )
            db.add(order)
            db.flush()

            total_cases = 0
            total_payable = 0.0
            for itm in items:
                # Order enough to reach 2.5x threshold
                cases_needed = max(10, (itm.reorder_threshold_cases * 2) - itm.cases_on_hand)
                price = itm.brand.prices[0].wholesale_issue_price if (itm.brand and itm.brand.prices) else 1200.0
                subtotal = cases_needed * price

                order_item = models.ShopOrderItem(
                    order_id=order.id,
                    brand_id=itm.brand_id,
                    cases_ordered=cases_needed,
                    case_wholesale_price=price,
                    total_price=subtotal
                )
                db.add(order_item)
                total_cases += cases_needed
                total_payable += subtotal

            order.total_cases = total_cases
            order.total_payable = total_payable
            indents_created += 1

    # 2. Create inward consignments for low depot stocks
    low_depot_stocks = db.query(models.DepotStock).options(
        joinedload(models.DepotStock.depot),
        joinedload(models.DepotStock.brand).joinedload(models.Brand.supplier),
        joinedload(models.DepotStock.brand).selectinload(models.Brand.prices)
    ).filter(
        models.DepotStock.available_cases <= 350
    ).all()

    depot_groups = defaultdict(list)
    for stock in low_depot_stocks:
        if stock.depot and stock.brand and stock.brand.supplier:
            depot_groups[(stock.depot, stock.brand.supplier)].append(stock)

    for (depot, supplier), stocks in depot_groups.items():
        existing_csg = db.query(models.SupplierConsignment).filter(
            models.SupplierConsignment.depot_id == depot.id,
            models.SupplierConsignment.supplier_id == supplier.id,
            models.SupplierConsignment.status.in_(["PLANNED", "DISPATCHED", "IN_TRANSIT"])
        ).first()

        if not existing_csg:
            csg_no = f"CSG-AUTO-{int(datetime.utcnow().timestamp()) % 10000:04d}-{random.randint(100, 999)}"
            batch_code = f"BTH-{datetime.utcnow().year}-{int(datetime.utcnow().timestamp()) % 10000:04d}"
            excise_code = f"TN-EXC-PRMT-{datetime.utcnow().year}/{int(datetime.utcnow().timestamp()) % 100000:05d}"
            csg = models.SupplierConsignment(
                consignment_no=csg_no,
                supplier_id=supplier.id,
                depot_id=depot.id,
                wholesale_unit="Wholesale 1",
                batch_no=batch_code,
                excise_permit_no=excise_code,
                vehicle_no="TN 22 BK 9042",
                driver_name="K. Murugan",
                driver_phone="+91 94440 12345",
                status="PLANNED",
                total_cases=0,
                total_value=0.0,
                created_at=datetime.utcnow()
            )
            db.add(csg)
            db.flush()

            tot_cases = 0
            tot_val = 0.0
            for stk in stocks:
                order_cs = max(200, 500 - stk.available_cases)
                rate = stk.brand.prices[0].ex_factory_price if (stk.brand and stk.brand.prices) else 900.0
                subtot = order_cs * rate

                csg_item = models.ConsignmentItem(
                    consignment_id=csg.id,
                    brand_id=stk.brand_id,
                    cases_dispatched=order_cs,
                    case_rate=rate,
                    total_amount=subtot
                )
                db.add(csg_item)
                tot_cases += order_cs
                tot_val += subtot

            csg.total_cases = tot_cases
            csg.total_value = tot_val
            consignments_created += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return schemas.ReplenishmentTriggerResponse(
        retail_alerts_created=len(low_shop_items),
        depot_alerts_created=len(low_depot_stocks),
        indents_generated=indents_created,
        consignments_generated=consignments_created,
        message=f"Auto-replenishment triggered: {indents_created} store indents dispatched to depots, {consignments_created} inward consignments requisitioned from distilleries."
    )

@router.post("/dismiss/{alert_id}")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(models.SystemAlert).filter(models.SystemAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "DISMISSED"
    db.commit()
    return {"status": "success", "message": "Alert dismissed"}

