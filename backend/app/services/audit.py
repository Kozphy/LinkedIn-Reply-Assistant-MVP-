import json

from sqlalchemy.orm import Session

from app.models import AuditAction, AuditLog


def log_audit(
    db: Session,
    entity_type: str,
    entity_id: int,
    action: AuditAction,
    details: dict | None = None,
) -> AuditLog:
    entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        details=json.dumps(details) if details else None,
    )
    db.add(entry)
    db.flush()
    return entry
