/**
 * Resolves the generated OpenAI reply from common n8n OpenAI node shapes.
 *
 * @param {object} data - n8n item JSON after the OpenAI node.
 * @returns {string} Generated reply text, or an empty string when unavailable.
 */
function resolveOpenAIReply(data) {
  return (
    data.reply ||
    data.text ||
    data.output ||
    data.message ||
    data.choices?.[0]?.message?.content ||
    data.data?.[0]?.content?.[0]?.text ||
    ""
  ).trim();
}

/**
 * Formats the Telegram notification for manual LinkedIn reply handling.
 *
 * @param {object} data - Normalized lead and generated reply data.
 * @returns {string} Telegram-ready plain text message.
 */
function formatTelegramMessage(data) {
  const reply = resolveOpenAIReply(data);
  const reviewMarker = data.parseStatus === "needs_manual_review" ? "Needs manual review" : "Parsed";

  return [
    "LinkedIn Reply Draft",
    "",
    `Status: ${reviewMarker}`,
    `Event: ${data.eventType}`,
    `Category: ${data.category}`,
    `Tone: ${data.toneStrategy || "n/a"}`,
    `Company Tier: ${data.companyTier || "standard"}`,
    `FAANG: ${data.isFaang ? "yes" : "no"}`,
    `Big Tech: ${data.isBigTech ? "yes" : "no"}`,
    `Seniority: ${data.seniority || "n/a"}`,
    `Intent: ${data.messageIntent || "n/a"}`,
    `Score: ${Number.isFinite(data.leadScore) ? data.leadScore : "n/a"}/100`,
    `Priority: ${data.priority || "n/a"}`,
    `Name: ${data.personName}`,
    `Role: ${data.role}`,
    `Company: ${data.company}`,
    "",
    "Original Message:",
    data.messageContent || "(No message content detected)",
    "",
    "Suggested Reply:",
    reply || "(Reply generation failed. Review manually.)",
    "",
    "Action: Manually copy-paste into LinkedIn. Do not auto-send.",
  ].join("\n");
}

return items.map((item) => {
  return {
    json: {
      ...item.json,
      openaiReply: resolveOpenAIReply(item.json),
      telegramMessage: formatTelegramMessage(item.json),
    },
  };
});
