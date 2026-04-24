# CRM Schema

## Engineering

Use Airtable, Notion, or Google Sheets as the first CRM layer. A single table is enough for the MVP.

| Field | Type | Description |
| --- | --- | --- |
| sourceEmailId | Text, unique | Gmail message ID for dedupe |
| receivedAt | Date | Email receipt timestamp |
| eventType | Select | `new_connection`, `new_message` |
| personName | Text | Extracted LinkedIn contact name |
| role | Text | Extracted role or headline |
| company | Text | Extracted company |
| category | Select | `recruiter_hr`, `engineer_developer`, `product_data`, `general_connection` |
| toneStrategy | Select | `professional_opportunity_focused`, `networking_curiosity`, `strategic_impact_focused`, `warm_open_ended` |
| companyTier | Select | `faang`, `big_tech`, `standard` |
| isFaang | Checkbox | True for FAANG companies |
| isBigTech | Checkbox | True for FAANG and broader Big Tech companies |
| seniority | Select | `executive`, `senior_leader`, `senior`, `mid`, `junior` |
| messageIntent | Select | `opportunity`, `referral_network`, `collaboration`, `networking`, `general`, `empty`, `sales_pitch` |
| leadScore | Number | 0 to 100 priority score |
| priority | Select | `high`, `medium`, `low` |
| messageContent | Long text | Original LinkedIn message |
| openaiReply | Long text | Generated draft reply |
| parseStatus | Select | `parsed`, `needs_manual_review` |
| workflowStatus | Select | `new`, `draft_sent`, `manually_replied`, `follow_up_due`, `archived` |
| promptVersion | Text | Prompt version used for traceability |
| notes | Long text | Manual notes |

## Risk & Control

Make `sourceEmailId` unique. This prevents duplicate OpenAI calls and duplicate Telegram alerts.

Recommended statuses:

```text
new
draft_sent
manually_replied
follow_up_due
archived
```

## Product & Scale

Useful saved views:

- High-score recruiters
- Needs manual review
- Follow-up due
- Engineers and developers
- Product and data contacts

## Capital & Ownership

Track outcomes later:

- reply sent
- call booked
- referral offered
- interview started
- revenue or job opportunity created

This turns a time-saving workflow into a measurable relationship pipeline.
