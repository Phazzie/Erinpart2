#!/bin/bash
# Validate Phase 3: All mocks validated

echo "🔍 Validating Phase 3: Mock Services..."

# Check all mock files exist
files=(
  "src/lib/mocks/auth.mock.ts"
  "src/lib/mocks/session.mock.ts"
  "src/lib/mocks/task.mock.ts"
  "src/lib/mocks/choice.mock.ts"
  "src/lib/mocks/list.mock.ts"
  "src/lib/mocks/realtime.mock.ts"
  "src/lib/mocks/vibe.mock.ts"
)

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

# Check for 'any' types
if grep -r ": any" src/lib/mocks/; then
  echo "❌ Found 'any' types in mocks"
  exit 1
fi

# Run TypeScript check
if ! npm run check; then
  echo "❌ TypeScript errors found"
  exit 1
fi

# Run contract tests
if ! npm run test:contracts; then
  echo "❌ Contract tests failed"
  exit 1
fi

# Check test count (should be at least 160)
test_count=$(npm run test:contracts -- --reporter=json 2>/dev/null | grep -o '"numTotalTests":[0-9]*' | grep -o '[0-9]*' || echo "0")
if [ "$test_count" -lt 160 ]; then
  echo "❌ Insufficient tests: $test_count (expected ≥160)"
  exit 1
fi

echo "✅ Phase 3 validation passed!"
echo "✅ Contract tests: $test_count tests passing"
