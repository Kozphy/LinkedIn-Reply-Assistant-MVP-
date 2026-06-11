def test_health_and_compliance(client):
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert "does not scrape LinkedIn" in health.json()["compliance_notice"]

    compliance = client.get("/api/compliance")
    assert compliance.status_code == 200
    assert "manually entered" in compliance.json()["notice"]


def test_contact_crud(client):
    create_resp = client.post(
        "/api/contacts",
        json={
            "name": "Test User",
            "company": "Deloitte",
            "source": "manual",
            "relationship_level": "cold",
            "status": "new",
        },
    )
    assert create_resp.status_code == 201
    contact = create_resp.json()
    contact_id = contact["id"]
    assert contact["name"] == "Test User"
    assert contact["source"] == "manual"

    list_resp = client.get("/api/contacts", params={"company": "Deloitte"})
    assert list_resp.status_code == 200
    assert any(c["id"] == contact_id for c in list_resp.json())

    update_resp = client.put(
        f"/api/contacts/{contact_id}",
        json={"status": "contacted"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "contacted"

    delete_resp = client.delete(f"/api/contacts/{contact_id}")
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/contacts/{contact_id}")
    assert get_resp.status_code == 404


def test_company_crud(client):
    resp = client.post(
        "/api/companies",
        json={"name": "Micron", "industry": "Semiconductors", "career_value": "high"},
    )
    assert resp.status_code == 201
    company_id = resp.json()["id"]

    get_resp = client.get(f"/api/companies/{company_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Micron"

    client.delete(f"/api/companies/{company_id}")
    assert client.get(f"/api/companies/{company_id}").status_code == 404


def test_job_crud_with_fit_scoring(client):
    resp = client.post(
        "/api/jobs",
        json={
            "title": "Risk Analyst",
            "company": "Deloitte",
            "description": "Python, SQL, risk management, compliance required.",
            "user_skills": ["python", "sql", "risk management"],
        },
    )
    assert resp.status_code == 201
    job = resp.json()
    assert job["fit_score"] is not None
    assert job["fit_score"] > 0
    job_id = job["id"]

    update_resp = client.put(
        f"/api/jobs/{job_id}",
        json={"status": "applied"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "applied"

    client.delete(f"/api/jobs/{job_id}")


def test_interaction_and_outreach(client):
    contact_resp = client.post(
        "/api/contacts",
        json={"name": "Jane Doe", "source": "referral"},
    )
    contact_id = contact_resp.json()["id"]

    interaction_resp = client.post(
        "/api/interactions",
        json={
            "contact_id": contact_id,
            "date": "2025-06-01",
            "channel": "LinkedIn",
            "message": "Intro sent",
        },
    )
    assert interaction_resp.status_code == 201

    outreach_resp = client.post(
        "/api/outreach/generate",
        json={
            "contact_id": contact_id,
            "goal": "learn about your team's work",
            "tone": "professional",
            "user_background": "I am a risk consultant with Python experience.",
            "has_personal_connection": False,
        },
    )
    assert outreach_resp.status_code == 201
    message = outreach_resp.json()["generated_message"]
    assert "do not have a prior connection" in message.lower()
    assert "guaranteed" not in message.lower()


def test_audit_log_created_on_create(client):
    client.post("/api/companies", json={"name": "ITRI"})
    audit_resp = client.get("/api/audit", params={"entity_type": "company"})
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) >= 1
    assert logs[0]["action"] == "create"
