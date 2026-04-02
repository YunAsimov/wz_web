#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/backend.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "backend.pid not found"
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "backend stopped, PID $PID"
else
  echo "process $PID not running"
fi

rm -f "$PID_FILE"
