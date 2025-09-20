// const axios = require('axios');

const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- Conversation Memory ----
const conversationHistory = {}; // { userId: [ { role, content } ] }

function addMessageToHistory(userId, role, content) {
  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }
  conversationHistory[userId].push({ role, content });

  // Keep last 20 messages only
  if (conversationHistory[userId].length > 20) {
    conversationHistory[userId].shift();
  }
}

function getHistory(userId) {
  return conversationHistory[userId] || [];
}

// ---- Intent & Entity Schema ----
const schema = {
  CHECKIN: { required: ["date", "location"], optional: ["roomType"] },
  CHECKOUT: { required: ["date"], optional: [] },
  INVOICE: { required: ["month"], optional: [] },
  RECEIPT: { required: ["month"], optional: [] },
  PAYMENT_STATUS: { required: [], optional: ["month"] },
  AVAILABILITY: { required: ["location"], optional: ["roomType", "date"] },
  OTHER: { required: [], optional: [] }
};

// ---- Core Functions ----
async function classifyIntent(message) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Classify the user intent. Reply with only one: CHECKIN, CHECKOUT, INVOICE, RECEIPT, PAYMENT_STATUS, AVAILABILITY, OTHER" },
      { role: "user", content: message }
    ],
    temperature: 0
  });
  return response.choices[0].message.content.trim();
}

async function extractEntities(intent, userMessage) {
  const requiredFields = schema[intent]?.required || [];
  const optionalFields = schema[intent]?.optional || [];

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an entity extractor for intent: ${intent}.
Output valid JSON only with keys:
- required: ${requiredFields.join(", ")}
- optional: ${optionalFields.join(", ")}
If user says "last month"/"tomorrow", resolve to YYYY-MM or YYYY-MM-DD.
Missing values should be null.`
      },
      { role: "user", content: userMessage }
    ],
    temperature: 0
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {};
  }
}

function checkMissingParams(intent, params) {
  const requiredFields = schema[intent]?.required || [];
  return requiredFields.filter(field => !params[field]);
}

async function handlePGAssistant(userId, userMessage, context) {
  const history = getHistory(userId);
  console.log("Conversation History:", history);
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a PG assistant bot. Help tenants with checkin, checkout, payments, invoices and enquiries. Use prior history for context." },
      ...history,
      { role: "user", content: userMessage },
      { role: "assistant", content: `Context: ${JSON.stringify(context)}` }
    ],
    temperature: 0.7
  });

  const reply = response.choices[0].message.content;

  // Save messages in history
  addMessageToHistory(userId, "user", userMessage);
  addMessageToHistory(userId, "assistant", reply);

  return reply;
}

// ---- Main Orchestrator ----
async function processTenantMessage(userId, userMessage) {
  const intent = await classifyIntent(userMessage);
  const params = await extractEntities(intent, userMessage);

  const missing = checkMissingParams(intent, params);
  if (missing.length > 0) {
    const ask = `I need the following details before I proceed: ${missing.join(", ")}`;
    addMessageToHistory(userId, "assistant", ask);
    return ask;
  }

  // Mock API call
  let context = {};
  switch (intent) {
    case "RECEIPT":
      context = { receiptId: "RCT-2023", amount: "₹8,000", month: params.month };
      break;
    case "INVOICE":
      context = { invoiceId: "INV-1023", amount: "₹8,000", month: params.month };
      break;
    case "AVAILABILITY":
      context = { location: params.location, bedsAvailable: 3, price: "₹8,000/month" };
      break;
    case "CHECKIN":
      context = { tenantId: params.tenantId, date: params.date, location: params.location };
      break;
    case "CHECKOUT":
      context = { tenantId: params.tenantId, date: params.date };
      break;
    case "PAYMENT_STATUS":
      context = { tenantId: params.tenantId, status: "Paid on 2025-09-10 via UPI" };
      break;
    default:
      context = { info: "Sorry, I couldn’t classify this request. A human will assist you." };
  }

  return await handlePGAssistant(userId, userMessage, context);
}

// ---- Example Run ----
processTenantMessage("917401534638", "Is there any 2 sharing bed available")
  .then(response => console.log("Bot:", response))
  .catch(err => console.error(err));

module.exports = {
  processTenantMessage
};
