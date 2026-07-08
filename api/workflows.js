import { handleOptions, runWorkflowForServerless, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendJson(res, { ok: false, error: "Use POST for custom workflows." }, 405);
  }

  const payload = typeof req.body === "object" && req.body ? req.body : {};
  const text = String(payload.request || payload.body || "").trim();

  if (text.length < 24) {
    return sendJson(res, {
      ok: false,
      error: "Add a messy customer quote request with enough detail to run the workflow."
    }, 400);
  }

  const run = await runWorkflowForServerless({
    requestOverride: {
      id: payload.id || `req_custom_${Date.now()}`,
      company: payload.company || "Custom B2B Account",
      subject: payload.subject || "Custom quote request",
      body: text,
      source: "vercel-post"
    },
    applyLearning: Boolean(payload.applyLearning)
  });

  sendJson(res, run, 201);
}
