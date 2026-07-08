# Function Compute Deployment

Use this path when ECS is too expensive or unavailable. Function Compute gives Hive Corps a public Alibaba Cloud backend endpoint without running an always-on server.

## What This Deploys

Hive Corps runs as a Function Compute custom runtime:

```text
HTTP Trigger -> Function Compute custom runtime -> Node backend -> Hive Corps agents -> Qwen Cloud
```

The same endpoints used locally are exposed in the cloud:

- `/`
- `/api/health`
- `/api/run-demo?requestId=req_001`
- `/api/workflows`
- `/api/proof/latest`

## Files

- `bootstrap` starts the Node backend inside Function Compute.
- `s.example.yaml` is a Serverless Devs-style deployment template.

## Recommended Console Deployment

1. Open Alibaba Cloud Console.
2. Search for **Function Compute**.
3. Create or enter a service, for example `hive-corps`.
4. Create a function:
   - Function name: `hive-corps-api`
   - Runtime: **Custom Runtime**
   - Code upload: upload this repository as a ZIP file
   - Startup command: `/bin/sh deploy/alibaba-cloud/function-compute/bootstrap`
   - Memory: `512 MB`
   - Timeout: `60 seconds`
5. Add an **HTTP Trigger**:
   - Auth: anonymous/public for demo judging
   - Methods: `GET`, `POST`, `OPTIONS`
6. Add environment variables:

```bash
DEMO_MODE=false
QWEN_API_KEY=your_qwen_cloud_key
QWEN_MODEL=qwen-max
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_TIMEOUT_MS=20000
ALIBABA_CLOUD_REGION=your-region
ALIBABA_CLOUD_SERVICE=function-compute
```

Fallback-only mode:

```bash
DEMO_MODE=true
ALIBABA_CLOUD_SERVICE=function-compute
```

7. Deploy and copy the public HTTP trigger URL.
8. Verify from this repo:

```bash
npm run verify:deployment -- https://YOUR_FUNCTION_HTTP_TRIGGER_URL
```

## Serverless Devs Template

If you use Serverless Devs, copy the example first:

```bash
cp deploy/alibaba-cloud/function-compute/s.example.yaml s.yaml
```

Then set environment variables locally and deploy:

```bash
export ALIBABA_CLOUD_REGION=your-region
export DEMO_MODE=false
export QWEN_API_KEY=your_qwen_cloud_key
export QWEN_MODEL=qwen-max
export QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
export QWEN_TIMEOUT_MS=20000

s deploy
```

## Proof Video Checklist

Record:

1. Function Compute console showing the `hive-corps-api` function.
2. HTTP trigger URL.
3. `/api/health` response showing `ALIBABA_CLOUD_SERVICE=function-compute` through the proof metadata or environment.
4. `/api/workflows` running a custom quote request.
5. Hive Corps dashboard using the deployed URL.

Add the final URL and recording link to:

```text
proof/alibaba-cloud-deployment.md
```
