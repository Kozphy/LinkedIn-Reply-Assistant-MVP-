from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditAction, Company
from app.schemas import CompanyCreate, CompanyRead, CompanyUpdate
from app.services.audit import log_audit

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=list[CompanyRead])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.name).all()


@router.get("/{company_id}", response_model=CompanyRead)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("", response_model=CompanyRead, status_code=201)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    company = Company(**payload.model_dump())
    db.add(company)
    db.flush()
    log_audit(db, "company", company.id, AuditAction.CREATE, payload.model_dump())
    db.commit()
    db.refresh(company)
    return company


@router.put("/{company_id}", response_model=CompanyRead)
def update_company(
    company_id: int, payload: CompanyUpdate, db: Session = Depends(get_db)
):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(company, key, value)
    log_audit(db, "company", company.id, AuditAction.UPDATE, updates)
    db.commit()
    db.refresh(company)
    return company


@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    log_audit(db, "company", company.id, AuditAction.DELETE, {"name": company.name})
    db.delete(company)
    db.commit()
