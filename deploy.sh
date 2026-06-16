#!/bin/bash
# deploy.sh — stage, commit, and push from your terminal.
# Usage: ./deploy.sh "your commit message"
# Run this from the project root whenever Claude finishes a change.

set -e

MSG="${1:-chore: deploy}"

# Remove any stale git lock files left by the sandbox
rm -f .git/index.lock .git/HEAD.lock .git/MERGE_HEAD.lock 2>/dev/null || true

# Stage all changes (modified + new + deleted tracked files)
git add -A

# Commit
git commit -m "$MSG"

# Push
git push

echo "✓ Deployed: $MSG"
