from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditAction, Contact, OutreachMessage, OutreachStatus
from app.schemas import (
    OutreachMessageCreate,
    OutreachMessageRead,
    OutreachMessageUpdate,
)
from app.services.audit import log_audit
from app.services.message_generator import generate_outreach_message

router = APIRouter(prefix="/outreach", tags=["outreach"])


@router.get("", response_model=list[OutreachMessageRead])
def list_outreach_messages(db: Session = Depends(get_db)):
    return db.query(OutreachMessage).order_by(OutreachMessage.created_at.desc()).all()


@router.get("/{message_id}", response_model=OutreachMessageRead)
def get_outreach_message(message_id: int, db: Session = Depends(get_db)):
    message = db.get(OutreachMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Outreach message not found")
    return message


@router.post("/generate", response_model=OutreachMessageRead, status_code=201)
def generate_and_save_outreach(
    payload: OutreachMessageCreate, db: Session = Depends(get_db)
):
    contact = db.get(Contact, payload.contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    generated = generate_outreach_message(
        contact_name=contact.name,
        contact_title=contact.current_title,
        contact_company=contact.company,
        user_background=payload.user_background,
        goal=payload.goal,
        tone=payload.tone,
        has_personal_connection=payload.has_personal_connection,
    )

    message = OutreachMessage(
        contact_id=payload.contact_id,
        goal=payload.goal,
        tone=payload.tone,
        generated_message=generated,
        status=OutreachStatus.DRAFT,
    )
    db.add(message)
    db.flush()
    log_audit(
        db,
        "outreach_message",
        message.id,
        AuditAction.CREATE,
        {"contact_id": payload.contact_id, "goal": payload.goal},
    )
    db.commit()
    db.refresh(message)
    return message


@router.put("/{message_id}", response_model=OutreachMessageRead)
def update_outreach_message(
    message_id: int, payload: OutreachMessageUpdate, db: Session = Depends(get_db)
):
    message = db.get(OutreachMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Outreach message not found")
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(message, key, value)
    log_audit(db, "outreach_message", message.id, AuditAction.UPDATE, updates)
    db.commit()
    db.refresh(message)
    return message


@router.delete("/{message_id}", status_code=204)
def delete_outreach_message(message_id: int, db: Session = Depends(get_db)):
    message = db.get(OutreachMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Outreach message not found")
    log_audit(db, "outreach_message", message.id, AuditAction.DELETE, {})
    db.delete(message)
    db.commit()
