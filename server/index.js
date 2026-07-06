import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runHiveWorkflow } from "./lib/agentEngine.js";
import { getQwenConfig } from "./lib/qwenClient.js";
import { validateRun } from "./lib/schemas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8787);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

async function sendJson(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

async function serveFile(res, filePath) {
  try {
    const ext = path.extname(filePath);
    const body = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/health") {
    const qwen = getQwenConfig();
    return sendJson(res, {
      ok: true,
      product: "Hive Corps",
      mode: qwen.enabled ? "qwen-live" : "deterministic-demo",
      qwen: {
        enabled: qwen.enabled,
        model: qwen.model,
        baseUrl: qwen.baseUrl,
        apiKeyConfigured: Boolean(process.env.QWEN_API_KEY)
      },
      timestamp: new Date().toISOString()
    });
  }

  if (url.pathname === "/api/requests") {
    const body = await fs.readFile(path.join(root, "server/data/requests.json"), "utf8");
    return sendJson(res, JSON.parse(body));
  }

  if (url.pathname === "/api/run-demo") {
    const requestId = url.searchParams.get("requestId") || "req_001";
    const applyLearning = url.searchParams.get("applyLearning") === "true";
    const persist = url.searchParams.get("persist") !== "false" && process.env.PERSIST_RUNS !== "false";
    const run = await runHiveWorkflow({ requestId, applyLearning, persist });
    return sendJson(res, { ...run, validation: validateRun(run) });
  }

  if (url.pathname === "/api/proof/latest") {
    return serveFile(res, path.join(root, "proof/generated/sample-agent-run.json"));
  }

  if (url.pathname === "/api/architecture") {
    return sendJson(res, {
      frontend: "Static dashboard served by Node",
      backend: "Node API deployable to Alibaba Cloud ECS or Function Compute",
      model: "Qwen Cloud via QWEN_API_KEY in live mode; deterministic fallback in demo mode",
      stores: ["customer memory", "product catalog", "pricing policy", "audit log"],
      proof: ["generated quote", "agent trace", "deployment config", "demo screenshots"]
    });
  }

  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const candidates = [
    path.join(root, "web", requested),
    path.join(root, requested)
  ];

  for (const candidate of candidates) {
    if (candidate.startsWith(root)) {
      try {
        const stat = await fs.stat(candidate);
        if (stat.isFile()) return serveFile(res, candidate);
      } catch {
        // Try next candidate.
      }
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(port, () => {
  console.log(`Hive Corps running at http://localhost:${port}`);
});
