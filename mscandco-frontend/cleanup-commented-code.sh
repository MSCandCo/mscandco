#!/bin/bash

echo "Scanning for commented code blocks..."

# Find files with multiple consecutive commented lines (likely old code)
find app/ components/ lib/ -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
  # Count consecutive commented lines
  COMMENTED_BLOCKS=$(grep -E "^[[:space:]]*//" "$file" | wc -l)
  
  if [ $COMMENTED_BLOCKS -gt 10 ]; then
    echo "$file: $COMMENTED_BLOCKS commented lines"
  fi
done | sort -t: -k2 -rn | head -20

echo ""
echo "Note: Large blocks of commented code should be reviewed manually"
echo "Only removing obvious TODO/DEBUG comments automatically..."

# Remove TODO comments (but keep TODO in strings)
find app/ components/ lib/ -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
  # Remove TODO comments
  sed -i '' '/^[[:space:]]*\/\/ TODO:/d' "$file"
  sed -i '' '/^[[:space:]]*\/\/ FIXME:/d' "$file"
  sed -i '' '/^[[:space:]]*\/\/ DEBUG:/d' "$file"
  sed -i '' '/^[[:space:]]*\/\/ HACK:/d' "$file"
done

echo "✅ Commented code cleanup complete (manual review may be needed for large blocks)"
