#!/usr/bin/env sh
set -eu

# Optional ECS bootstrap helper for Ubuntu/Debian-style images.
# Run from the Hive Corps project root after cloning the repo on Alibaba Cloud ECS.

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y docker.io
  systemctl enable docker
  systemctl start docker
fi

docker build -t hive-corps .

docker rm -f hive-corps >/dev/null 2>&1 || true

docker run -d \
  --name hive-corps \
  --restart unless-stopped \
  -p 8787:8787 \
  -e PORT="${PORT:-8787}" \
  -e DEMO_MODE="${DEMO_MODE:-true}" \
  -e QWEN_API_KEY="${QWEN_API_KEY:-}" \
  -e QWEN_MODEL="${QWEN_MODEL:-qwen-max}" \
  -e QWEN_BASE_URL="${QWEN_BASE_URL:-https://dashscope-intl.aliyuncs.com/compatible-mode/v1}" \
  -e QWEN_TIMEOUT_MS="${QWEN_TIMEOUT_MS:-20000}" \
  -e ALIBABA_CLOUD_REGION="${ALIBABA_CLOUD_REGION:-}" \
  -e ALIBABA_CLOUD_SERVICE=ecs \
  hive-corps

echo "Hive Corps should be live on port 8787."
