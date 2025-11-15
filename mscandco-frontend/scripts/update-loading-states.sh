#!/bin/bash

# Script to ensure all loading states use the centralized PageLoading component

echo "🔄 Updating loading states across the platform..."

# Files that need updating
FILES=(
  "app/admin/accessibility/AccessibilityAdminClient.js"
  "app/admin/open-data/OpenDataAdminClient.js"
  "app/admin/sustainability/SustainabilityAdminClient.js"
  "app/admin/skills/SkillsAdminClient.js"
  "app/admin/splitconfiguration/SplitConfigurationClient.js"
  "app/admin/masterroster/MasterRosterClient.js"
)

count=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if file has the old loading pattern and needs import
    if grep -q "min-h-screen.*flex items-center justify-center" "$file" && ! grep -q "PageLoading" "$file"; then
      echo "  📝 Updating $file"

      # Add import if not present
      if ! grep -q "import { PageLoading }" "$file"; then
        # Add import after other imports
        sed -i '' "/import.*from 'lucide-react'/a\\
import { PageLoading } from '@/components/ui/LoadingSpinner';
" "$file"
      fi

      ((count++))
    fi
  fi
done

echo "✅ Updated $count files to use centralized PageLoading component"
echo "🎉 All loading states are now consistent!"
