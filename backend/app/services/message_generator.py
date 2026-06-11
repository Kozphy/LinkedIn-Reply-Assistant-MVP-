SPAM_PHRASES = [
    "guaranteed",
    "act now",
    "limited time",
    "click here",
    "amazing opportunity",
    "once in a lifetime",
    "don't miss out",
    "urgent",
    "free money",
    "make money fast",
]


def _sanitize(text: str) -> str:
    result = text
    for phrase in SPAM_PHRASES:
        result = result.replace(phrase, "")
        result = result.replace(phrase.title(), "")
    return " ".join(result.split())


def generate_outreach_message(
    contact_name: str,
    contact_title: str | None,
    contact_company: str | None,
    user_background: str,
    goal: str,
    tone: str,
    has_personal_connection: bool = False,
) -> str:
    first_name = contact_name.split()[0] if contact_name else "there"
    title_ref = contact_title or "your work"
    company_ref = contact_company or "your organization"

    tone_openers = {
        "professional": f"Hi {first_name},",
        "warm": f"Hello {first_name},",
        "curious": f"Hi {first_name},",
        "direct": f"Hi {first_name},",
    }
    opener = tone_openers.get(tone, tone_openers["professional"])

    if has_personal_connection:
        connection_line = (
            "I enjoyed our recent conversation and wanted to follow up thoughtfully."
        )
    else:
        connection_line = (
            f"I came across your profile and was interested in {title_ref} "
            f"at {company_ref}. I do not have a prior connection with you, "
            "so I wanted to reach out respectfully."
        )

    background_line = (
        f"A bit about me: {user_background.strip().rstrip('.')}."
        if user_background.strip()
        else ""
    )

    goal_line = f"My goal is to {goal.strip().rstrip('.')}."

    tone_closings = {
        "professional": (
            "If you are open to it, I would appreciate a brief exchange at your convenience."
        ),
        "warm": (
            "No pressure at all — I would value any perspective you are willing to share."
        ),
        "curious": (
            "I would love to learn more about your experience if you have a few minutes."
        ),
        "direct": (
            "Would you be open to a short conversation this or next week?"
        ),
    }
    closing = tone_closings.get(tone, tone_closings["professional"])

    parts = [opener, connection_line]
    if background_line:
        parts.append(background_line)
    parts.extend([goal_line, closing, "Thank you for your time.", "Best regards"])

    message = "\n\n".join(parts)
    return _sanitize(message)
