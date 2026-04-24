/**
 * Detects whether a company is FAANG or broader Big Tech.
 *
 * @param {string} company - Person's extracted company.
 * @returns {{isFaang: boolean, isBigTech: boolean, companyTier: string}} Company tier signals.
 */
function detectCompanyTier(company) {
  const normalizedCompany = String(company || "").toLowerCase();
  const faangCompanies = [
    "meta",
    "facebook",
    "amazon",
    "apple",
    "netflix",
    "google",
    "alphabet",
  ];
  const bigTechCompanies = [
    ...faangCompanies,
    "microsoft",
    "openai",
    "nvidia",
    "tesla",
    "salesforce",
    "oracle",
    "adobe",
    "stripe",
    "airbnb",
    "uber",
    "lyft",
    "linkedin",
    "bytedance",
    "tiktok",
    "shopify",
    "databricks",
    "snowflake",
    "palantir",
    "atlassian",
    "block",
    "square",
    "coinbase",
  ];

  const isFaang = faangCompanies.some((name) => normalizedCompany.includes(name));
  const isBigTech = bigTechCompanies.some((name) => normalizedCompany.includes(name));

  return {
    isFaang,
    isBigTech,
    companyTier: isFaang ? "faang" : isBigTech ? "big_tech" : "standard",
  };
}

/**
 * Detects whether the person likely has management or leadership responsibility.
 *
 * @param {string} role - Person's extracted role or headline.
 * @param {string} messageContent - Extracted LinkedIn message content.
 * @returns {boolean} True when the contact likely manages people, strategy, or teams.
 */
function isManagerRole(role, messageContent) {
  const text = `${role || ""} ${messageContent || ""}`.toLowerCase();

  return /(manager|director|head of|vp|vice president|chief|cto|cio|cpo|lead|principal|staff|founder|co-founder|owner|partner)/.test(text);
}

/**
 * Categorizes a LinkedIn contact based on profile and message context.
 *
 * @param {string} role - Person's extracted role or headline.
 * @param {string} company - Person's extracted company.
 * @param {string} messageContent - Extracted LinkedIn message content.
 * @returns {string} Lead category used by the reply prompt.
 */
function categorizePerson(role, company, messageContent) {
  const text = `${role || ""} ${company || ""} ${messageContent || ""}`.toLowerCase();

  if (/(recruiter|talent|hiring|hr|people|sourcer|staffing|headhunter)/.test(text)) {
    return "recruiter_hr";
  }

  if (isManagerRole(role, messageContent)) {
    return "manager_leader";
  }

  if (/(engineer|developer|software|frontend|front-end|backend|back-end|full stack|devops|sre|architect|platform|infra)/.test(text)) {
    return "engineer_developer";
  }

  if (/(product|pm|data|analytics|analyst|scientist|growth|strategy|ml|ai|business intelligence)/.test(text)) {
    return "product_data";
  }

  return "general_connection";
}

/**
 * Selects the reply tone that should be passed to the OpenAI prompt.
 *
 * @param {string} category - Classified lead category.
 * @returns {string} Reply tone strategy.
 */
function selectToneStrategy(category) {
  if (category === "recruiter_hr") {
    return "professional_opportunity_focused";
  }

  if (category === "engineer_developer") {
    return "networking_curiosity";
  }

  if (category === "manager_leader") {
    return "strategic_impact_focused";
  }

  return "warm_open_ended";
}

/**
 * Detects seniority level from role and message context.
 *
 * @param {string} role - Person's extracted role or headline.
 * @param {string} messageContent - Extracted LinkedIn message content.
 * @returns {string} Seniority level used by lead scoring.
 */
function detectSeniority(role, messageContent) {
  const text = `${role || ""} ${messageContent || ""}`.toLowerCase();

  if (/(chief|cto|cio|cpo|ceo|coo|cfo|founder|co-founder|vp|vice president|partner)/.test(text)) {
    return "executive";
  }

  if (/(director|head of|senior manager|group manager|principal|staff)/.test(text)) {
    return "senior_leader";
  }

  if (/(manager|lead|senior|sr\.|architect)/.test(text)) {
    return "senior";
  }

  if (/(intern|junior|jr\.|associate|entry)/.test(text)) {
    return "junior";
  }

  return "mid";
}

/**
 * Classifies the likely intent of the LinkedIn message.
 *
 * @param {string} messageContent - Extracted LinkedIn message content.
 * @returns {string} Message intent used by lead scoring.
 */
function detectMessageIntent(messageContent) {
  const message = String(messageContent || "").toLowerCase();

  if (!message.trim()) {
    return "empty";
  }

  if (/(role|opportunity|opening|position|job|hiring|interview|contract|compensation|salary)/.test(message)) {
    return "opportunity";
  }

  if (/(refer|referral|recommend|intro|introduce|connect you|team)/.test(message)) {
    return "referral_network";
  }

  if (/(collaborate|partnership|project|build|consult|advisory|client|customer|demo)/.test(message)) {
    return "collaboration";
  }

  if (/(connect|network|profile|background|work|curious|chat)/.test(message)) {
    return "networking";
  }

  if (/(buy|sales|lead generation|outsourcing|agency|service)/.test(message)) {
    return "sales_pitch";
  }

  return "general";
}

/**
 * Scores a LinkedIn lead using transparent weighted business rules.
 *
 * @param {string} category - Classified lead category.
 * @param {{isFaang: boolean, isBigTech: boolean, companyTier: string}} companyTier - Company tier signals.
 * @param {string} seniority - Detected seniority level.
 * @param {string} messageIntent - Detected message intent.
 * @param {string} messageContent - Extracted LinkedIn message content.
 * @returns {number} Lead score from 0 to 100.
 */
function scoreLead(category, companyTier, seniority, messageIntent, messageContent) {
  let score = 10;
  const message = String(messageContent || "").trim();

  if (companyTier.isFaang) score += 30;
  else if (companyTier.isBigTech) score += 22;
  else score += 8;

  if (category === "recruiter_hr") score += 25;
  else if (category === "manager_leader") score += 22;
  else if (category === "engineer_developer") score += 14;
  else if (category === "product_data") score += 12;
  else score += 6;

  if (seniority === "executive") score += 18;
  else if (seniority === "senior_leader") score += 15;
  else if (seniority === "senior") score += 10;
  else if (seniority === "mid") score += 6;
  else if (seniority === "junior") score += 2;

  if (messageIntent === "opportunity") score += 20;
  else if (messageIntent === "referral_network") score += 16;
  else if (messageIntent === "collaboration") score += 14;
  else if (messageIntent === "networking") score += 8;
  else if (messageIntent === "general") score += 4;
  else if (messageIntent === "empty") score -= 8;
  else if (messageIntent === "sales_pitch") score -= 15;

  if (message.length > 120) score += 5;
  else if (message.length > 40) score += 3;

  return Math.max(0, Math.min(score, 100));
}

/**
 * Converts a numeric lead score into an operational priority bucket.
 *
 * @param {number} score - Lead score from 0 to 100.
 * @returns {string} Priority bucket: high, medium, or low.
 */
function assignPriority(score) {
  if (score >= 75) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  return "low";
}

return items.map((item) => {
  const category = categorizePerson(item.json.role, item.json.company, item.json.messageContent);
  const companyTier = detectCompanyTier(item.json.company);
  const seniority = detectSeniority(item.json.role, item.json.messageContent);
  const messageIntent = detectMessageIntent(item.json.messageContent);
  const leadScore = scoreLead(
    category,
    companyTier,
    seniority,
    messageIntent,
    item.json.messageContent
  );

  return {
    json: {
      ...item.json,
      category,
      toneStrategy: selectToneStrategy(category),
      seniority,
      messageIntent,
      isFaang: companyTier.isFaang,
      isBigTech: companyTier.isBigTech,
      companyTier: companyTier.companyTier,
      leadScore,
      priority: assignPriority(leadScore),
    },
  };
});
