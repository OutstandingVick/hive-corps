import { handleOptions, runWorkflowForServerless, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const requestId = req.query.requestId || "req_001";
  const applyLearning = req.query.applyLearning === "true";
  const run = await runWorkflowForServerless({ requestId, applyLearning });
  sendJson(res, run);
}
