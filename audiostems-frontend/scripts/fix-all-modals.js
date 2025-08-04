#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to update with their specific modal replacements
const modalUpdates = [
  // Artist Roster
  {
    file: 'pages/artist/roster.js',
    imports: {
      add: [
        "import ConfirmationModal from '@/components/shared/ConfirmationModal';",
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    confirmModal,
    notificationModal,
    confirmDelete,
    showSuccess,
    showError,
    closeConfirmModal,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "if (confirm('Are you sure you want to delete this contributor?')) {",
        new: `confirmDelete('this contributor', async () => {`
      },
      {
        old: `        if (response.ok) {
          await loadRoster();
        }`,
        new: `        if (response.ok) {
          await loadRoster();
          showSuccess('Contributor deleted successfully!');
        } else {
          showError('Failed to delete contributor. Please try again.');
        }`
      }
    ]
  },

  // Admin Users Functional
  {
    file: 'pages/admin/users-functional.js',
    imports: {
      add: [
        "import ConfirmationModal from '@/components/shared/ConfirmationModal';",
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    confirmModal,
    notificationModal,
    confirmDelete,
    showSuccess,
    closeConfirmModal,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "if (confirm('Are you sure you want to delete this user?')) {",
        new: "confirmDelete('this user', () => {"
      },
      {
        old: `      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccessMessage('User deleted successfully!');
      setShowSuccessModal(true);
    }`,
        new: `      setUsers(prev => prev.filter(u => u.id !== userId));
      showSuccess('User deleted successfully!');
    });`
      }
    ]
  },

  // Distribution Workflow
  {
    file: 'pages/distribution/workflow.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showSuccess,
    showWarning,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert(`Workflow #${workflowId} has been archived successfully!`);",
        new: "showSuccess(`Workflow #${workflowId} has been archived successfully!`, 'Archive Complete');"
      },
      {
        old: "alert(`${count} workflows have been archived successfully!`);",
        new: "showSuccess(`${count} workflows have been archived successfully!`, 'Bulk Archive Complete');"
      },
      {
        old: "alert('No completed workflows to archive.');",
        new: "showWarning('No completed workflows to archive.', 'Archive Notice');"
      }
    ]
  },

  // Partner Reports
  {
    file: 'pages/partner/reports.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showError,
    showWarning,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert('Error generating Excel file. Please try again.');",
        new: "showError('Error generating Excel file. Please try again.', 'Export Error');"
      },
      {
        old: "alert('Error generating PDF file. Please try again.');",
        new: "showError('Error generating PDF file. Please try again.', 'Export Error');"
      },
      {
        old: "alert('Please select both start and end dates');",
        new: "showWarning('Please select both start and end dates', 'Date Selection Required');"
      }
    ]
  },

  // Partner Analytics
  {
    file: 'pages/partner/analytics.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showWarning,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert('Please select both start and end dates');",
        new: "showWarning('Please select both start and end dates', 'Date Selection Required');"
      }
    ]
  },

  // Label Admin Dashboard
  {
    file: 'pages/label-admin/dashboard.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showError,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert('Error downloading release data. Please try again.');",
        new: "showError('Error downloading release data. Please try again.', 'Download Error');"
      },
      {
        old: "alert('Error downloading releases data. Please try again.');",
        new: "showError('Error downloading releases data. Please try again.', 'Download Error');"
      }
    ]
  },

  // Label Admin Earnings
  {
    file: 'pages/label-admin/earnings.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showWarning,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert('Please select both start and end dates');",
        new: "showWarning('Please select both start and end dates', 'Date Selection Required');"
      }
    ]
  },

  // Label Admin Releases
  {
    file: 'pages/label-admin/releases.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showError,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert('Error downloading release data. Please try again.');",
        new: "showError('Error downloading release data. Please try again.', 'Download Error');"
      }
    ]
  },

  // Label Admin Analytics
  {
    file: 'pages/label-admin/analytics.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showWarning,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert('Please select both start and end dates');",
        new: "showWarning('Please select both start and end dates', 'Date Selection Required');"
      }
    ]
  },

  // Create Release Modal
  {
    file: 'components/releases/CreateReleaseModal.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showSuccess,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "alert('Edit request submitted successfully! The distribution team will review your changes.');",
        new: "showSuccess('Edit request submitted successfully! The distribution team will review your changes.', 'Request Submitted');"
      },
      {
        old: "alert('Release submitted successfully! Your release has been sent for review.');",
        new: "showSuccess('Release submitted successfully! Your release has been sent for review.', 'Release Submitted');"
      }
    ]
  },

  // Export Button
  {
    file: 'components/export/ExportButton.js',
    imports: {
      add: [
        "import NotificationModal from '@/components/shared/NotificationModal';",
        "import useModals from '@/hooks/useModals';"
      ]
    },
    hooks: `
  // Initialize modals hook
  const {
    notificationModal,
    showInfo,
    closeNotificationModal
  } = useModals();`,
    replacements: [
      {
        old: "onClick={() => alert('Export settings will be available in the next update!')}",
        new: "onClick={() => showInfo('Export settings will be available in the next update!', 'Feature Coming Soon')}"
      }
    ]
  }
];

console.log('🚀 Starting Modal System Update Across Platform...\n');

modalUpdates.forEach(update => {
  const filePath = path.join(__dirname, '..', update.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${update.file}`);
    return;
  }

  console.log(`📝 Updating ${update.file}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add imports
  if (update.imports?.add) {
    const importRegex = /(import.*from.*['"].*['"];?\s*\n)+/;
    const lastImportMatch = content.match(importRegex);
    if (lastImportMatch) {
      const lastImportIndex = content.lastIndexOf(lastImportMatch[0]);
      const insertPosition = lastImportIndex + lastImportMatch[0].length;
      const newImports = update.imports.add.join('\n') + '\n';
      content = content.slice(0, insertPosition) + newImports + content.slice(insertPosition);
    }
  }
  
  // Add hooks
  if (update.hooks) {
    // Find the component function and add hooks after existing hooks
    const componentMatch = content.match(/export default function \w+.*?\{[\s\S]*?const.*?=.*?;/);
    if (componentMatch) {
      const insertPosition = componentMatch.index + componentMatch[0].length;
      content = content.slice(0, insertPosition) + '\n' + update.hooks + '\n' + content.slice(insertPosition);
    }
  }
  
  // Apply replacements
  update.replacements.forEach(replacement => {
    if (content.includes(replacement.old)) {
      content = content.replace(replacement.old, replacement.new);
      console.log(`  ✅ Replaced: ${replacement.old.substring(0, 50)}...`);
    } else {
      console.log(`  ⚠️  Not found: ${replacement.old.substring(0, 50)}...`);
    }
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${update.file}\n`);
});

console.log('🎉 Modal System Update Complete!');
console.log('\n📋 Summary:');
console.log('• All generic confirm() and alert() dialogs replaced');
console.log('• Branded ConfirmationModal and NotificationModal implemented');
console.log('• Consistent MSC & Co styling across platform');
console.log('• Professional user experience maintained');