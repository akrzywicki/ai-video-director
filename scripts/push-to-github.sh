#!/usr/bin/env bash
set -euo pipefail

TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "Missing GH_TOKEN or GITHUB_TOKEN (add in Cursor → Cloud Agents → Secrets)."
  exit 1
fi

REMOTE="https://x-access-token:${TOKEN}@github.com/akrzywicki/ai-video-director.git"

git push "$REMOTE" main
git push "$REMOTE" main:develop || true

echo "Pushed main to GitHub (and main→develop if develop exists)."
