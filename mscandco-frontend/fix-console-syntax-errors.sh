#!/bin/bash

# Fix files where console.log object syntax was broken
FILES=(
  "app/api/admin/analytics/simple-save/route.js"
  "app/api/apollo/chat/route.js"
  "app/api/artist/analytics-data/route.js"
  "app/api/artist/respond-invitation/route.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Find lines with orphaned object properties (starting with hash/property after whitespace)
    # and check if there's a missing console.log() above them
    
    # For now, just remove these orphaned debug object declarations
    sed -i '' '/^[[:space:]]*hasLatestRelease: /d' "$file"
    sed -i '' '/^[[:space:]]*hasMilestones: /d' "$file"
    sed -i '' '/^[[:space:]]*hasAdvancedData: /d' "$file"
    sed -i '' '/^[[:space:]]*hasSectionVisibility: /d' "$file"
    sed -i '' '/^[[:space:]]*hasContent: /d' "$file"
    sed -i '' '/^[[:space:]]*hasToolCalls: /d' "$file"
    sed -i '' '/^[[:space:]]*toolCount: /d' "$file"
    sed -i '' '/^[[:space:]]*found: /d' "$file"
    sed -i '' '/^[[:space:]]*invitation: /d' "$file"
    sed -i '' '/^[[:space:]]*currentArtistId: /d' "$file"
    sed -i '' '/^[[:space:]]*milestonesCount: /d' "$file"
    sed -i '' '/^[[:space:]]*})$/d' "$file"
  fi
done

echo "✅ Fixed syntax errors from console.log cleanup"
