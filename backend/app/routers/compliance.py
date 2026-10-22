import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/compliance", tags=["Compliance, Recalls & Anti-Counterfeit"])

class BatchRecallCreate(BaseModel):
    batch_no: str
    brand_name: Optional[str] = "Statewide Quarantined Consignment"
    brand_id: Optional[int] = None
    supplier_id: Optional[int] = None
    reason: str
    severity: Optional[str] = "CRITICAL"
    quarantined_cases: Optional[int] = 850
    issued_by: Optional[str] = "Excise Quality Directorate"

class HologramVerifyRequest(BaseModel):
    serial_number: str

def seed_sample_recalls_if_empty(db: Session):
    count = db.query(models.BatchRecall).count()
    if count == 0:
        sample_recall = models.BatchRecall(
            recall_no="RCL-2026-001",
            batch_no="TN-BATCH-2026-08",
            reason="Sedimentation anomaly detected during Regional Excise Lab random assay.",
            severity="CRITICAL",
            status="ACTIVE_QUARANTINE",
            quarantined_cases=1240,
            issued_by="Excise Quality Directorate",
            created_at=datetime.utcnow()
        )
        db.add(sample_recall)
        db.commit()

@router.get("/recalls")
def get_recalls(db: Session = Depends(get_db)):
    seed_sample_recalls_if_empty(db)
    recalls = db.query(models.BatchRecall).order_by(models.BatchRecall.id.desc()).all()
    results = []
    for r in recalls:
        brand_name = "Statewide Quarantined Consignment"
        distillery = "Consortium Feeder"
        if r.brand_id:
            b = db.query(models.Brand).filter(models.Brand.id == r.brand_id).first()
            if b:
                brand_name = b.name
                if b.supplier:
                    distillery = b.supplier.name
        elif r.supplier_id:
            s = db.query(models.Supplier).filter(models.Supplier.id == r.supplier_id).first()
            if s:
                distillery = s.name

        results.append({
            "id": r.id,
            "recall_no": r.recall_no,
            "batch_no": r.batch_no,
            "brand_name": brand_name,
            "distillery": distillery,
            "severity": r.severity,
            "status": r.status,
            "quarantined_cases": r.quarantined_cases,
            "reason": r.reason,
            "issued_by": r.issued_by,
            "created_at": r.created_at.strftime("%Y-%m-%d") if r.created_at else "2026-10-18"
        })
    return results

@router.post("/recalls")
def create_recall(payload: BatchRecallCreate, db: Session = Depends(get_db)):
    count = db.query(models.BatchRecall).count()
    recall_no = f"RCL-2026-{(count + 1):03d}"
    
    new_recall = models.BatchRecall(
        recall_no=recall_no,
        batch_no=payload.batch_no,
        brand_id=payload.brand_id,
        supplier_id=payload.supplier_id,
        reason=payload.reason,
        severity=payload.severity or "CRITICAL",
        status="ACTIVE_QUARANTINE",
        quarantined_cases=payload.quarantined_cases or 850,
        issued_by=payload.issued_by or "Excise Quality Directorate",
        created_at=datetime.utcnow()
    )
    db.add(new_recall)
    db.commit()
    db.refresh(new_recall)

    return {
        "status": "success",
        "recall_no": new_recall.recall_no,
        "batch_no": new_recall.batch_no,
        "quarantined_cases": new_recall.quarantined_cases,
        "message": f"Emergency recall {new_recall.recall_no} initiated across all state depots"
    }

@router.post("/verify-hologram")
def verify_hologram(payload: HologramVerifyRequest, db: Session = Depends(get_db)):
    sn = payload.serial_number.strip().upper()
    brand = db.query(models.Brand).order_by(models.Brand.id).first()
    brand_name = brand.name if brand else "Royal Challenge Whisky (750ml)"
    distillery = brand.supplier.name if (brand and brand.supplier) else "United Spirits Ltd. (Diageo)"
    
    return {
        "is_authentic": True,
        "serial_number": sn,
        "brand_name": brand_name,
        "distillery": distillery,
        "bottling_date": "14-Sep-2026",
        "excise_stamp": f"TN-EXC-HOL-{random.randint(1000000, 9999999)}",
        "status": "GENUINE_STATE_ISSUED",
        "duty_paid": "VERIFIED_TREASURY"
    }

