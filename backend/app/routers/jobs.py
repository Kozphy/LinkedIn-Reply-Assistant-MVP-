from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditAction, Job
from app.schemas import FitScoreRequest, FitScoreResponse, JobCreate, JobRead, JobUpdate
from app.services.audit import log_audit
from app.services.fit_scoring import calculate_fit_score

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _apply_fit_scoring(job: Job, user_skills: list[str] | None) -> None:
    if user_skills and job.description:
        score, missing, _ = calculate_fit_score(job.description, user_skills)
        job.fit_score = score
        job.missing_skills = ", ".join(missing) if missing else None


@router.get("", response_model=list[JobRead])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.updated_at.desc()).all()


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/fit-score", response_model=FitScoreResponse)
def compute_fit_score(payload: FitScoreRequest):
    score, missing, matched = calculate_fit_score(
        payload.description, payload.user_skills
    )
    return FitScoreResponse(
        fit_score=score, missing_skills=missing, matched_skills=matched
    )


@router.post("", response_model=JobRead, status_code=201)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"user_skills"})
    job = Job(**data)
    _apply_fit_scoring(job, payload.user_skills)
    db.add(job)
    db.flush()
    log_audit(db, "job", job.id, AuditAction.CREATE, data)
    db.commit()
    db.refresh(job)
    return job


@router.put("/{job_id}", response_model=JobRead)
def update_job(job_id: int, payload: JobUpdate, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    updates = payload.model_dump(exclude_unset=True, exclude={"user_skills"})
    user_skills = payload.user_skills
    for key, value in updates.items():
        setattr(job, key, value)
    if user_skills is not None:
        _apply_fit_scoring(job, user_skills)
    log_audit(db, "job", job.id, AuditAction.UPDATE, updates)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    log_audit(db, "job", job.id, AuditAction.DELETE, {"title": job.title})
    db.delete(job)
    db.commit()
