#!/bin/bash

# Fix missing imports for pages that already have getServerSideProps

# labeladmin/analytics.js
if ! grep -q "from '@/lib/serverSidePermissions'" pages/labeladmin/analytics.js; then
  sed -i '' "1 i\\
import { requirePermission } from '@/lib/serverSidePermissions';\\
" pages/labeladmin/analytics.js
  echo "✅ Fixed pages/labeladmin/analytics.js"
fi

# labeladmin/releases.js
if ! grep -q "from '@/lib/serverSidePermissions'" pages/labeladmin/releases.js; then
  sed -i '' "1 i\\
import { requirePermission } from '@/lib/serverSidePermissions';\\
" pages/labeladmin/releases.js
  echo "✅ Fixed pages/labeladmin/releases.js"
fi

# labeladmin/roster.js
if ! grep -q "from '@/lib/serverSidePermissions'" pages/labeladmin/roster.js; then
  sed -i '' "1 i\\
import { requirePermission } from '@/lib/serverSidePermissions';\\
" pages/labeladmin/roster.js
  echo "✅ Fixed pages/labeladmin/roster.js"
fi

echo "✅ Import fixes complete!"
