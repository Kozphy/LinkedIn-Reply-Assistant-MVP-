from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditAction, Contact, ContactStatus, RelationshipLevel
from app.schemas import ContactCreate, ContactRead, ContactUpdate
from app.services.audit import log_audit

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactRead])
def list_contacts(
    company: str | None = None,
    status: ContactStatus | None = None,
    relationship_level: RelationshipLevel | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Contact)
    if company:
        query = query.filter(Contact.company.ilike(f"%{company}%"))
    if status:
        query = query.filter(Contact.status == status)
    if relationship_level:
        query = query.filter(Contact.relationship_level == relationship_level)
    return query.order_by(Contact.updated_at.desc()).all()


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.post("", response_model=ContactRead, status_code=201)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    contact = Contact(**payload.model_dump())
    db.add(contact)
    db.flush()
    log_audit(db, "contact", contact.id, AuditAction.CREATE, payload.model_dump())
    db.commit()
    db.refresh(contact)
    return contact


@router.put("/{contact_id}", response_model=ContactRead)
def update_contact(
    contact_id: int, payload: ContactUpdate, db: Session = Depends(get_db)
):
    contact = db.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(contact, key, value)
    log_audit(db, "contact", contact.id, AuditAction.UPDATE, updates)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=204)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    log_audit(db, "contact", contact.id, AuditAction.DELETE, {"name": contact.name})
    db.delete(contact)
    db.commit()
