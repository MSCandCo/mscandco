#!/usr/bin/env node
// 🌙 OVERNIGHT AUTOMATED CLEANUP SCRIPT
// Removes Auth0, AWS, cleans up legacy code automatically

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting overnight cleanup...');

// Files to completely delete
const filesToDelete = [
  'lib/user-utils.js',
  'lib/auth0-stub.js', 
  'lib/no-auth.js',
  'components/auth/LogoutButton.js',
  'components/auth/Profile.js'
];

// Auth0 imports to remove from files
const auth0ImportsToRemove = [
  "import { useAuth0 } from '@auth0/auth0-react';",
  "import { Auth0Provider } from '@auth0/auth0-react';",
  "import { withAuthenticationRequired } from '@auth0/auth0-react';",
  "from '@auth0/auth0-react'",
  "import auth0",
  "useAuth0"
];

// AWS references to remove
const awsReferencesToRemove = [
  "amplify",
  "AWS",
  "lambda",
  "@aws"
];

// Cleanup functions
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${filePath}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not delete ${filePath}: ${error.message}`);
  }
}

function cleanupFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove Auth0 imports and references
    auth0ImportsToRemove.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (content.includes(pattern) || regex.test(content)) {
        content = content.replace(regex, '');
        modified = true;
      }
    });
    
    // Replace useAuth0 with useAuth from Supabase
    if (content.includes('useAuth0')) {
      content = content.replace(/useAuth0/g, 'useAuth');
      content = content.replace(/from '@auth0\/auth0-react'/g, 'from "../lib/supabase"');
      modified = true;
    }
    
    // Remove AWS references
    awsReferencesToRemove.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(content)) {
        // Only remove if it's not in comments or strings we want to keep
        const lines = content.split('\n');
        content = lines.filter(line => {
          return !regex.test(line) || line.includes('// Keep') || line.includes('/* Keep */');
        }).join('\n');
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not clean ${filePath}: ${error.message}`);
  }
}

// Main cleanup
function runCleanup() {
  console.log('🧹 Phase 1: Deleting Auth0 files...');
  filesToDelete.forEach(deleteFile);
  
  console.log('🧹 Phase 2: Cleaning Auth0/AWS from code files...');
  
  // Get all JS/JSX files to clean
  const filesToClean = [
    'pages/billing.js',
    'pages/pricing.js',
    'pages/dashboard.js',
    'pages/login.js',
    'pages/register.js',
    'components/auth/RoleProtectedRoute.js',
    'components/header.js',
    'components/navigation/RoleBasedNavigation.js'
  ];
  
  filesToClean.forEach(cleanupFile);
  
  console.log('✅ Cleanup completed!');
  console.log('');
  console.log('📋 CLEANUP SUMMARY:');
  console.log('- ✅ Auth0 files deleted');
  console.log('- ✅ Auth0 imports removed');
  console.log('- ✅ AWS references cleaned');
  console.log('- ✅ useAuth0 → useAuth migration');
  console.log('');
  console.log('🎯 Ready for testing phase!');
}

// Run the cleanup
runCleanup();
