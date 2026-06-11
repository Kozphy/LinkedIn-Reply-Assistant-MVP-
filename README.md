# Career Intelligence CRM

Local-first web app for managing career networking, target companies, job opportunities, and LinkedIn-safe outreach — without scraping LinkedIn.

> **Compliance notice:** This app does not scrape LinkedIn. All profile data must be manually entered or user-confirmed.

## Features

- **Dashboard** — contacts, outreach funnel, follow-ups due, top target companies, recent interactions
- **Contacts** — CRUD, filters by company/status/relationship, source tracking (`manual`, `user_confirmed`, `public_company_site`, `referral`, `event`)
- **Contact detail** — profile, interaction timeline, outreach generator, next action
- **Companies** — target roles, career value, notes
- **Jobs** — paste descriptions, fit scoring against your skills, missing keyword detection
- **Outreach generator** — template-based LinkedIn-safe messages (no spam, no false connection claims)
- **Audit log** — create/update/delete tracked for all entities

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | Next.js 15, TypeScript |
| Backend | FastAPI, Python 3.11+ |
| Database | SQLite (local-first) |
| ORM | SQLAlchemy 2 |

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

On first startup, the database is created and seeded with sample data for **Deloitte**, **PwC**, **Cathay Pacific**, **ITRI**, and **Micron**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Optional: set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `frontend/.env.local`.

### 3. Run Tests

```bash
cd backend
pytest -v
```

## Project Layout

```text
backend/
  app/
    main.py              FastAPI app + CORS + compliance endpoints
    models.py            SQLAlchemy models (Contact, Company, Job, etc.)
    schemas.py           Pydantic validation
    seed.py              Sample seed data
    routers/             REST CRUD + dashboard + audit
    services/
      fit_scoring.py     Keyword-based job fit score
      message_generator.py  LinkedIn-safe outreach templates
      audit.py           Audit log helper
  tests/
    test_crud.py
    test_fit_scoring.py
  data/                  SQLite DB (gitignored)

frontend/
  src/app/               Next.js pages (dashboard, contacts, companies, jobs, outreach)
  src/components/        Sidebar, compliance banner
  src/lib/api.ts         API client

examples/sample-crm-data.md   Sample seed data reference
```

## API Endpoints

| Resource | Endpoints |
| --- | --- |
| Contacts | `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/{id}` |
| Companies | `GET/POST /api/companies`, `GET/PUT/DELETE /api/companies/{id}` |
| Jobs | `GET/POST /api/jobs`, `POST /api/jobs/fit-score`, `GET/PUT/DELETE /api/jobs/{id}` |
| Interactions | `GET/POST /api/interactions`, `GET/PUT/DELETE /api/interactions/{id}` |
| Outreach | `POST /api/outreach/generate`, `GET /api/outreach` |
| Dashboard | `GET /api/dashboard/stats` |
| Audit | `GET /api/audit` |
| Health | `GET /api/health`, `GET /api/compliance` |

## Safety & Compliance

| Control | Implementation |
| --- | --- |
| No LinkedIn scraping | No browser automation, no unofficial APIs |
| Manual data entry | All contact fields user-entered or confirmed |
| Source tracking | Every contact has a `source` field |
| Audit trail | All create/update/delete actions logged |
| Outreach safety | No spam phrases; honest connection disclosure |
| Compliance banner | Shown in UI and exposed via `/api/compliance` |

## Fit Scoring

Paste a job description and comma-separated skills. The scorer:

1. Extracts known skill keywords from the description
2. Compares against your skills (case-insensitive)
3. Returns fit %, matched skills, and missing skills

Example skills: `python`, `sql`, `aws`, `risk management`, `compliance`, `kubernetes`, etc.

## Sample Data

See [examples/sample-crm-data.md](./examples/sample-crm-data.md) for the seeded companies, contacts, jobs, and a sample outreach message.

## Original n8n Workflow

This repo also contains the original **LinkedIn Auto Reply MVP** (n8n + Gmail + Telegram) under:

- `workflows/linkedin-reply-assistant.n8n.json`
- `src/n8n/`
- `docs/architecture.md`

That workflow reads Gmail notifications only — it does not scrape LinkedIn.

## License

See [LICENSE](./LICENSE).
