# Production Architecture

## Engineering

### n8n Workflow

1. Gmail Trigger
   - Query: `from:(messages-noreply@linkedin.com OR invitations@linkedin.com OR notifications-noreply@linkedin.com)`
   - Reads LinkedIn notification emails only.

2. IF: Is LinkedIn Notification
   - Checks sender and subject.
   - Stops unrelated email before parsing.

3. Code: Parse LinkedIn Email
   - Detects event type.
   - Extracts name, role, company, and message content.
   - Marks uncertain parsing as `needs_manual_review`.

4. IF: Supported Event Type
   - Allows only `new_connection` and `new_message`.
   - Stops newsletters, ads, jobs, and noisy notifications.

5. Code: Categorize Person
   - Classifies into `recruiter_hr`, `engineer_developer`, `product_data`, or `general_connection`.
   - Detects `manager_leader` contacts before technical peer classification.
   - Detects `faang`, `big_tech`, or `standard` company tier.
   - Detects seniority and message intent.
   - Adds a tone strategy, 0-100 lead score, and high/medium/low priority.

6. OpenAI: Generate Reply
   - Uses category-specific instructions.
   - Returns copy-paste-ready reply text.

7. Code: Format Telegram Message
   - Builds plain text Telegram alert.
   - Avoids Markdown parsing issues with user-provided content.

8. Telegram: Send Message
   - Sends to your chat or private group.
   - You manually paste into LinkedIn.

## Risk & Control

### Failure Modes

| Failure | Control |
| --- | --- |
| LinkedIn template changes | Defensive parser plus manual review status |
| Duplicate email processing | Store and check `sourceEmailId` before OpenAI |
| OpenAI outage | Retry once, then send Telegram context without draft |
| Telegram outage | Retry and log failed delivery |
| Hallucinated reply | Prompt forbids invented facts and keeps human approval |
| Account ban risk | No LinkedIn browser automation or auto-send |
| Over-prioritizing brand names | Company tier is only one score input; message quality and role still matter |

### Audit Trail

Store these fields in Airtable, Notion, Sheets, or a database:

- `sourceEmailId`
- `receivedAt`
- `eventType`
- `personName`
- `role`
- `company`
- `category`
- `toneStrategy`
- `companyTier`
- `isFaang`
- `isBigTech`
- `leadScore`
- `priority`
- `seniority`
- `messageIntent`
- `messageContent`
- `openaiReply`
- `parseStatus`
- `workflowStatus`
- `promptVersion`

## Product & Scale

### Extensibility

Keep each stage modular:

```text
input -> filter -> parse -> classify -> generate -> notify -> log
```

This makes it easy to replace a layer later:

- Gmail can become Outlook.
- Airtable can become HubSpot.
- Telegram can become Slack.
- OpenAI prompt can become a fine-tuned reply style.

### Follow-Up Automation

Keep follow-up reminders manual-safe:

```text
draft_sent + no manually_replied status after 3 days -> Telegram reminder
```

Do not auto-message LinkedIn.

## Capital & Ownership

### Build Economics

This is a good automation MVP because the cost is mostly API usage and the output can directly affect career or sales outcomes.

Avoid custom backend development until one of these is true:

- inbound message volume is high
- multiple users need the workflow
- CRM reporting becomes valuable
- reply quality needs systematic experimentation

### Decision

Build as an n8n workflow first. Improve parser accuracy and lead scoring from real email samples before investing in a standalone SaaS backend.
