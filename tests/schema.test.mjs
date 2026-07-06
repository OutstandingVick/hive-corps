import assert from "node:assert/strict";
import { runHiveWorkflow } from "../server/lib/agentEngine.js";
import { validateRun } from "../server/lib/schemas.js";

const run = await runHiveWorkflow({ requestId: "req_001", applyLearning: false, persist: false });
const validation = validateRun(run);

assert.equal(validation.ok, true, `Run schema invalid: ${JSON.stringify(validation)}`);
assert.equal(run.request.id, "req_001");
assert.ok(Array.isArray(run.agents));
assert.ok(run.agents.length >= 7);
assert.ok(run.quote.total > 0);
assert.ok(run.proof.artifacts.length >= 3);

console.log("schema.test.mjs passed");
