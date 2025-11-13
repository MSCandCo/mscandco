/**
 * Test Production Permission System
 *
 * Tests the live production site to verify permission checks are working
 */

const { chromium } = require('playwright');

async function main() {
  console.log('🧪 Testing Production Permission System\n');
  console.log('Target: https://mscandco.vercel.app\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console logs from the page
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('requirePermission') || text.includes('getUserPermissions')) {
      console.log('🔍 Browser Console:', text);
    }
  });

  try {
    console.log('1️⃣ Loading login page...');
    await page.goto('https://mscandco.vercel.app/login', { waitUntil: 'networkidle' });

    // Check if we need credentials
    console.log('\n⚠️  Please provide test user credentials:');
    console.log('   We need to test with an admin user account\n');

    // For now, let's try to access an admin page directly and see what happens
    console.log('2️⃣ Attempting to access admin page directly...');
    await page.goto('https://mscandco.vercel.app/admin/usermanagement', { waitUntil: 'networkidle' });

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('   ✅ Correctly redirected to login (not authenticated)');
      console.log('\n3️⃣ Testing with authenticated user...');
      console.log('   Please log in manually in the browser window');

      // Wait for user to log in
      await page.waitForURL(url => !url.includes('/login'), { timeout: 120000 });
      console.log('   ✅ User logged in');

      const postLoginUrl = page.url();
      console.log(`   Redirected to: ${postLoginUrl}`);

      // Now try to access admin page
      console.log('\n4️⃣ Attempting to access admin/usermanagement...');
      await page.goto('https://mscandco.vercel.app/admin/usermanagement', { waitUntil: 'networkidle' });

      const finalUrl = page.url();
      console.log(`   Final URL: ${finalUrl}`);

      if (finalUrl.includes('/dashboard') && !finalUrl.includes('/admin')) {
        console.log('   ❌ ISSUE CONFIRMED: Redirected to dashboard instead of showing admin page');

        // Try to get more info from the page
        const pageTitle = await page.title();
        console.log(`   Page Title: ${pageTitle}`);

        // Check network requests
        console.log('\n5️⃣ Checking for 302 redirects...');

        // Try another admin page
        console.log('\n6️⃣ Testing admin/settings page...');
        await page.goto('https://mscandco.vercel.app/admin/settings', { waitUntil: 'networkidle' });
        console.log(`   URL: ${page.url()}`);

        // Try artist page
        console.log('\n7️⃣ Testing artist/analytics page...');
        await page.goto('https://mscandco.vercel.app/artist/analytics', { waitUntil: 'networkidle' });
        console.log(`   URL: ${page.url()}`);

      } else if (finalUrl.includes('/admin/usermanagement')) {
        console.log('   ✅ SUCCESS: Admin page loaded correctly!');

        const pageContent = await page.textContent('body');
        console.log(`   Page contains: ${pageContent.substring(0, 200)}...`);
      }

    } else if (currentUrl.includes('/dashboard')) {
      console.log('   ❌ Redirected to dashboard (should have shown login or page)');
    }

    console.log('\n8️⃣ Waiting 30 seconds for manual testing...');
    console.log('   You can manually navigate to different pages to test');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n✅ Test complete');
}

main();
