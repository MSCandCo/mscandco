/**
 * Script to fix all loading states across the platform
 * Ensures consistent use of PageLoading component
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = [
  'app/admin/accessibility/AccessibilityAdminClient.js',
  'app/admin/assetlibrary/AssetLibraryClient.js',
  'app/admin/open-data/OpenDataAdminClient.js',
  'app/admin/skills/SkillsAdminClient.js',
  'app/admin/sustainability/SustainabilityAdminClient.js',
  'app/artist/releases/ReleasesClient.js',
  'app/artist/settings/SettingsClient.js',
  'app/distribution/hub/DistributionHubClient.js',
  'app/distribution/revenue/RevenueReportingClient.js',
  'app/labeladmin/dashboard/LabelDashboardClient.js',
  'app/labeladmin/settings/SettingsClient.js'
];

let updatedCount = 0;

console.log('🔄 Fixing loading states across the platform...\n');

files.forEach(filePath => {
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file needs import
    if (!content.includes("import { PageLoading }") && !content.includes("import { PageLoading,")) {
      // Find the last lucide-react import
      const lucideImportMatch = content.match(/import.*from ['"]lucide-react['"]/);
      if (lucideImportMatch) {
        const importLine = lucideImportMatch[0];
        content = content.replace(
          importLine,
          `${importLine}\nimport { PageLoading } from '@/components/ui/LoadingSpinner';`
        );
        modified = true;
      }
    }

    // Replace old loading patterns with PageLoading
    const oldPatterns = [
      // Pattern 1: Full div with spinner
      /if \(loading\) {\s*return \(\s*<div className="min-h-screen.*?bg-gray-50.*?flex items-center justify-center">[\s\S]*?<\/div>\s*\)\s*;?\s*}/g,
      // Pattern 2: Simpler variant
      /if \(loading\) {\s*return \(\s*<div className="flex items-center justify-center min-h-screen">[\s\S]*?<\/div>\s*\)\s*;?\s*}/g
    ];

    oldPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        // Extract the loading message if present
        const messageMatch = content.match(/Loading ([^\.]+)\.\.\./);
        const message = messageMatch ? `Loading ${messageMatch[1]}...` : 'Loading...';

        content = content.replace(
          pattern,
          `if (loading) {\n    return <PageLoading message="${message}" />;\n  }`
        );
        modified = true;
      }
    });

    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Updated ${updatedCount} files to use consistent PageLoading component!`);
console.log('✨ All loading states are now consistent across the platform.');
