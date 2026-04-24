# LinkedIn Auto Reply MVP

Semi-automated LinkedIn reply assistant built around n8n, Gmail, OpenAI, and Telegram.

The system reads LinkedIn notification emails from Gmail, detects whether the email is a connection or message event, extracts contact details, drafts a personalized reply with OpenAI, and sends the draft to Telegram for manual copy-paste into LinkedIn.

It intentionally does not automate LinkedIn sending, scraping, browser sessions, or account actions.

## Engineering

### Architecture

```text
LinkedIn Email Notification
  -> Gmail Trigger
  -> LinkedIn Notification Filter
  -> Email Parser
  -> Supported Event Gate
  -> Contact Categorizer
  -> OpenAI Reply Generator
  -> Telegram Formatter
  -> Telegram Manual Copy-Paste Alert
```

### Repository Layout

```text
workflows/linkedin-reply-assistant.n8n.json  Importable n8n workflow template
src/n8n/parse-linkedin-email.js             Parser used by the n8n Code node
src/n8n/categorize-person.js                Lead category classifier
src/n8n/format-telegram-message.js          Telegram message formatter
prompts/linkedin-reply-prompt.md            OpenAI prompt template
docs/architecture.md                        Production architecture and controls
docs/crm-schema.md                          Airtable / Notion / CRM schema
examples/sample-telegram-output.txt         Example Telegram alert
```

### n8n Setup

1. Import [workflows/linkedin-reply-assistant.n8n.json](./workflows/linkedin-reply-assistant.n8n.json) into n8n.
2. Connect credentials:
   - Gmail OAuth2
   - OpenAI API
   - Telegram Bot API
3. Update the Gmail search query if LinkedIn email templates differ in your inbox.
4. Update the Telegram `chatId`.
5. Test with one real LinkedIn notification email before enabling the workflow.

### Node Breakdown

| Step | Node | Purpose |
| --- | --- | --- |
| 1 | Gmail Trigger | Receives LinkedIn email notifications |
| 2 | IF: Is LinkedIn Notification | Filters non-LinkedIn emails |
| 3 | Code: Parse LinkedIn Email | Extracts event type, name, role, company, message |
| 4 | IF: Supported Event Type | Stops unsupported LinkedIn newsletters and job alerts |
| 5 | Code: Categorize Person | Classifies recruiter, engineer, product/data, or general |
| 6 | OpenAI: Generate Reply | Produces short copy-paste-ready LinkedIn reply |
| 7 | Code: Format Telegram Message | Creates readable Telegram alert |
| 8 | Telegram: Send Message | Sends the draft to you for manual action |

## Risk & Control

### LinkedIn Safety Boundary

This workflow only uses Gmail notifications and Telegram. It does not:

- log into LinkedIn
- scrape LinkedIn pages
- auto-send LinkedIn messages
- use browser automation against LinkedIn
- call unofficial LinkedIn APIs

The human stays in the loop. You manually review, optionally edit, and paste the message into LinkedIn.

### Error Handling

Production routing should follow this pattern:

```text
Parser failure -> Send Telegram alert marked "Needs manual review"
Unsupported event -> Log and stop
OpenAI failure -> Retry once, then send extracted context without draft
Telegram failure -> Retry, then log failed delivery
Duplicate email -> Stop before OpenAI call
```

Recommended dedupe key:

```text
sourceEmailId
```

Recommended audit fields:

- source email ID
- event type
- person name
- role
- company
- category
- original message
- generated reply
- prompt version
- processing status
- timestamp

## Product & Scale

### MVP Workflow

Start with Gmail -> OpenAI -> Telegram. This gives fast value without creating a compliance or account-risk problem.

### Scaling Path

Add a lightweight CRM once reply quality is acceptable:

- Airtable for structured pipeline tracking
- Notion for personal relationship management
- Google Sheets for cheap MVP logging
- HubSpot, Pipedrive, Attio, or Folk if volume grows

Recommended statuses:

```text
new
draft_sent
manually_replied
follow_up_due
archived
```

### Optional Improvements

- Lead scoring based on role, company, seniority, and message quality
- Telegram action buttons for "Rewrite shorter", "Rewrite warmer", and "Ignore"
- Follow-up reminders after 3 to 7 days
- Prompt versioning and outcome tracking
- CRM enrichment for target companies and recruiter history

### Intelligent Classification

The categorizer now adds these fields before the OpenAI node:

| Field | Purpose |
| --- | --- |
| `companyTier` | `faang`, `big_tech`, or `standard` |
| `isFaang` | Flags Meta/Facebook, Amazon, Apple, Netflix, Google/Alphabet |
| `isBigTech` | Flags FAANG plus companies such as Microsoft, OpenAI, Nvidia, Stripe, Databricks, Salesforce, and similar tech leaders |
| `toneStrategy` | Selects reply tone: opportunity-focused, networking/curiosity, strategic/impact, or warm/open-ended |
| `seniority` | `executive`, `senior_leader`, `senior`, `mid`, or `junior` |
| `messageIntent` | `opportunity`, `referral_network`, `collaboration`, `networking`, `general`, `empty`, or `sales_pitch` |
| `leadScore` | 0-100 priority score |
| `priority` | `high`, `medium`, or `low` |

Tone mapping:

```text
recruiter_hr -> professional_opportunity_focused
engineer_developer -> networking_curiosity
manager_leader -> strategic_impact_focused
general_connection -> warm_open_ended
```

Lead scoring weights:

```text
Company: FAANG highest, Big Tech high, standard lower
Role: recruiter and manager/leader highest
Seniority: executive and senior leader highest
Intent: opportunity, referral, and collaboration highest
Priority: high >= 75, medium >= 45, low < 45
```

## Capital & Ownership

### ROI Logic

This project is worth building because it saves repetitive drafting time while improving response quality and preserving LinkedIn account safety.

Highest-value contacts:

- recruiters from target companies
- senior engineers who can create referrals
- product/data leaders at high-growth companies
- founders or operators with clear collaboration intent

Lowest-value contacts:

- generic connections with no message
- mass recruiter spam
- sales pitches
- messages with no identifiable professional context

## Top 3 Risks

1. LinkedIn email templates can change and break parsing.
2. Over-automation could create LinkedIn account risk if the scope expands into browser actions.
3. Poor lead scoring can waste attention on low-value messages.

## Top 3 Opportunities

1. Build a recruiter and referral CRM from inbound LinkedIn activity.
2. Shorten response time while keeping manual control.
3. Track which categories lead to interviews, referrals, calls, or revenue.

## Recommendation

Build the MVP with this repo and import the n8n workflow. Improve it after real notifications expose parsing edge cases.
