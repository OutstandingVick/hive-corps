export const requiredRunFields = [
  "runId",
  "mode",
  "request",
  "agents",
  "quote",
  "risk",
  "approval",
  "learning",
  "proof"
];

export function validateRun(run) {
  const missing = requiredRunFields.filter((field) => !(field in run));
  const agentNames = new Set((run.agents || []).map((agent) => agent.name));
  const requiredAgents = [
    "Intake Agent",
    "Planner Agent",
    "Memory Agent",
    "Catalog Agent",
    "Risk Agent",
    "Quote Writer Agent",
    "Learning Agent"
  ];
  const missingAgents = requiredAgents.filter((name) => !agentNames.has(name));

  return {
    ok: missing.length === 0 && missingAgents.length === 0,
    missing,
    missingAgents
  };
}
