#!/bin/bash
# Integration Readiness Checklist (Step 8)

echo "🔍 Running Integration Readiness Checklist..."

# All previous validations must pass
./scripts/validate-phase2.sh || exit 1
./scripts/validate-phase3.sh || exit 1

# Run all tests
if ! npm run test; then
  echo "❌ Tests failed"
  exit 1
fi

# Check test coverage (should be >90%)
coverage=$(npm run test:coverage -- --reporter=json 2>/dev/null | grep -o '"total":{"lines":{"pct":[0-9.]*}' | grep -o '[0-9.]*$' || echo "0")
if (( $(echo "$coverage < 90" | bc -l 2>/dev/null || echo "1") )); then
  echo "⚠️  Coverage is ${coverage}% (target: >90%)"
fi

# Build production bundle
if ! npm run build; then
  echo "❌ Build failed"
  exit 1
fi

# Check bundle size
if [ -d ".svelte-kit/output/client/_app" ]; then
  bundle_size=$(du -sb .svelte-kit/output/client/_app 2>/dev/null | awk '{print $1}' || echo "0")
  max_size=$((150 * 1024)) # 150kb

  if [ "$bundle_size" -gt "$max_size" ]; then
    echo "⚠️  Bundle size: $(($bundle_size / 1024))kb (target: <150kb)"
  else
    echo "✅ Bundle size: $(($bundle_size / 1024))kb (within target)"
  fi
fi

echo "✅ Integration readiness check passed!"
echo "🚀 Ready to flip the switch (Step 8)"
