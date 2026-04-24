/**
 * Cleans text extracted from LinkedIn notification emails.
 *
 * @param {string} value - Raw text from the email body or subject.
 * @returns {string} Cleaned text with normalized whitespace.
 */
function cleanText(value) {
  if (!value) return "";

  return String(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Detects the LinkedIn event type from email subject and body.
 *
 * @param {string} subject - Email subject line.
 * @param {string} body - Plain text or cleaned HTML email body.
 * @returns {string} Event type: new_connection, new_message, or unknown.
 */
function detectEventType(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();

  if (
    text.includes("wants to connect") ||
    text.includes("invitation") ||
    text.includes("accepted your invitation") ||
    text.includes("is now a connection")
  ) {
    return "new_connection";
  }

  if (
    text.includes("sent you a message") ||
    text.includes("new message") ||
    text.includes("messaged you") ||
    text.includes("replied to your message")
  ) {
    return "new_message";
  }

  return "unknown";
}

/**
 * Extracts a likely person name from LinkedIn notification text.
 *
 * @param {string} subject - Email subject line.
 * @param {string} body - Plain text or cleaned HTML email body.
 * @returns {string} Extracted person name, or Unknown if unavailable.
 */
function extractPersonName(subject, body) {
  const candidates = [
    subject.match(/^(.+?) sent you a message/i),
    subject.match(/^(.+?) wants to connect/i),
    subject.match(/^(.+?) accepted your invitation/i),
    subject.match(/^(.+?) is now a connection/i),
    body.match(/^(?:Hi\s+\w+,\s*)?([A-Z][A-Za-z.'-]+(?:\s[A-Z][A-Za-z.'-]+){0,3})\s*$/m),
  ];

  for (const match of candidates) {
    if (match && match[1]) {
      return cleanText(match[1]);
    }
  }

  return "Unknown";
}

/**
 * Extracts role and company from common LinkedIn notification formats.
 *
 * @param {string} body - Plain text or cleaned HTML email body.
 * @returns {{role: string, company: string}} Extracted role and company.
 */
function extractRoleAndCompany(body) {
  const lines = cleanText(body)
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean);

  let role = "Unknown";
  let company = "Unknown";

  for (const line of lines) {
    const atMatch = line.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
    if (atMatch) {
      role = cleanText(atMatch[1]);
      company = cleanText(atMatch[2]);
      break;
    }

    const dashMatch = line.match(/^(.+?)\s+[-|]\s+(.+)$/i);
    if (dashMatch && !/linkedin|view profile|message/i.test(line)) {
      role = cleanText(dashMatch[1]);
      company = cleanText(dashMatch[2]);
      break;
    }
  }

  return { role, company };
}

/**
 * Extracts the sender's message content from a LinkedIn notification.
 *
 * @param {string} body - Plain text or cleaned HTML email body.
 * @returns {string} Extracted message content or an empty string.
 */
function extractMessageContent(body) {
  const cleaned = cleanText(body);

  const curlyQuotedMessage = cleaned.match(/“([^”]+)”/);
  if (curlyQuotedMessage && curlyQuotedMessage[1]) {
    return cleanText(curlyQuotedMessage[1]);
  }

  const straightQuotedMessage = cleaned.match(/"([^"]{8,})"/);
  if (straightQuotedMessage && straightQuotedMessage[1]) {
    return cleanText(straightQuotedMessage[1]);
  }

  const messageAfterLabel = cleaned.match(/message:\s*([\s\S]+?)(?:\n\n|View message|Reply|See message)/i);
  if (messageAfterLabel && messageAfterLabel[1]) {
    return cleanText(messageAfterLabel[1]);
  }

  return "";
}

/**
 * Converts a raw Gmail item into a normalized LinkedIn lead event.
 *
 * @param {object} item - n8n input item containing Gmail payload fields.
 * @returns {object} Normalized n8n item containing a LinkedIn lead event.
 */
function parseLinkedInEmail(item) {
  const json = item.json || {};
  const subject = cleanText(json.subject || "");
  const body = cleanText(json.textPlain || json.text || json.textHtml || json.html || "");
  const eventType = detectEventType(subject, body);
  const personName = extractPersonName(subject, body);
  const profile = extractRoleAndCompany(body);
  const messageContent = extractMessageContent(body);

  return {
    json: {
      eventType,
      personName,
      role: profile.role,
      company: profile.company,
      messageContent,
      rawSubject: subject,
      rawBodyPreview: body.slice(0, 1000),
      sourceEmailId: json.id || json.messageId || "",
      receivedAt: json.date || new Date().toISOString(),
      parseStatus: personName === "Unknown" ? "needs_manual_review" : "parsed",
    },
  };
}

return items.map(parseLinkedInEmail);
