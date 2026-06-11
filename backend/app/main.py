from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routers import audit, companies, contacts, dashboard, interactions, jobs, outreach
from app.seed import seed_database

COMPLIANCE_NOTICE = (
    "This app does not scrape LinkedIn. "
    "All profile data must be manually entered or user-confirmed."
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Career Intelligence CRM",
    description="LinkedIn-safe career networking CRM. " + COMPLIANCE_NOTICE,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contacts.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(interactions.router, prefix="/api")
app.include_router(outreach.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(audit.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "compliance_notice": COMPLIANCE_NOTICE}


@app.get("/api/compliance")
def compliance_notice():
    return {"notice": COMPLIANCE_NOTICE}
