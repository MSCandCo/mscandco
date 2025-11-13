#!/bin/bash

# Count total console.log statements before cleanup
echo "Scanning for console statements..."
TOTAL_BEFORE=$(grep -r "console\.\(log\|debug\|warn\)" app/ components/ lib/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "Found $TOTAL_BEFORE console.log/debug/warn statements"

# Remove console.log, console.debug, console.warn (but keep console.error)
find app/ components/ lib/ -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
  # Remove console.log statements
  sed -i '' '/^[[:space:]]*console\.log(/d' "$file"
  sed -i '' '/^[[:space:]]*console\.debug(/d' "$file"
  sed -i '' '/^[[:space:]]*console\.warn(/d' "$file"
  
  # Remove inline console.log/debug/warn (but not console.error)
  sed -i '' 's/console\.log([^)]*);*//g' "$file"
  sed -i '' 's/console\.debug([^)]*);*//g' "$file"
  sed -i '' 's/console\.warn([^)]*);*//g' "$file"
done

# Count after cleanup
TOTAL_AFTER=$(grep -r "console\.\(log\|debug\|warn\)" app/ components/ lib/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "Remaining console.log/debug/warn statements: $TOTAL_AFTER"
echo "Removed: $((TOTAL_BEFORE - TOTAL_AFTER)) statements"
echo "✅ Console cleanup complete (console.error statements preserved)"
