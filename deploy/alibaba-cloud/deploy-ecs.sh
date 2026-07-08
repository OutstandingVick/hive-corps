#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Usage: QWEN_API_KEY=... deploy/alibaba-cloud/deploy-ecs.sh root@YOUR_ECS_PUBLIC_IP [repo_url]"
  echo ""
  echo "Required:"
  echo "  ssh target, for example root@47.88.12.34"
  echo ""
  echo "Optional environment:"
  echo "  QWEN_API_KEY, DEMO_MODE, QWEN_MODEL, QWEN_BASE_URL, QWEN_TIMEOUT_MS, PORT, ALIBABA_CLOUD_REGION"
  exit 1
fi

SSH_TARGET="$1"
REPO_URL="${2:-https://github.com/OutstandingVick/hive-corps.git}"
APP_DIR="${APP_DIR:-/opt/hive-corps}"
PORT="${PORT:-8787}"
DEMO_MODE="${DEMO_MODE:-false}"
QWEN_MODEL="${QWEN_MODEL:-qwen-max}"
QWEN_BASE_URL="${QWEN_BASE_URL:-https://dashscope-intl.aliyuncs.com/compatible-mode/v1}"
QWEN_TIMEOUT_MS="${QWEN_TIMEOUT_MS:-20000}"
ALIBABA_CLOUD_REGION="${ALIBABA_CLOUD_REGION:-}"

ssh "$SSH_TARGET" "APP_DIR='$APP_DIR' REPO_URL='$REPO_URL' PORT='$PORT' DEMO_MODE='$DEMO_MODE' QWEN_API_KEY='${QWEN_API_KEY:-}' QWEN_MODEL='$QWEN_MODEL' QWEN_BASE_URL='$QWEN_BASE_URL' QWEN_TIMEOUT_MS='$QWEN_TIMEOUT_MS' ALIBABA_CLOUD_REGION='$ALIBABA_CLOUD_REGION' sh -s" <<'REMOTE'
set -eu

if ! command -v git >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y git
  elif command -v yum >/dev/null 2>&1; then
    yum install -y git
  fi
fi

if ! command -v docker >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y docker.io
    systemctl enable docker || true
    systemctl start docker || true
  elif command -v yum >/dev/null 2>&1; then
    yum install -y docker
    systemctl enable docker || true
    systemctl start docker || true
  fi
fi

mkdir -p "$(dirname "$APP_DIR")"

if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin main
  git -C "$APP_DIR" reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

cat > .env.production <<EOF
PORT=$PORT
DEMO_MODE=$DEMO_MODE
QWEN_API_KEY=$QWEN_API_KEY
QWEN_MODEL=$QWEN_MODEL
QWEN_BASE_URL=$QWEN_BASE_URL
QWEN_TIMEOUT_MS=$QWEN_TIMEOUT_MS
ALIBABA_CLOUD_REGION=$ALIBABA_CLOUD_REGION
ALIBABA_CLOUD_SERVICE=ecs
EOF
chmod 600 .env.production

docker build -t hive-corps .
docker rm -f hive-corps >/dev/null 2>&1 || true
docker run -d \
  --name hive-corps \
  --restart unless-stopped \
  --env-file .env.production \
  -p "$PORT:$PORT" \
  hive-corps

docker ps --filter "name=hive-corps"
echo "Hive Corps deployed on port $PORT."
REMOTE
