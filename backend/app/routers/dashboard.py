from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Company, Contact, ContactStatus, Interaction
from app.schemas import DashboardStats, InteractionRead

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_contacts = db.query(Contact).count()
    contacted_count = db.query(Contact).filter(
        Contact.status.in_([ContactStatus.CONTACTED, ContactStatus.REPLIED, ContactStatus.FOLLOW_UP_DUE])
    ).count()
    replied_count = db.query(Contact).filter(
        Contact.status == ContactStatus.REPLIED
    ).count()

    today = date.today()
    follow_up_due_count = db.query(Interaction).filter(
        Interaction.next_follow_up_date.isnot(None),
        Interaction.next_follow_up_date <= today,
    ).count()

    top_companies = (
        db.query(Company.name, Company.career_value)
        .filter(Company.career_value.in_(["high", "medium"]))
        .order_by(Company.career_value.desc(), Company.name)
        .limit(5)
        .all()
    )
    top_target_companies = [
        {"name": name, "career_value": career_value or "medium"}
        for name, career_value in top_companies
    ]

    recent = (
        db.query(Interaction)
        .order_by(Interaction.date.desc())
        .limit(5)
        .all()
    )

    return DashboardStats(
        total_contacts=total_contacts,
        contacted_count=contacted_count,
        replied_count=replied_count,
        follow_up_due_count=follow_up_due_count,
        top_target_companies=top_target_companies,
        recent_interactions=[InteractionRead.model_validate(i) for i in recent],
    )
