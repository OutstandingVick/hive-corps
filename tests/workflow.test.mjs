import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { runHiveWorkflow } from "../server/lib/agentEngine.js";

const firstRun = await runHiveWorkflow({ requestId: "req_001", applyLearning: false, persist: false });
const secondRun = await runHiveWorkflow({ requestId: "req_002", applyLearning: true, persist: false });
const customRun = await runHiveWorkflow({
  requestOverride: {
    id: "req_test_custom",
    company: "TestOps Ltd",
    subject: "Need laptops for Accra team",
    body: "We need 18 reliable laptops for our Accra operations team next week. Please include onsite support and the best discount you can safely approve."
  },
  persist: false
});

assert.equal(firstRun.risk.approvalRequired, true, "First run should require approval.");
assert.ok(firstRun.risk.flags.some((flag) => flag.includes("Discount exceeds")), "First run should catch unsafe discount.");
assert.equal(firstRun.approval.status, "human_edit_required");
assert.equal(firstRun.learning.status, "proposed");
assert.ok(firstRun.learning.proposals.length >= 2, "First run should propose learning updates.");

assert.equal(secondRun.approval.humanEdit, null, "Second run should need fewer manual edits.");
assert.equal(secondRun.learning.status, "applied");
assert.ok(secondRun.learning.proposals.some((proposal) => proposal.includes("8%")), "Second run should apply learned discount cap.");

assert.equal(customRun.request.id, "req_test_custom");
assert.equal(customRun.quote.lineItems[0].quantity, 18, "Custom run should extract the requested quantity.");
assert.ok(customRun.agents.length >= 7, "Custom run should still use the full agent corps.");
assert.ok(customRun.proof.artifacts.includes("proof/generated/audit-log.json"), "Custom run should expose proof artifacts.");

const proof = JSON.parse(await fs.readFile("proof/generated/sample-agent-run.json", "utf8"));
assert.ok(proof.runId, "Proof artifact should include a run id.");

console.log("workflow.test.mjs passed");
