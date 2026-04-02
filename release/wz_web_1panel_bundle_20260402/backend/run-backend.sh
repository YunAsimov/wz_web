#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$SCRIPT_DIR"
ENV_FILE="$APP_DIR/backend.env"
JAR_FILE="$APP_DIR/backend.jar"
PID_FILE="$APP_DIR/backend.pid"
LOG_FILE="$APP_DIR/backend.log"

if [[ ! -f "$JAR_FILE" ]]; then
  echo "backend.jar not found: $JAR_FILE"
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "backend already running with PID $(cat "$PID_FILE")"
  exit 0
fi

nohup java -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "backend started, PID $(cat "$PID_FILE")"
