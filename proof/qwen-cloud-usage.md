# Qwen Cloud Usage Proof

Hive Corps has two execution modes.

## Deterministic Demo Mode

```bash
DEMO_MODE=true
```

This mode does not call external services. It exists so judges can verify the product workflow even without credentials or network access.

## Live Qwen Mode

```bash
DEMO_MODE=false
QWEN_API_KEY=your_qwen_cloud_key
QWEN_MODEL=qwen-max
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

When live mode is enabled, Hive Corps calls Qwen through the OpenAI-compatible chat completions endpoint:

```text
POST {QWEN_BASE_URL}/chat/completions
Authorization: Bearer {QWEN_API_KEY}
```

## Qwen-Powered Agents

The live layer calls Qwen for:

- Intake Agent: extracts customer, category, quantity, urgency, and missing fields.
- Planner Agent: creates the workflow plan and approval checkpoints.
- Risk Agent: reviews discounts, margin, missing fields, and delivery promises.
- Quote Writer Agent: drafts the customer-facing quote response.
- Learning Agent: proposes controlled memory and policy updates from human edits.

Catalog lookup, pricing math, approval state, and artifact export remain deterministic business logic. This prevents the model from silently changing prices or bypassing approvals.

## Proof Artifacts

When live mode runs, Qwen metadata is written into:

- `proof/generated/sample-agent-run.json`
- `proof/generated/audit-log.json`

Each Qwen-backed agent step includes:

- provider
- model
- raw content
- parsed structured output
- token usage when the provider returns it

## Fallback Behavior

If a Qwen call fails, Hive Corps keeps the workflow running with deterministic business logic and records the failed Qwen call in the `qwen.calls` section of the proof artifact.

This makes the product judge-verifiable without hiding provider failures.

