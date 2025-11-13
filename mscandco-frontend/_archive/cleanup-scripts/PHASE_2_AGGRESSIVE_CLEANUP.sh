#!/bin/bash

# Phase 2: Aggressive Cleanup for AI-Ready Platform
# This script removes unused Pages Router files while keeping critical routes

cd "$(dirname "$0")"

echo "🚀 Phase 2: Aggressive Cleanup Starting..."
echo ""

# Delete entire unused API directories
echo "📁 Deleting unused API directories..."
rm -rf pages/api/companyadmin
rm -rf pages/api/distributionpartner  
rm -rf pages/api/cron
rm -rf pages/api/platform-stats
rm -rf pages/api/milestones
rm -rf pages/api/navigation
rm -rf pages/api/ai
rm -rf pages/api/analytics
rm -rf pages/api/assets
rm -rf pages/api/artists
rm -rf pages/api/playlists
rm -rf pages/api/profile
rm -rf pages/api/dashboard
rm -rf pages/api/distribution
rm -rf pages/api/payments

echo "✅ Deleted unused API directories"
echo ""

# Delete unused individual files
echo "📄 Deleting unused individual API files..."
rm -f pages/api/admin/dashboard-stats.js
rm -f pages/api/admin/platform-analytics.js
rm -f pages/api/admin/permission-metrics.js
rm -f pages/api/admin/trigger-renewals.js
rm -f pages/api/artist/dashboard-stats.js
rm -f pages/api/artist/analytics-data.js
rm -f pages/api/artist/affiliation-requests.js
rm -f pages/api/artist/respond-invitation.js
rm -f pages/api/artist/request-payout.js
rm -f pages/api/artist/profile-broken.js
rm -f pages/api/labeladmin/dashboard-stats.js
rm -f pages/api/labeladmin/analytics-combined.js
rm -f pages/api/labeladmin/analytics-individual.js
rm -f pages/api/labeladmin/accepted-artists.js
rm -f pages/api/labeladmin/add-artist-request.js
rm -f pages/api/labeladmin/change-request.js
rm -f pages/api/labeladmin/invitations.js
rm -f pages/api/labeladmin/invite-artist.js
rm -f pages/api/labeladmin/remove-artist.js
rm -f pages/api/labeladmin/send-invitation.js
rm -f pages/api/notifications/superadmin.js
rm -f pages/api/notifications/unread-count.js
rm -f pages/api/superadmin/ghostlogin.js

echo "✅ Deleted unused individual API files"
echo ""

# Count remaining files
REMAINING=$(find pages -type f -name "*.js" | wc -l | tr -d ' ')
echo "📊 Remaining Pages Router files: $REMAINING"
echo ""

echo "✅ Phase 2 Aggressive Cleanup Complete!"
echo ""
echo "🎯 Kept critical routes:"
echo "  - /pages/api/auth/* (authentication)"
echo "  - /pages/api/upload/* (file uploads)"
echo "  - /pages/api/releases/* (release management)"
echo "  - /pages/api/wallet/* (payments)"
echo "  - /pages/api/admin/permissions/* (RBAC)"
echo "  - /pages/api/admin/roles/* (RBAC)"
echo "  - /pages/api/admin/users/* (user management)"
echo "  - /pages/api/subscriptions/* (billing)"
echo "  - /pages/api/revenue/* (distribution)"
echo ""
echo "📝 These will be migrated in future sprints as needed"

