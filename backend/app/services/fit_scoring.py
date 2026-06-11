import re

COMMON_SKILLS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "sql",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "react",
    "next.js",
    "nextjs",
    "node",
    "nodejs",
    "fastapi",
    "django",
    "flask",
    "machine learning",
    "ml",
    "data analysis",
    "excel",
    "power bi",
    "tableau",
    "project management",
    "agile",
    "scrum",
    "risk management",
    "audit",
    "compliance",
    "sox",
    "ifrs",
    "gaap",
    "consulting",
    "stakeholder management",
    "communication",
    "leadership",
    "product management",
    "strategy",
    "financial modeling",
    "semiconductor",
    "manufacturing",
    "supply chain",
    "r&d",
    "research",
    "embedded systems",
    "c++",
    "go",
    "rust",
    "terraform",
    "ci/cd",
    "devops",
    "security",
    "cybersecurity",
    "networking",
    "cloud",
    "api",
    "rest",
    "graphql",
    "postgresql",
    "mongodb",
    "redis",
    "kafka",
    "spark",
    "hadoop",
    "etl",
    "nlp",
    "deep learning",
    "tensorflow",
    "pytorch",
    "pandas",
    "numpy",
    "statistics",
    "a/b testing",
    "ux",
    "ui",
    "figma",
    "salesforce",
    "sap",
    "erp",
    "crm",
    "blockchain",
    "iot",
    "ai",
    "generative ai",
    "llm",
}


def normalize_skill(skill: str) -> str:
    return re.sub(r"\s+", " ", skill.strip().lower())


def extract_keywords_from_description(description: str) -> set[str]:
    text = description.lower()
    found = set()
    for skill in COMMON_SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text):
            found.add(skill)
    return found


def calculate_fit_score(
    description: str,
    user_skills: list[str],
) -> tuple[float, list[str], list[str]]:
    """Return (fit_score 0-100, missing_skills, matched_skills)."""
    if not description.strip():
        return 0.0, [], []

    normalized_user = {normalize_skill(s) for s in user_skills if s.strip()}
    job_keywords = extract_keywords_from_description(description)

    if not job_keywords:
        return 50.0, [], list(normalized_user)

    matched = sorted(job_keywords & normalized_user)
    missing = sorted(job_keywords - normalized_user)

    fit_score = round((len(matched) / len(job_keywords)) * 100, 1)
    return fit_score, missing, matched
