# Alibaba Cloud Deployment Guide

This guide prepares Hive Corps for the hackathon requirement:

> Demonstrate that the backend is running on Alibaba Cloud with a short recording and provide a code file showing Alibaba Cloud service/API use.

The lowest-cost hackathon path is **Alibaba Cloud Function Compute** because it avoids an always-on ECS instance. ECS with Docker remains available if you already have server credits or SSH access.

- The same backend runs locally and in the cloud.
- `/api/health` proves the deployed service is alive.
- `/api/run-demo` proves the full agent workflow runs from the cloud backend.
- `/api/workflows` proves judges can submit a new quote request.
- The Dockerfile and deployment files are visible in the public repo.

## Files Added for Deployment

- `Dockerfile`
- `.dockerignore`
- `server/alibaba-cloud-service.example.json`
- `scripts/verify-deployment.mjs`
- `proof/alibaba-cloud-deployment.md`
- `deploy/alibaba-cloud/ecs-user-data.sh`
- `deploy/alibaba-cloud/deploy-ecs.sh`
- `deploy/alibaba-cloud/function-compute/README.md`
- `deploy/alibaba-cloud/function-compute/bootstrap`
- `deploy/alibaba-cloud/function-compute/s.example.yaml`

## Environment Variables

Use these on Alibaba Cloud:

```bash
PORT=8787
DEMO_MODE=false
QWEN_API_KEY=your_qwen_cloud_key
QWEN_MODEL=qwen-max
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_TIMEOUT_MS=20000
ALIBABA_CLOUD_REGION=your-region
ALIBABA_CLOUD_SERVICE=ecs
```

For a fallback-only deployment, set:

```bash
DEMO_MODE=true
```

## Recommended: Function Compute Deployment

Use this path when you do not have funds for ECS.

Read:

```text
deploy/alibaba-cloud/function-compute/README.md
```

High-level steps:

1. Open Alibaba Cloud Console.
2. Search **Function Compute**.
3. Create a custom runtime function.
4. Upload this repo as a ZIP.
5. Use startup command:

```bash
/bin/sh deploy/alibaba-cloud/function-compute/bootstrap
```

6. Add a public HTTP trigger.
7. Add Qwen environment variables.
8. Verify:

```bash
npm run verify:deployment -- https://YOUR_FUNCTION_HTTP_TRIGGER_URL
```

## Alternative: ECS Docker Deployment

### Option A: One-command SSH Deploy

Use this when you already have an ECS instance and SSH access.

Prerequisites:

- ECS public IP address.
- SSH access, for example `root@YOUR_ECS_PUBLIC_IP`.
- Security group inbound TCP port `8787` open.
- Qwen Cloud API key if you want live Qwen mode.

From your local project root:

```bash
QWEN_API_KEY="your_qwen_cloud_key" \
ALIBABA_CLOUD_REGION="your-region" \
deploy/alibaba-cloud/deploy-ecs.sh root@YOUR_ECS_PUBLIC_IP
```

Fallback-only deployment:

```bash
DEMO_MODE=true deploy/alibaba-cloud/deploy-ecs.sh root@YOUR_ECS_PUBLIC_IP
```

The script installs Docker if needed, pulls the public GitHub repo, builds the image, writes `.env.production`, and runs the backend container on port `8787`.

Verify:

```bash
npm run verify:deployment -- http://YOUR_ECS_PUBLIC_IP:8787
```

### Option B: Manual ECS Docker Deploy

1. Create an Alibaba Cloud ECS instance.
2. Open inbound TCP port `8787` in the security group.
3. Install Docker on the ECS instance.
4. Copy or clone this repository to the instance.
5. From the project root, build the image:

```bash
docker build -t hive-corps .
```

6. Run the container:

```bash
docker run -d \
  --name hive-corps \
  --restart unless-stopped \
  -p 8787:8787 \
  -e PORT=8787 \
  -e DEMO_MODE=false \
  -e QWEN_API_KEY="$QWEN_API_KEY" \
  -e QWEN_MODEL=qwen-max \
  -e QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1 \
  -e ALIBABA_CLOUD_REGION="$ALIBABA_CLOUD_REGION" \
  -e ALIBABA_CLOUD_SERVICE=ecs \
  hive-corps
```

Alternative from the project root on an Ubuntu/Debian ECS instance:

```bash
sh deploy/alibaba-cloud/ecs-user-data.sh
```

7. Verify from your local machine:

```bash
npm run verify:deployment -- http://YOUR_ECS_PUBLIC_IP:8787
```

## Required Proof Recording

Record a short video showing:

1. Alibaba Cloud ECS console with the running instance.
2. Security group showing port `8787` open.
3. Browser or terminal hitting:

```text
http://YOUR_ECS_PUBLIC_IP:8787/api/health
```

4. Browser or terminal hitting:

```text
http://YOUR_ECS_PUBLIC_IP:8787/api/run-demo?requestId=req_001
```

5. The Hive Corps dashboard:

```text
http://YOUR_ECS_PUBLIC_IP:8787
```

## Submission Evidence to Add

Update `proof/alibaba-cloud-deployment.md` with:

- Deployed URL.
- Alibaba Cloud service used.
- Deployment recording link.
- Date recorded.
- Any console screenshots.
