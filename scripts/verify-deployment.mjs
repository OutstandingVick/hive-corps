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

async function postJson(path, body) {
  const response = await fetch(`${normalized}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response.json();
}

const health = await getJson("/api/health");
const run = await getJson("/api/run-demo?requestId=req_001");
const customRun = await postJson("/api/workflows", {
  company: "Verifier Account",
  subject: "Verifier quote request",
  request: "We need 18 reliable laptops for our Accra operations team next week. Please include onsite support and the best safe discount."
});

if (!health.ok) {
  throw new Error("/api/health did not return ok=true");
}

if (!run.validation?.ok) {
  throw new Error("/api/run-demo did not return a valid workflow");
}

if (!run.proof?.alibabaCloud) {
  throw new Error("Workflow response is missing Alibaba Cloud proof metadata");
}

if (!customRun.validation?.ok) {
  throw new Error("/api/workflows did not return a valid custom workflow");
}

console.log("Hive Corps deployment verified.");
console.log(`URL: ${normalized}`);
console.log(`Mode: ${health.mode}`);
console.log(`Qwen enabled: ${health.qwen?.enabled}`);
console.log(`Run ID: ${run.runId}`);
console.log(`Custom run ID: ${customRun.runId}`);
console.log(`Approval status: ${run.approval.status}`);
