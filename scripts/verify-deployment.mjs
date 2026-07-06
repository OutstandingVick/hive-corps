const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error("Usage: node scripts/verify-deployment.mjs https://your-deployed-url");
  process.exit(1);
}

const normalized = baseUrl.replace(/\/$/, "");

async function getJson(path) {
  const response = await fetch(`${normalized}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

const health = await getJson("/api/health");
const run = await getJson("/api/run-demo?requestId=req_001");

if (!health.ok) {
  throw new Error("/api/health did not return ok=true");
}

if (!run.validation?.ok) {
  throw new Error("/api/run-demo did not return a valid workflow");
}

if (!run.proof?.alibabaCloud) {
  throw new Error("Workflow response is missing Alibaba Cloud proof metadata");
}

console.log("Hive Corps deployment verified.");
console.log(`URL: ${normalized}`);
console.log(`Mode: ${health.mode}`);
console.log(`Qwen enabled: ${health.qwen?.enabled}`);
console.log(`Run ID: ${run.runId}`);
console.log(`Approval status: ${run.approval.status}`);
