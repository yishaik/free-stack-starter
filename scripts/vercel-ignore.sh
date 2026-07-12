#!/bin/bash
# Vercel "Ignored Build Step" — runs before each build on Vercel.
#   exit 0  → SKIP the build (saves free-tier build minutes)
#   exit 1  → PROCEED with the build
#
# Rule: skip a build when the ONLY changed files are docs/markdown/license, so a
# README or STACK-GUIDE edit doesn't burn a full Next.js build + deploy. Any change
# to app code, config, or dependencies triggers a normal build.

set -e

# first commit / no parent → always build
if ! git rev-parse HEAD^ >/dev/null 2>&1; then
  exit 1
fi

# if there are NO changes outside docs/*.md/LICENSE, skip
if git diff --quiet HEAD^ HEAD -- . ':(exclude)*.md' ':(exclude)docs/' ':(exclude)LICENSE'; then
  echo "🟡 Only docs/markdown changed — skipping build to conserve free-tier build minutes."
  exit 0
fi

echo "🟢 Code changed — building."
exit 1
