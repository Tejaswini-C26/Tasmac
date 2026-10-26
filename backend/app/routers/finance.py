import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/finance", tags=["Finance & Bottle Returns"])

def seed_sample_ledgers_if_empty(db: Session):
    count = db.query(models.FinancialLedger).count()
    if count == 0:
        sample_entries = [
            models.FinancialLedger(
                entry_no="LED-2026-001",
                party_type="RETAIL_SHOP",
                party_id=1,
                party_name="TASMAC Retail Vend #1042 (T. Nagar)",
                transaction_type="INVOICE_CHARGE",
                amount=145000.0,
                balance_after=145000.0,
                reference_id="IND-2026-4892",
                payment_mode="ON_CREDIT",
                notes="Replenishment indent fulfillment"
            ),
            models.FinancialLedger(
                entry_no="LED-2026-002",
                party_type="RETAIL_SHOP",
                party_id=1,
                party_name="TASMAC Retail Vend #1042 (T. Nagar)",
                transaction_type="BOTTLE_REFUND",
                amount=3600.0,
                balance_after=141400.0,
                reference_id="RET-2026-101",
                payment_mode="CREDIT_NOTE",
                notes="240 empty bottles & 12 crates DRS refund"
            ),
            models.FinancialLedger(
                entry_no="LED-2026-003",
                party_type="SUPPLIER",
                party_id=1,
                party_name="United Breweries Ltd.",
                transaction_type="SUPPLIER_PAYOUT",
                amount=485000.0,
                balance_after=0.0,
                reference_id="PO-2026-UB-91",
                payment_mode="RTGS_STATE_BANK",
                notes="Monthly clearance of Kingfisher consignments"
            )
        ]
        db.add_all(sample_entries)

        sample_return = models.BottleReturn(
            return_no="RET-2026-101",
            shop_id=1,
            depot_id=1,
            driver_name="K. Selvakumar",
            bottles_returned=240,
            crates_returned=12,
            bottle_deposit_rate=10.0,
            crate_deposit_rate=50.0,
            total_refund_amount=3600.0,
            refund_status="CREDITED_TO_LEDGER"
        )
        db.add(sample_return)
        db.commit()

@router.get("/summary")
def get_finance_summary(db: Session = Depends(get_db)):
    seed_sample_ledgers_if_empty(db)

    shops = db.query(models.RetailShop).all()
    suppliers = db.query(models.Supplier).all()
    returns = db.query(models.BottleReturn).all()

    total_shop_receivables = sum(getattr(s, "current_credit_used", 0.0) or 0.0 for s in shops)
    total_supplier_liabilities = sum(getattr(s, "payout_balance", 0.0) or 0.0 for s in suppliers)
    total_bottle_refunds = sum(r.total_refund_amount for r in returns)
    total_bottles_recycled = sum(r.bottles_returned for r in returns)

    return {
        "total_receivables": round(float(total_shop_receivables), 2),
        "total_supplier_payouts": round(float(total_supplier_liabilities), 2),
        "total_bottle_refunds": round(float(total_bottle_refunds), 2),
        "total_bottles_recycled": total_bottles_recycled,
        "monitored_shops": len(shops),
        "monitored_suppliers": len(suppliers)
    }

@router.get("/ledgers", response_model=List[schemas.FinancialLedgerResponse])
def get_financial_ledgers(
    party_type: Optional[str] = None,
    party_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    seed_sample_ledgers_if_empty(db)
    query = db.query(models.FinancialLedger)

    if party_type and party_type != "ALL":
        query = query.filter(models.FinancialLedger.party_type == party_type)
    if party_id:
        query = query.filter(models.FinancialLedger.party_id == party_id)

    return query.order_by(models.FinancialLedger.created_at.desc()).all()

@router.get("/returns", response_model=List[schemas.BottleReturnResponse])
def get_bottle_returns(
    shop_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    seed_sample_ledgers_if_empty(db)
    query = db.query(models.BottleReturn)
    if shop_id:
        query = query.filter(models.BottleReturn.shop_id == shop_id)

    returns = query.order_by(models.BottleReturn.created_at.desc()).all()
    results = []
    for r in returns:
        results.append(
            schemas.BottleReturnResponse(
                id=r.id,
                return_no=r.return_no,
                shop_id=r.shop_id,
                shop_name=r.shop.name if r.shop else f"Shop #{r.shop_id}",
                depot_id=r.depot_id,
                depot_name=r.depot.name if r.depot else f"Depot #{r.depot_id}",
                driver_name=r.driver_name,
                bottles_returned=r.bottles_returned,
                crates_returned=r.crates_returned,
                bottle_deposit_rate=r.bottle_deposit_rate,
                crate_deposit_rate=r.crate_deposit_rate,
                total_refund_amount=r.total_refund_amount,
                refund_status=r.refund_status,
                created_at=r.created_at
            )
        )
    return results

@router.post("/returns", response_model=schemas.BottleReturnResponse, status_code=201)
def create_bottle_return(payload: schemas.BottleReturnCreate, db: Session = Depends(get_db)):
    shop = db.query(models.RetailShop).filter(models.RetailShop.id == payload.shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Retail Shop not found")

    depot = db.query(models.Depot).filter(models.Depot.id == payload.depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot not found")

    refund_amount = round(
        (payload.bottles_returned * payload.bottle_deposit_rate) +
        (payload.crates_returned * payload.crate_deposit_rate),
        2
    )
    return_no = f"RET-2026-{random.randint(1000, 9999)}"

    new_return = models.BottleReturn(
        return_no=return_no,
        shop_id=shop.id,
        depot_id=depot.id,
        driver_name=payload.driver_name or "K. Selvakumar",
        bottles_returned=payload.bottles_returned,
        crates_returned=payload.crates_returned,
        bottle_deposit_rate=payload.bottle_deposit_rate,
        crate_deposit_rate=payload.crate_deposit_rate,
        total_refund_amount=refund_amount,
        refund_status="CREDITED_TO_LEDGER",
        created_at=datetime.utcnow()
    )
    db.add(new_return)

    # Automatically credit shop balance in ledger
    new_balance = max(0.0, getattr(shop, "current_credit_used", 0.0) - refund_amount)
    shop.current_credit_used = new_balance

    ledger_entry = models.FinancialLedger(
        entry_no=f"LED-2026-{random.randint(1000, 9999)}",
        party_type="RETAIL_SHOP",
        party_id=shop.id,
        party_name=shop.name,
        transaction_type="BOTTLE_REFUND",
        amount=refund_amount,
        balance_after=new_balance,
        reference_id=return_no,
        payment_mode="CREDIT_NOTE",
        notes=f"DRS Refund: {payload.bottles_returned} bottles & {payload.crates_returned} crates returned."
    )
    db.add(ledger_entry)
    db.commit()
    db.refresh(new_return)

    return schemas.BottleReturnResponse(
        id=new_return.id,
        return_no=new_return.return_no,
        shop_id=shop.id,
        shop_name=shop.name,
        depot_id=depot.id,
        depot_name=depot.name,
        driver_name=new_return.driver_name,
        bottles_returned=new_return.bottles_returned,
        crates_returned=new_return.crates_returned,
        bottle_deposit_rate=new_return.bottle_deposit_rate,
        crate_deposit_rate=new_return.crate_deposit_rate,
        total_refund_amount=new_return.total_refund_amount,
        refund_status=new_return.refund_status,
        created_at=new_return.created_at
    )

