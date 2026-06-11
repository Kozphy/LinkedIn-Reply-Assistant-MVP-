from app.services.fit_scoring import calculate_fit_score


def test_perfect_match():
    description = "We need Python, SQL, and AWS experience."
    skills = ["python", "sql", "aws"]
    score, missing, matched = calculate_fit_score(description, skills)
    assert score == 100.0
    assert missing == []
    assert set(matched) == {"python", "sql", "aws"}


def test_partial_match():
    description = "Python, SQL, Kubernetes, and Docker required."
    skills = ["python", "sql"]
    score, missing, matched = calculate_fit_score(description, skills)
    assert score == 50.0
    assert "kubernetes" in missing
    assert "docker" in missing
    assert "python" in matched


def test_empty_description():
    score, missing, matched = calculate_fit_score("", ["python"])
    assert score == 0.0
    assert missing == []
    assert matched == []


def test_no_keywords_in_description():
    score, missing, matched = calculate_fit_score(
        "Looking for a motivated team player.", ["python"]
    )
    assert score == 50.0
    assert missing == []


def test_fit_score_api(client):
    resp = client.post(
        "/api/jobs/fit-score",
        json={
            "description": "Risk management, compliance, Python, and SQL.",
            "user_skills": ["python", "risk management"],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert 0 <= data["fit_score"] <= 100
    assert "sql" in data["missing_skills"]
    assert "python" in data["matched_skills"]
