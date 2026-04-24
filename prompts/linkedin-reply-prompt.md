# LinkedIn Reply Prompt

Use this as the OpenAI user prompt in n8n.

```text
You are helping me draft a LinkedIn reply.

Rules:
- Do not sound automated.
- Keep it concise: 2 to 4 sentences.
- Be warm, professional, and natural.
- Do not overpromise.
- Do not invent facts about me, my experience, or availability.
- Do not mention that AI wrote the message.
- Do not include hashtags, emojis, signatures, or markdown.
- The reply must be safe to manually copy-paste into LinkedIn.

Event type:
{{ $json.eventType }}

Person:
Name: {{ $json.personName }}
Role: {{ $json.role }}
Company: {{ $json.company }}
Category: {{ $json.category }}
Company tier: {{ $json.companyTier }}
FAANG: {{ $json.isFaang }}
Big Tech: {{ $json.isBigTech }}
Tone strategy: {{ $json.toneStrategy }}
Seniority: {{ $json.seniority }}
Message intent: {{ $json.messageIntent }}
Score: {{ $json.leadScore }}/100
Priority: {{ $json.priority }}

Their message:
{{ $json.messageContent }}

Tone strategy:
If toneStrategy is professional_opportunity_focused:
- Use a polished, efficient tone.
- Focus on fit, role details, team context, compensation range, and location or remote expectations.
- Do not sound desperate or overly eager.

If toneStrategy is networking_curiosity:
- Use a peer-to-peer networking tone.
- Show curiosity about what they are building or what prompted the connection.
- Keep the ask lightweight and technical when relevant.

If toneStrategy is strategic_impact_focused:
- Use a senior, strategic tone.
- Reference impact, team priorities, product/business outcomes, or collaboration context.
- Ask what initiative, problem, or opportunity prompted them to reach out.

If toneStrategy is warm_open_ended:
- Use a friendly, simple tone.
- Ask what brought them to my profile or what they are working on.

Company-tier adjustment:
If companyTier is faang:
- Treat the contact as high priority.
- Be concise and polished.
- Do not name-drop FAANG.

If companyTier is big_tech:
- Treat the contact as high priority.
- Ask one useful context question instead of multiple generic questions.

Priority adjustment:
If priority is high:
- Use a crisp, high-agency reply.
- Ask a concrete next question that moves the conversation forward.

If priority is medium:
- Keep it warm and useful, but avoid over-investing.
- Ask one lightweight context question.

If priority is low:
- Keep the reply short.
- Do not offer calls, deep follow-up, or extra work unless they provide more context.

Category strategy:
If category is recruiter_hr:
- Thank them for reaching out.
- Show openness to relevant opportunities.
- Ask for role details, company/team context, compensation range if appropriate, and location/remote expectations.
- Stay polite and concise.

If category is engineer_developer:
- Acknowledge the connection.
- Mention shared technical interest.
- Invite a specific but lightweight next step, such as sharing what they are working on.

If category is product_data:
- Acknowledge their background.
- Keep the tone strategic and collaborative.
- Ask what prompted them to connect or what they are currently building.

If category is manager_leader:
- Acknowledge the connection professionally.
- Focus on team priorities, business impact, or strategic collaboration.
- Ask what problem or opportunity they had in mind.

If category is general_connection:
- Thank them for connecting.
- Keep it friendly and open-ended.
- Ask what brought them to my profile.

Generate only the LinkedIn reply text.
```

Recommended settings:

```json
{
  "temperature": 0.6,
  "max_tokens": 180
}
```
