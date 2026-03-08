const Anthropic = require("@anthropic-ai/sdk");

let client = null;

function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Call Claude API with automatic fallback.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {Function} fallbackFn - called when AI unavailable, receives same args
 * @returns {Promise<{data: any, source: 'ai'|'fallback'}>}
 */
async function callAI(systemPrompt, userPrompt, fallbackFn) {
  const ai = getClient();

  if (!ai) {
    console.warn("[AI] No API key configured — using rule-based fallback");
    const data = await fallbackFn();
    return { data, source: "fallback" };
  }

  try {
    const message = await ai.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: `${systemPrompt}\n\n${userPrompt}` }],
    });

    const raw = message.content[0].text.trim();

    // Strip markdown fences if present
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return { data: parsed, source: "ai" };
    } catch {
      // If JSON parse fails, return raw text wrapped
      return { data: { raw }, source: "ai" };
    }
  } catch (err) {
    console.error("[AI] API call failed, switching to fallback:", err.message);
    const data = await fallbackFn();
    return { data, source: "fallback" };
  }
}

module.exports = { callAI };
