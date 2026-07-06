# Judging Map

## Technical Depth & Engineering - 30%

Hive Corps demonstrates:

- Multi-agent orchestration.
- Structured agent outputs.
- Persistent customer memory.
- Tool layer for catalog, pricing, and policy checks.
- Human approval gate.
- Risk scoring.
- Exported audit logs.
- Deterministic fallback mode.
- Alibaba Cloud deployment-ready backend.

Visible evidence:

- `/api/run-demo`
- `server/lib/agentEngine.js`
- `proof/generated/sample-agent-run.json`
- `server/alibaba-cloud-service.example.json`

## Innovation & AI Creativity - 30%

The standout idea is controlled self-improvement:

```text
Human edit -> Learning Agent -> Memory/policy proposal -> Better second workflow
```

This is more than a chatbot or one-shot quote generator. The system learns from approved workflow outcomes while preserving human control.

Visible evidence:

- Learning panel in dashboard.
- `learning.proposals` in proof JSON.
- Before/after demo buttons.

## Problem Value & Impact - 25%

B2B quote operations are high-value, repetitive, and risky to automate without controls.

Hive Corps reduces:

- Manual quote drafting.
- Repeated catalog checks.
- Forgotten customer preferences.
- Unsafe discounts.
- Untraceable decisions.

Visible evidence:

- Concrete AdeptWorks Lagos quote scenario.
- Product dashboard.
- Generated quote output.
- Approval and audit flow.

## Presentation & Documentation - 15%

Submission materials include:

- Dashboard UI.
- Architecture diagram.
- README.
- Demo script.
- Proof artifacts.
- Fallback plan.
- Verification commands.
- X/Twitter submission post.

