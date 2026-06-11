from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import (
    Company,
    Contact,
    ContactSource,
    ContactStatus,
    Interaction,
    Job,
    JobStatus,
    RelationshipLevel,
)


def seed_database(db: Session) -> None:
    if db.query(Company).count() > 0:
        return

    companies = [
        Company(
            name="Deloitte",
            industry="Professional Services",
            country="Global",
            target_roles="Consultant, Senior Consultant, Manager, Risk Advisory",
            career_value="high",
            notes="Strong Big 4 brand; good for consulting and risk advisory paths.",
        ),
        Company(
            name="PwC",
            industry="Professional Services",
            country="Global",
            target_roles="Associate, Senior Associate, Manager, Technology Consulting",
            career_value="high",
            notes="Broad practice areas; strong technology consulting footprint.",
        ),
        Company(
            name="Cathay Pacific",
            industry="Aviation",
            country="Hong Kong",
            target_roles="Analyst, Manager, Digital Transformation, Operations",
            career_value="medium",
            notes="Regional airline with digital and operations opportunities.",
        ),
        Company(
            name="ITRI",
            industry="Research & Technology",
            country="Taiwan",
            target_roles="Researcher, Engineer, Project Manager, R&D Lead",
            career_value="medium",
            notes="Government-backed R&D institute; strong in semiconductors and IoT.",
        ),
        Company(
            name="Micron",
            industry="Semiconductors",
            country="Global",
            target_roles="Process Engineer, Software Engineer, Product Manager, Supply Chain",
            career_value="high",
            notes="Leading memory manufacturer; strong engineering and ops roles.",
        ),
    ]
    db.add_all(companies)
    db.flush()

    contacts = [
        Contact(
            name="Sarah Chen",
            linkedin_url="https://www.linkedin.com/in/example-sarah-chen",
            current_title="Senior Manager, Risk Advisory",
            company="Deloitte",
            location="Hong Kong",
            relationship_level=RelationshipLevel.WARM,
            status=ContactStatus.CONTACTED,
            source=ContactSource.EVENT,
            notes="Met at risk management conference. Interested in fintech risk.",
        ),
        Contact(
            name="James Wong",
            linkedin_url="https://www.linkedin.com/in/example-james-wong",
            current_title="Technology Consulting Manager",
            company="PwC",
            location="Singapore",
            relationship_level=RelationshipLevel.COLD,
            status=ContactStatus.NEW,
            source=ContactSource.MANUAL,
            notes="Target for cloud transformation networking.",
        ),
        Contact(
            name="Emily Liu",
            linkedin_url="https://www.linkedin.com/in/example-emily-liu",
            current_title="Digital Transformation Lead",
            company="Cathay Pacific",
            location="Hong Kong",
            relationship_level=RelationshipLevel.STRONG,
            status=ContactStatus.REPLIED,
            source=ContactSource.REFERRAL,
            notes="Referred by former colleague. Open to coffee chat.",
        ),
        Contact(
            name="Dr. Kevin Hsu",
            linkedin_url="https://www.linkedin.com/in/example-kevin-hsu",
            current_title="Principal Researcher",
            company="ITRI",
            location="Hsinchu, Taiwan",
            relationship_level=RelationshipLevel.WARM,
            status=ContactStatus.FOLLOW_UP_DUE,
            source=ContactSource.PUBLIC_COMPANY_SITE,
            notes="Published on semiconductor R&D. Follow up on collaboration.",
        ),
        Contact(
            name="Michael Park",
            linkedin_url="https://www.linkedin.com/in/example-michael-park",
            current_title="Senior Process Engineer",
            company="Micron",
            location="Taichung, Taiwan",
            relationship_level=RelationshipLevel.COLD,
            status=ContactStatus.NEW,
            source=ContactSource.USER_CONFIRMED,
            notes="User confirmed profile details from public job posting.",
        ),
    ]
    db.add_all(contacts)
    db.flush()

    today = date.today()
    interactions = [
        Interaction(
            contact_id=contacts[0].id,
            date=today - timedelta(days=14),
            channel="LinkedIn",
            message="Sent intro message about risk advisory opportunities.",
            result="No reply yet",
            next_follow_up_date=today + timedelta(days=3),
        ),
        Interaction(
            contact_id=contacts[2].id,
            date=today - timedelta(days=7),
            channel="Email",
            message="Thanked for referral and proposed 20-min call.",
            result="Replied positively",
            next_follow_up_date=None,
        ),
        Interaction(
            contact_id=contacts[3].id,
            date=today - timedelta(days=21),
            channel="LinkedIn",
            message="Asked about ITRI semiconductor research programs.",
            result="Read but no reply",
            next_follow_up_date=today - timedelta(days=2),
        ),
    ]
    db.add_all(interactions)

    jobs = [
        Job(
            title="Senior Risk Consultant",
            company="Deloitte",
            url="https://example.com/jobs/deloitte-risk",
            location="Hong Kong",
            description=(
                "Seeking experienced consultant with Python, SQL, risk management, "
                "compliance, SOX, and stakeholder management skills. "
                "Agile project delivery experience preferred."
            ),
            status=JobStatus.SAVED,
            fit_score=72.0,
            missing_skills="sox",
            next_action="Tailor resume and reach out to Sarah Chen",
        ),
        Job(
            title="Cloud Solutions Architect",
            company="PwC",
            url="https://example.com/jobs/pwc-cloud",
            location="Singapore",
            description=(
                "AWS, Azure, Kubernetes, Docker, Terraform, and API design. "
                "Strong communication and consulting background required."
            ),
            status=JobStatus.APPLIED,
            fit_score=65.0,
            missing_skills="terraform",
            next_action="Follow up with James Wong",
        ),
        Job(
            title="Process Engineer",
            company="Micron",
            url="https://example.com/jobs/micron-pe",
            location="Taichung",
            description=(
                "Semiconductor manufacturing, C++, Python, data analysis, "
                "and statistical process control. R&D experience a plus."
            ),
            status=JobStatus.SAVED,
            fit_score=58.0,
            missing_skills="c++, semiconductor",
            next_action="Research team and draft outreach",
        ),
    ]
    db.add_all(jobs)
    db.commit()
