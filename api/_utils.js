import fs from "node:fs/promises";
import path from "node:path";
import { runHiveWorkflow } from "../server/lib/agentEngine.js";
import { getQwenConfig } from "../server/lib/qwenClient.js";
import { validateRun } from "../server/lib/schemas.js";

const root = process.cwd();

export function setCors(res) {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Origin", "*");
}

export function handleOptions(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function sendJson(res, data, status = 200) {
  setCors(res);
  res.status(status).json(data);
}

export function getHealthPayload() {
  const qwen = getQwenConfig();
  return {
    ok: true,
    product: "Hive Corps",
    mode: qwen.enabled ? "qwen-live" : "deterministic-demo",
    cloud: {
      provider: process.env.VERCEL ? "Vercel" : "Alibaba Cloud",
      service: process.env.ALIBABA_CLOUD_SERVICE || (process.env.VERCEL ? "vercel-serverless" : "local"),
      region: process.env.ALIBABA_CLOUD_REGION || process.env.VERCEL_REGION || "unknown"
    },
    qwen: {
      enabled: qwen.enabled,
      model: qwen.model,
      baseUrl: qwen.baseUrl,
      apiKeyConfigured: Boolean(process.env.QWEN_API_KEY)
    },
    timestamp: new Date().toISOString()
  };
}

export async function readDataJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), "utf8"));
}

export async function runWorkflowForServerless(options) {
  const run = await runHiveWorkflow({
    ...options,
    persist: false
  });
  return { ...run, validation: validateRun(run) };
}
