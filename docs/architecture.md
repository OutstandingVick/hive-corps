# Architecture

## Product Shape

Hive Corps is a B2B quote operations dashboard backed by an agent orchestration API.

The project is intentionally not a hidden script. Judges can see the workflow, run it from the UI, inspect proof artifacts, and verify the architecture from the README.

## System Diagram

```mermaid
flowchart TD
  A["Inbound B2B quote request"] --> B["Node API<br/>Alibaba Cloud deployable"]
  B --> C["Qwen Agent Orchestrator"]
  C --> D["Intake Agent"]
  C --> E["Planner Agent"]
  C --> F["Memory Agent"]
  C --> G["Catalog Agent"]
  C --> H["Risk Agent"]
  C --> I["Quote Writer Agent"]
  C --> J["Learning Agent"]
  F --> K["Customer memory JSON/store"]
  G --> L["Product catalog JSON/store"]
  H --> M["Pricing and approval policies"]
  I --> N["Generated quote output"]
  H --> O["Human approval gate"]
  O --> P["Final customer response/state change"]
  O --> J
  J --> K
  C --> Q["Audit log and proof artifacts"]
```

## Agent Contract

Every agent step includes:

- Agent name
- Status
- Summary
- Evidence object
- Timestamp

This keeps the workflow inspectable and turns agent output into judge-verifiable proof.

