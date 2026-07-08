# Alibaba Cloud Deployment Proof

Hackathon requirement:

> Demonstrate that the backend is running on Alibaba Cloud with a short recording and provide a link to a code file demonstrating use of Alibaba Cloud services/APIs.

## Included Code Evidence

- `server/alibaba-cloud-service.example.json`
- `server/index.js`
- `Dockerfile`
- `deploy/alibaba-cloud/README.md`
- `deploy/alibaba-cloud/function-compute/README.md`
- `deploy/alibaba-cloud/function-compute/bootstrap`
- `deploy/alibaba-cloud/function-compute/s.example.yaml`
- `scripts/verify-deployment.mjs`
- `/api/health`

## Recommended Deployment Target

**Alibaba Cloud Function Compute custom runtime**

This path avoids an always-on ECS instance while still proving the backend runs on Alibaba Cloud infrastructure:

```text
HTTP Trigger -> Function Compute custom runtime -> Node backend -> Hive Corps dashboard/API
```

The backend exposes:

- `/`
- `/api/health`
- `/api/run-demo?requestId=req_001`
- `/api/run-demo?requestId=req_002&applyLearning=true`
- `/api/workflows`
- `/api/proof/latest`

## Final Submission Evidence To Add

Before submitting:

1. Deploy the Node backend to Alibaba Cloud Function Compute or ECS.
2. Record a short video showing:
   - Alibaba Cloud console/service page.
   - The deployed URL.
   - `/api/health` returning product, mode, and timestamp.
   - `/api/run-demo` returning a full agent run.
   - `/api/workflows` accepting a new customer request and returning a new auditable run.
3. Add the deployed URL here.
4. Add the recording URL here.
5. Run:

```bash
npm run verify:deployment -- http://YOUR_ECS_PUBLIC_IP:8787
```

6. Paste the verifier output here.

## Placeholder

Deployed URL: `TODO`

Deployment recording: `TODO`

Alibaba Cloud service used: `TODO`

Verifier output:

```text
Local verifier smoke test:

Hive Corps deployment verified.
URL: http://127.0.0.1:8787
Mode: deterministic-demo
Qwen enabled: false
Approval status: human_edit_required
```

## Current Local Deployment Status

Prepared:

- Dockerfile for ECS/container deployment.
- Function Compute custom runtime bootstrap.
- Function Compute deployment guide and Serverless Devs example config.
- Alibaba Cloud deployment guide.
- Deployment verifier script.
- Health and demo endpoints.
- Custom workflow endpoint for judge-submitted quote requests.
- Proof metadata in workflow responses.

Blocked in this environment:

- Alibaba Cloud credentials are not configured here.
- `aliyun` CLI and Serverless Devs are not installed.
- Docker is installed, but the Docker daemon is not running locally, so the image build could not be smoke-tested here.

Next action:

Deploy through Alibaba Cloud Function Compute using the custom runtime guide, then run `npm run verify:deployment -- https://YOUR_FUNCTION_HTTP_TRIGGER_URL`.
