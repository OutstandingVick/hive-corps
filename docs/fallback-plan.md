# Fallback Plan

Hive Corps is designed to run in two modes.

## Live Mode

`DEMO_MODE=false`

Expected behavior:

- Agent roles call Qwen Cloud.
- Backend runs on Alibaba Cloud.
- Tool calls use real or deployed services.
- Proof video shows the deployed API responding.

## Deterministic Demo Mode

`DEMO_MODE=true`

Expected behavior:

- No external API calls are required.
- The same end-to-end workflow runs locally.
- Proof artifacts are generated.
- Dashboard remains fully usable.

This mode exists so judges can verify the product even if:

- Qwen Cloud credentials are unavailable.
- Network access is restricted.
- Alibaba Cloud deployment is temporarily offline.
- External APIs rate-limit or fail.

The fallback mode is clearly labeled in `/api/health` and the dashboard top bar.

