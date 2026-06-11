from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditAction, Contact, Interaction
from app.schemas import InteractionCreate, InteractionRead, InteractionUpdate
from app.services.audit import log_audit

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.get("", response_model=list[InteractionRead])
def list_interactions(
    contact_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Interaction)
    if contact_id is not None:
        query = query.filter(Interaction.contact_id == contact_id)
    return query.order_by(Interaction.date.desc()).all()


@router.get("/{interaction_id}", response_model=InteractionRead)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.get(Interaction, interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction


@router.post("", response_model=InteractionRead, status_code=201)
def create_interaction(payload: InteractionCreate, db: Session = Depends(get_db)):
    if not db.get(Contact, payload.contact_id):
        raise HTTPException(status_code=404, detail="Contact not found")
    interaction = Interaction(**payload.model_dump())
    db.add(interaction)
    db.flush()
    log_audit(
        db, "interaction", interaction.id, AuditAction.CREATE, payload.model_dump(mode="json")
    )
    db.commit()
    db.refresh(interaction)
    return interaction


@router.put("/{interaction_id}", response_model=InteractionRead)
def update_interaction(
    interaction_id: int, payload: InteractionUpdate, db: Session = Depends(get_db)
):
    interaction = db.get(Interaction, interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    updates = payload.model_dump(exclude_unset=True)
    if "contact_id" in updates and not db.get(Contact, updates["contact_id"]):
        raise HTTPException(status_code=404, detail="Contact not found")
    for key, value in updates.items():
        setattr(interaction, key, value)
    log_audit(db, "interaction", interaction.id, AuditAction.UPDATE, updates)
    db.commit()
    db.refresh(interaction)
    return interaction


@router.delete("/{interaction_id}", status_code=204)
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.get(Interaction, interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    log_audit(db, "interaction", interaction.id, AuditAction.DELETE, {})
    db.delete(interaction)
    db.commit()
