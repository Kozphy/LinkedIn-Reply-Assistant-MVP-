from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models import (
    AuditAction,
    ContactSource,
    ContactStatus,
    JobStatus,
    OutreachStatus,
    RelationshipLevel,
)


class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    industry: str | None = None
    country: str | None = None
    target_roles: str | None = None
    career_value: str | None = None
    notes: str | None = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    industry: str | None = None
    country: str | None = None
    target_roles: str | None = None
    career_value: str | None = None
    notes: str | None = None


class CompanyRead(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    linkedin_url: str | None = None
    current_title: str | None = None
    company: str | None = None
    location: str | None = None
    relationship_level: RelationshipLevel = RelationshipLevel.COLD
    status: ContactStatus = ContactStatus.NEW
    source: ContactSource = ContactSource.MANUAL
    notes: str | None = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    linkedin_url: str | None = None
    current_title: str | None = None
    company: str | None = None
    location: str | None = None
    relationship_level: RelationshipLevel | None = None
    status: ContactStatus | None = None
    source: ContactSource | None = None
    notes: str | None = None


class ContactRead(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class JobBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    url: str | None = None
    location: str | None = None
    description: str | None = None
    status: JobStatus = JobStatus.SAVED
    fit_score: float | None = None
    missing_skills: str | None = None
    next_action: str | None = None


class JobCreate(JobBase):
    user_skills: list[str] | None = None


class JobUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    company: str | None = Field(None, min_length=1, max_length=255)
    url: str | None = None
    location: str | None = None
    description: str | None = None
    status: JobStatus | None = None
    fit_score: float | None = None
    missing_skills: str | None = None
    next_action: str | None = None
    user_skills: list[str] | None = None


class JobRead(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class InteractionBase(BaseModel):
    contact_id: int
    date: date
    channel: str = Field(..., min_length=1, max_length=100)
    message: str | None = None
    result: str | None = None
    next_follow_up_date: date | None = None


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(BaseModel):
    contact_id: int | None = None
    date: date | None = None
    channel: str | None = Field(None, min_length=1, max_length=100)
    message: str | None = None
    result: str | None = None
    next_follow_up_date: date | None = None


class InteractionRead(InteractionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class OutreachMessageBase(BaseModel):
    contact_id: int
    goal: str = Field(..., min_length=1, max_length=255)
    tone: str = Field(..., min_length=1, max_length=100)
    generated_message: str = Field(..., min_length=1)
    status: OutreachStatus = OutreachStatus.DRAFT


class OutreachMessageCreate(BaseModel):
    contact_id: int
    goal: str = Field(..., min_length=1, max_length=255)
    tone: Literal["professional", "warm", "curious", "direct"] = "professional"
    user_background: str = Field(..., min_length=1)
    has_personal_connection: bool = False


class OutreachMessageUpdate(BaseModel):
    goal: str | None = Field(None, min_length=1, max_length=255)
    tone: str | None = Field(None, min_length=1, max_length=100)
    generated_message: str | None = Field(None, min_length=1)
    status: OutreachStatus | None = None


class OutreachMessageRead(OutreachMessageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class FitScoreRequest(BaseModel):
    description: str = Field(..., min_length=1)
    user_skills: list[str] = Field(..., min_length=1)


class FitScoreResponse(BaseModel):
    fit_score: float
    missing_skills: list[str]
    matched_skills: list[str]


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entity_type: str
    entity_id: int
    action: AuditAction
    details: str | None
    created_at: datetime


class DashboardStats(BaseModel):
    total_contacts: int
    contacted_count: int
    replied_count: int
    follow_up_due_count: int
    top_target_companies: list[dict[str, int | str]]
    recent_interactions: list[InteractionRead]
