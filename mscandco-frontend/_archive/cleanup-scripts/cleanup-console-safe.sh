#!/bin/bash

echo "Safely removing console.log statements..."

# Only remove console.log/debug/warn that are standalone statements
# Do NOT touch multi-line console.log with object literals

find app/ components/ lib/ -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
  # Only remove simple single-line console.log statements
  # Pattern: console.log('...')  or console.log("...")  or console.log(`...`)
  sed -i '' "/^[[:space:]]*console\.log(['\"\`][^)]*['\"\`]);*$/d" "$file"
  
  # Remove simple variable logging
  sed -i '' "/^[[:space:]]*console\.log([a-zA-Z_][a-zA-Z0-9_]*);*$/d" "$file"
  
  # Remove console.debug
  sed -i '' "/^[[:space:]]*console\.debug(/d" "$file"
  
  # Remove console.warn (simple cases)
  sed -i '' "/^[[:space:]]*console\.warn(['\"\`][^)]*['\"\`]);*$/d" "$file"
done

echo "✅ Safe console.log cleanup complete"
echo "Note: Complex multi-line console.log statements preserved to avoid syntax errors"
