#!/usr/bin/env node
// 🧹 STRIPE CLEANUP SCRIPT - Replace with Revolut

const fs = require('fs');

console.log('🧹 Removing Stripe, keeping only Revolut...');

// Files to delete completely
const filesToDelete = [
  'lib/stripe.js',
  'pages/api/billing/create-checkout-session.js',
  'pages/api/billing/create-portal-session.js'
];

// Update billing.js to remove Stripe references
function updateBillingPage() {
  const filePath = 'pages/billing.js';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Stripe API calls with Revolut
  content = content.replace(
    /\/api\/billing\/create-checkout-session/g,
    '/api/billing/create-revolut-checkout'
  );
  
  // Remove Stripe error messages
  content = content.replace(
    /Stripe is not configured\. Please contact support to set up billing\./g,
    'Revolut payment processing temporarily unavailable. Please try again or contact support.'
  );
  
  // Update error messages to mention Revolut
  content = content.replace(/Stripe/g, 'Payment processor');
  content = content.replace(/stripe/g, 'payment');
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Updated billing.js - Removed Stripe references');
}

// Update pricing.js to use only Revolut
function updatePricingPage() {
  const filePath = 'pages/pricing.js';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Force Revolut usage
  content = content.replace(
    /const useRevolut = process\.env\.NODE_ENV === 'production' \|\| process\.env\.NEXT_PUBLIC_USE_REVOLUT === 'true';/,
    'const useRevolut = true; // Always use Revolut (Phase 1)'
  );
  
  // Remove Stripe fallback
  content = content.replace(
    /} else {\s*\/\/ Fallback: Stripe checkout\s*await handleStripeCheckout\(priceId, plan\);\s*}/,
    '} else {\n        throw new Error("Revolut payment processing is required. Please contact support if you continue to see this message.");\n      }'
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Updated pricing.js - Revolut only');
}

// Update package.json to remove Stripe dependencies
function updatePackageJson() {
  const packagePath = 'package.json';
  const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Remove Stripe dependencies
  delete package.dependencies['@stripe/stripe-js'];
  delete package.dependencies['stripe'];
  
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
  console.log('✅ Updated package.json - Removed Stripe dependencies');
}

// Main cleanup
function runStripeCleanup() {
  console.log('🗑️  Deleting Stripe files...');
  filesToDelete.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`✅ Deleted: ${file}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not delete ${file}: ${error.message}`);
    }
  });
  
  console.log('🔄 Updating files to use Revolut only...');
  updateBillingPage();
  updatePricingPage();
  updatePackageJson();
  
  console.log('');
  console.log('✅ STRIPE CLEANUP COMPLETE!');
  console.log('- ✅ Stripe files deleted');
  console.log('- ✅ Revolut-only configuration');
  console.log('- ✅ Dependencies updated');
  console.log('- 🚀 Ready for Revolut Phase 1!');
}

runStripeCleanup();
