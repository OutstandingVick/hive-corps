# Vercel Deployment

Vercel can host Hive Corps as a public demo URL while Alibaba Cloud deployment is pending credits or Function Compute activation.

## What Works on Vercel

- Landing page
- Quote operations dashboard
- `/api/health`
- `/api/run-demo`
- `/api/workflows`
- `/api/requests`
- `/api/proof/latest`
- Qwen live mode when `QWEN_API_KEY` is configured

## Important Limitation

Vercel serverless functions run on ephemeral infrastructure. Custom workflow runs return auditable proof in the HTTP response, but they do not persist new files into `proof/generated`.

Persistent proof export is available when running locally or on an Alibaba Cloud deployment with writable storage.

## Environment Variables

In Vercel Project Settings, add:

```text
DEMO_MODE=false
QWEN_API_KEY=your_qwen_cloud_key
QWEN_MODEL=qwen-max
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_TIMEOUT_MS=20000
```

For fallback mode:

```text
DEMO_MODE=true
```

## Why Vercel Is Included

The hackathon still requires Alibaba Cloud deployment proof for final compliance. Vercel is included as a public judge-facing demo URL so the product can be inspected quickly even if Alibaba Cloud compute credits are unavailable.
