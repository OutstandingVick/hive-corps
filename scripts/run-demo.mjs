import { runHiveWorkflow } from "../server/lib/agentEngine.js";

const firstRun = await runHiveWorkflow({ requestId: "req_001", applyLearning: false });
const secondRun = await runHiveWorkflow({ requestId: "req_002", applyLearning: true });

console.log("Hive Corps demo proof exported.");
console.log(`First run: ${firstRun.runId}`);
console.log(`Second run: ${secondRun.runId}`);
console.log("Artifacts:");
console.log("- proof/generated/sample-agent-run.json");
console.log("- proof/generated/generated-quote.json");
console.log("- proof/generated/generated-quote.md");
console.log("- proof/generated/audit-log.json");
