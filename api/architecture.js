import { handleOptions, sendJson } from "./_utils.js";

export default function handler(req, res) {
  if (handleOptions(req, res)) return;

  sendJson(res, {
    frontend: "Static dashboard served by Vercel or Node",
    backend: "Node workflow API deployable to Vercel, Alibaba Cloud Function Compute, or ECS",
    model: "Qwen Cloud via QWEN_API_KEY in live mode; deterministic fallback in demo mode",
    stores: ["customer memory", "product catalog", "pricing policy", "audit log"],
    proof: ["generated quote", "agent trace", "deployment config", "demo screenshots"]
  });
}
