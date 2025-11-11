#!/bin/bash
# Validate Phase 2: All contracts defined

echo "🔍 Validating Phase 2: Contract Definition..."

# Check all contract files exist
files=(
  "src/lib/contracts/auth.contracts.ts"
  "src/lib/contracts/session.contracts.ts"
  "src/lib/contracts/task.contracts.ts"
  "src/lib/contracts/choice.contracts.ts"
  "src/lib/contracts/list.contracts.ts"
  "src/lib/contracts/realtime.contracts.ts"
  "src/lib/contracts/vibe.contracts.ts"
  "src/lib/contracts/ui-state.contracts.ts"
)

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

# Check for 'any' types
if grep -r ": any" src/lib/contracts/; then
  echo "❌ Found 'any' types in contracts"
  exit 1
fi

# Check for 'as' casts
if grep -r " as " src/lib/contracts/ | grep -v "as const" | grep -v "// @ts-"; then
  echo "❌ Found 'as' casts in contracts"
  exit 1
fi

# Run TypeScript check
if ! npm run check; then
  echo "❌ TypeScript errors found"
  exit 1
fi

echo "✅ Phase 2 validation passed!"
