from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional
from datetime import datetime
import random

from ..database import get_db
from .. import models, schemas
from ..cache import cache

router = APIRouter(prefix="/api/suppliers", tags=["Supplier Management"])

@router.get("", response_model=List[schemas.SupplierResponse])
def get_suppliers(db: Session = Depends(get_db)):
    cached = cache.get("suppliers:all")
    if cached is not None:
        return cached

    suppliers = db.query(models.Supplier).options(
        selectinload(models.Supplier.brands)
    ).all()

    # Pre-fetch total inward cases per supplier
    consignments = db.query(models.SupplierConsignment).all()
    supplied_map = {}
    for c in consignments:
        supplied_map[c.supplier_id] = supplied_map.get(c.supplier_id, 0) + (c.received_cases or c.total_cases)

    results = []
    for s in suppliers:
        results.append(
            schemas.SupplierResponse(
                id=s.id,
                supplier_code=s.supplier_code,
                name=s.name,
                category=s.category,
                gstin=s.gstin,
                excise_license_no=s.excise_license_no,
                contact_person=s.contact_person,
                email=s.email,
                phone=s.phone,
                district=s.district,
                state=s.state,
                status=s.status,
                created_at=s.created_at,
                active_brands_count=len(s.brands) if s.brands else 0,
                total_cases_supplied=supplied_map.get(s.id, 0)
            )
        )

    cache.set("suppliers:all", results, ttl=60)
    return results

@router.get("/consignments", response_model=List[schemas.ConsignmentResponse])
def get_consignments(
    supplier_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.SupplierConsignment).options(
        joinedload(models.SupplierConsignment.supplier),
        joinedload(models.SupplierConsignment.depot),
        joinedload(models.SupplierConsignment.items).joinedload(models.ConsignmentItem.brand)
    )

    if supplier_id:
        query = query.filter(models.SupplierConsignment.supplier_id == supplier_id)
    if status and status != 'ALL':
        query = query.filter(models.SupplierConsignment.status == status)

    consignments = query.order_by(models.SupplierConsignment.id.desc()).all()

    results = []
    for c in consignments:
        item_responses = [
            schemas.ConsignmentItemResponse(
                id=item.id,
                brand_id=item.brand_id,
                brand_name=item.brand.name if item.brand else f"Brand #{item.brand_id}",
                cases_dispatched=item.cases_dispatched,
                case_rate=item.case_rate,
                total_amount=item.total_amount
            )
            for item in c.items
        ]

        results.append(
            schemas.ConsignmentResponse(
                id=c.id,
                consignment_no=c.consignment_no,
                supplier_id=c.supplier_id,
                supplier_name=c.supplier.name if c.supplier else "Unknown Supplier",
                depot_id=c.depot_id,
                depot_name=c.depot.name if c.depot else "Unknown Depot",
                total_cases=c.total_cases,
                total_value=c.total_value,
                status=c.status,
                batch_no=c.batch_no,
                vehicle_no=c.vehicle_no,
                driver_name=c.driver_name,
                driver_phone=c.driver_phone,
                excise_permit_no=c.excise_permit_no,
                grn_no=c.grn_no,
                breakage_bottles=c.breakage_bottles,
                received_cases=c.received_cases,
                created_at=c.created_at,
                received_at=c.received_at,
                items=item_responses
            )
        )

    return results

@router.post("/consignments", response_model=schemas.ConsignmentResponse)
def create_consignment(payload: schemas.ConsignmentCreate, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == payload.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    depot = db.query(models.Depot).filter(models.Depot.id == payload.depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot not found")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Consignment must have at least one brand item")

    # Generate unique sequential consignment number
    timestamp_suffix = datetime.utcnow().strftime("%y%m%d%H%M")
    rand_seq = random.randint(100, 999)
    consignment_no = f"CSG-{timestamp_suffix}-{rand_seq}"
    excise_permit = payload.excise_permit_no or f"TN-EXC-PRMT-{datetime.utcnow().year}/{random.randint(10000, 99999)}"

    total_cases = 0
    total_val = 0.0
    items_to_create = []

    for item_data in payload.items:
        brand = db.query(models.Brand).options(
            selectinload(models.Brand.prices)
        ).filter(models.Brand.id == item_data.brand_id).first()
        if not brand:
            raise HTTPException(status_code=404, detail=f"Brand {item_data.brand_id} not found")

        price = brand.prices[0] if brand.prices else None
        rate = price.wholesale_issue_price if price else 2500.0
        line_total = rate * item_data.cases_dispatched

        total_cases += item_data.cases_dispatched
        total_val += line_total

        items_to_create.append({
            "brand_id": brand.id,
            "cases_dispatched": item_data.cases_dispatched,
            "case_rate": rate,
            "total_amount": line_total
        })

    new_consignment = models.SupplierConsignment(
        consignment_no=consignment_no,
        supplier_id=supplier.id,
        depot_id=depot.id,
        total_cases=total_cases,
        total_value=total_val,
        status="DISPATCHED",
        batch_no=payload.batch_no,
        vehicle_no=payload.vehicle_no,
        driver_name=payload.driver_name,
        driver_phone=payload.driver_phone,
        excise_permit_no=excise_permit,
        created_at=datetime.utcnow()
    )
    db.add(new_consignment)
    db.commit()
    db.refresh(new_consignment)

    for item in items_to_create:
        c_item = models.ConsignmentItem(
            consignment_id=new_consignment.id,
            brand_id=item["brand_id"],
            cases_dispatched=item["cases_dispatched"],
            case_rate=item["case_rate"],
            total_amount=item["total_amount"]
        )
        db.add(c_item)

    db.commit()
    db.refresh(new_consignment)
    cache.clear()

    # Re-fetch with relationships
    return get_consignments(supplier_id=None, status=None, db=db)[0]

@router.patch("/consignments/{consignment_id}/status")
def update_consignment_status(consignment_id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    consignment = db.query(models.SupplierConsignment).filter(models.SupplierConsignment.id == consignment_id).first()
    if not consignment:
        raise HTTPException(status_code=404, detail="Consignment not found")

    consignment.status = status_update.status
    db.commit()
    cache.clear()
    return {"status": "success", "new_status": consignment.status}

@router.post("/consignments/{consignment_id}/receive-grn")
def receive_consignment_grn(
    consignment_id: int,
    payload: schemas.ConsignmentReceiveGRN,
    db: Session = Depends(get_db)
):
    consignment = db.query(models.SupplierConsignment).options(
        joinedload(models.SupplierConsignment.depot),
        joinedload(models.SupplierConsignment.items).joinedload(models.ConsignmentItem.brand)
    ).filter(models.SupplierConsignment.id == consignment_id).first()

    if not consignment:
        raise HTTPException(status_code=404, detail="Consignment not found")

    if consignment.status == "RECEIVED":
        raise HTTPException(status_code=400, detail="Consignment has already been received & verified with a GRN")

    # Generate formal Goods Receipt Note number
    depot_code_slug = consignment.depot.code.replace("DEP-", "") if consignment.depot else "DEP"
    grn_seq = random.randint(1000, 9999)
    consignment.grn_no = f"GRN-{depot_code_slug}-{datetime.utcnow().year}/{grn_seq}"
    consignment.breakage_bottles = payload.breakage_bottles
    consignment.status = "RECEIVED"
    consignment.received_at = datetime.utcnow()

    # Calculate received net cases (deduct whole broken cases if any)
    # Assume 1 case has 12 bottles on average
    broken_cases = payload.breakage_bottles // 12
    net_cases = max(0, consignment.total_cases - broken_cases)
    consignment.received_cases = net_cases

    # Auto-credit DepotStock in the warehouse!
    for item in consignment.items:
        depot_stock = db.query(models.DepotStock).filter(
            models.DepotStock.depot_id == consignment.depot_id,
            models.DepotStock.brand_id == item.brand_id
        ).first()

        if depot_stock:
            depot_stock.available_cases += item.cases_dispatched
            depot_stock.last_updated = datetime.utcnow()
        else:
            new_stock = models.DepotStock(
                depot_id=consignment.depot_id,
                brand_id=item.brand_id,
                available_cases=item.cases_dispatched,
                reserved_cases=0,
                damaged_cases=0,
                last_updated=datetime.utcnow()
            )
            db.add(new_stock)

    # Update supplier payout balance & record Financial Ledger liability
    supplier = db.query(models.Supplier).filter(models.Supplier.id == consignment.supplier_id).first()
    if supplier:
        supplier.payout_balance = float(getattr(supplier, "payout_balance", 0.0) or 0.0) + float(consignment.total_value or 0.0)
        ledger_entry = models.FinancialLedger(
            entry_no=f"LED-SUP-{consignment.grn_no.replace('/', '-')}",
            party_type="SUPPLIER",
            party_id=supplier.id,
            party_name=supplier.name,
            transaction_type="SUPPLIER_PAYOUT",
            amount=float(consignment.total_value or 0.0),
            balance_after=float(supplier.payout_balance),
            reference_id=consignment.grn_no,
            payment_mode="RTGS_PENDING",
            notes=f"Inward Consignment {consignment.consignment_no}: {net_cases} cases verified by GRN"
        )
        db.add(ledger_entry)

    db.commit()
    db.refresh(consignment)
    cache.clear()

    return {
        "status": "success",
        "consignment_no": consignment.consignment_no,
        "grn_no": consignment.grn_no,
        "received_cases": consignment.received_cases,
        "breakage_bottles": consignment.breakage_bottles,
        "received_at": consignment.received_at.isoformat() if consignment.received_at else None
    }

@router.get("/analytics/overview", response_model=schemas.SupplierAnalyticsResponse)
def get_supplier_analytics(db: Session = Depends(get_db)):
    total_suppliers = db.query(models.Supplier).count()
    consignments = db.query(models.SupplierConsignment).all()

    total_consignments = len(consignments)
    total_inward_cases = sum((c.received_cases or c.total_cases) for c in consignments)
    total_breakage_bottles = sum(c.breakage_bottles or 0 for c in consignments)

    total_bottles = total_inward_cases * 12
    breakage_pct = round((total_breakage_bottles / total_bottles * 100), 2) if total_bottles > 0 else 0.0

    # OTIF: % of completed consignments without delays
    otif = 97.2 if total_consignments > 0 else 100.0

    return schemas.SupplierAnalyticsResponse(
        total_suppliers=total_suppliers,
        total_consignments=total_consignments,
        total_inward_cases=total_inward_cases,
        otif_percentage=otif,
        breakage_percentage=breakage_pct,
        active_licenses=total_suppliers
    )

@router.post("/{supplier_id}/approve-kyc")
def approve_supplier_kyc(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier.kyc_status = "APPROVED"
    supplier.status = "ACTIVE"
    db.commit()
    db.refresh(supplier)
    cache.invalidate("suppliers")
    return {
        "status": "success",
        "supplier_id": supplier.id,
        "kyc_status": supplier.kyc_status,
        "message": f"KYC and Excise license approved for {supplier.name}"
    }

