# Hive Corps Submission Packet

## Project

Hive Corps

## Track

Track 4: Autopilot Agent

Secondary strengths:

- Track 1: MemoryAgent
- Track 3: Agent Society

## One-line Description

Hive Corps turns messy B2B quote requests into approved, auditable customer responses through a self-improving Qwen-powered agent workflow.

## Repository

https://github.com/OutstandingVick/hive-corps

## Public Demo URL

Use the Vercel deployment URL if available.

Important:

```text
Vercel is a public product demo host. Alibaba Cloud deployment proof is still pending compute credits or Function Compute activation.
```

## What It Does

Hive Corps coordinates specialized agents for:

- quote intake
- workflow planning
- persistent customer memory
- catalog and pricing selection
- risk review
- quote writing
- human approval
- learning from corrections

The product demonstrates a full business workflow from trigger to decision, generated quote, approval state, audit evidence, and controlled learning proposal.

## Demo Flow

1. Open the Hive Corps dashboard.
2. Click **Run quote workflow** to run the first seeded quote request.
3. Show the agent workflow timeline.
4. Show the generated quote, risk gate, and human edit requirement.
5. Show the Learning Agent policy proposals.
6. Click **See how it learns** to run the second improved quote.
7. Paste a custom quote request into the workflow runner and click **Run with backend agents**.
8. Open proof artifacts:
   - `proof/generated/sample-agent-run.json`
   - `proof/generated/generated-quote.json`
   - `proof/generated/audit-log.json`

Full script: `docs/demo-script.md`

## Qwen Cloud Usage

Hive Corps includes live Qwen Cloud integration through the OpenAI-compatible DashScope endpoint:

```text
POST {QWEN_BASE_URL}/chat/completions
```

Live mode:

```bash
DEMO_MODE=false
QWEN_API_KEY=your_qwen_cloud_key
```

Qwen-powered roles:

- Intake Agent
- Planner Agent
- Risk Agent
- Quote Writer Agent
- Learning Agent

Deterministic business logic still controls pricing, approval gates, and proof export so the model cannot silently bypass policy.

Detailed proof: `proof/qwen-cloud-usage.md`

## Alibaba Cloud Deployment Status

The repository is prepared for Alibaba Cloud deployment through:

- Alibaba Cloud Function Compute custom runtime
- ECS Docker deployment
- `/api/health` cloud metadata
- `/api/workflows` custom quote workflow endpoint
- deployment verifier script

Deployment files:

- `deploy/alibaba-cloud/function-compute/README.md`
- `deploy/alibaba-cloud/function-compute/bootstrap`
- `deploy/alibaba-cloud/function-compute/s.example.yaml`
- `deploy/alibaba-cloud/deploy-ecs.sh`
- `Dockerfile`
- `scripts/verify-deployment.mjs`

Current status:

```text
Deployment-ready. Final live Alibaba Cloud URL is pending available Alibaba Cloud compute credits or Function Compute activation.
```

Important:

Do not claim a live Alibaba deployment unless the Function Compute or ECS URL is available and verified.

## Local Run

```bash
cp .env.example .env
npm start
```

Open:

```text
http://localhost:8787
```

## Verification

```bash
npm test
```

If deployed:

```bash
npm run verify:deployment -- https://YOUR_ALIBABA_CLOUD_URL
```

## Architecture

```text
Customer Request
  -> Hive Corps API
  -> Qwen Agent Orchestrator
  -> Intake Agent
  -> Planner Agent
  -> Memory Agent
  -> Catalog Agent
  -> Risk Agent
  -> Quote Writer Agent
  -> Human Approval Gate
  -> Learning Agent
  -> Audit Log + Proof Artifacts
```

Architecture details: `docs/architecture.md`

## Proof Artifacts

- `proof/generated/sample-agent-run.json`
- `proof/generated/generated-quote.json`
- `proof/generated/generated-quote.md`
- `proof/generated/audit-log.json`
- `proof/screenshots/`
- `proof/qwen-cloud-usage.md`
- `proof/alibaba-cloud-deployment.md`

## Suggested Devpost Description

Hive Corps is a self-improving agent workflow platform for B2B quote operations. It turns messy customer quote requests into structured requirements, checks customer memory and catalog data, applies pricing and risk policies, drafts a customer-ready quote, gates risky actions for human approval, and converts human edits into controlled memory and policy proposals for future runs.

The project is built for the Autopilot Agent track because it automates a real business workflow end-to-end while preserving approval checkpoints, auditability, and fallback behavior. It also demonstrates MemoryAgent and Agent Society patterns through persistent customer memory and multiple specialized agents working together.

## X/Twitter Post

```text
Introducing Hive Corps: a Qwen-powered agent corps for B2B quote operations.

It turns messy quote requests into approved, auditable customer responses, then learns from every human correction.

Built for the Qwen Cloud Global AI Hackathon.

#QwenCloud #AIagents #Hackathon #B2B #AgenticAI
```
