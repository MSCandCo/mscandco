import { test, expect } from '@playwright/test';

// Test user credentials
const TEST_USERS = {
  artist: {
    email: 'info@htay.co.uk',
    password: 'test2025'
  },
  distributionPartner: {
    email: 'codegroup@mscandco.com',
    password: 'C0d3gr0up'
  },
  companyAdmin: {
    email: 'companyadmin@mscandco.com',
    password: 'ca@2025msC'
  }
};

test.describe('Complete Release Workflow', () => {
  
  test('artist creates, submits, and distribution partner reviews release', async ({ page }) => {
    // =========================
    // PART 1: Artist Creates Release
    // =========================
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.artist.email);
    await page.fill('#password', TEST_USERS.artist.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Navigate directly to releases page (skip dashboard interaction)
    await page.goto('/artist/releases');
    await page.waitForURL('/artist/releases', { timeout: 10000 });
    
    // Wait for page to load
    await page.waitForSelector('button:has-text("Create New Release")', { timeout: 10000 });
    
    // Click Create New Release
    await page.click('button:has-text("Create New Release")');
    
    // Fill in release details
    const releaseTitle = `Test Release ${Date.now()}`;
    await page.fill('input[name="title"]', releaseTitle);
    await page.fill('input[name="artist_name"]', 'Test Artist');
    await page.selectOption('select[name="genre"]', 'African');
    await page.fill('input[name="release_date"]', '2025-12-01');
    
    // Save as draft
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('text=Draft saved')).toBeVisible({ timeout: 10000 });
    
    // Submit for review
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Release submitted')).toBeVisible({ timeout: 10000 });
    
    // Verify status changed to submitted
    await expect(page.locator('text=Submitted')).toBeVisible();
    
    // =========================
    // PART 2: Distribution Partner Reviews
    // =========================
    
    // Logout as artist
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign Out');
    
    // Login as distribution partner
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.distributionPartner.email);
    await page.fill('#password', TEST_USERS.distributionPartner.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/distribution/dashboard');
    
    // Navigate to Distribution Queue - Using Link from dashboard
    await page.click('a[href="/distribution/queue"]');
    await page.waitForURL('/distribution/queue');
    
    // Find the submitted release
    await expect(page.locator(`text=${releaseTitle}`)).toBeVisible({ timeout: 10000 });
    
    // Move to in_review
    await page.locator(`tr:has-text("${releaseTitle}") button[title="Move to Review"]`).click();
    await expect(page.locator(`tr:has-text("${releaseTitle}") text=In Review`)).toBeVisible();
    
    // Approve and complete
    await page.locator(`tr:has-text("${releaseTitle}") button[title="Approve & Complete"]`).click();
    await expect(page.locator(`tr:has-text("${releaseTitle}") text=Completed`)).toBeVisible();
    
    // Mark as live
    await page.locator(`tr:has-text("${releaseTitle}") button[title="Mark as Live"]`).click();
    await expect(page.locator('text=Status updated')).toBeVisible({ timeout: 10000 });
  });

  test('artist requests update and distribution partner handles revision', async ({ page }) => {
    // Login as artist
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.artist.email);
    await page.fill('#password', TEST_USERS.artist.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Navigate directly to releases page
    await page.goto('/artist/releases');
    await page.waitForURL('/artist/releases', { timeout: 10000 });
    
    // Find a live release and request update
    await page.locator('tr:has-text("Live") button:has-text("Update")').first().click();
    
    // Status should change to revision
    await expect(page.locator('text=Update request submitted')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Revision')).toBeVisible();
    
    // Logout and login as distribution partner
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign Out');
    
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.distributionPartner.email);
    await page.fill('#password', TEST_USERS.distributionPartner.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/distribution/dashboard');
    
    // Go to revision queue - Distribution dashboard has Link with href
    await page.click('a[href="/distribution/revisions"]');
    await page.waitForURL('/distribution/revisions');
    
    // Should see the revision request
    await expect(page.locator('text=Revision')).toBeVisible();
    
    // Approve the revision
    await page.locator('button[title="Approve"]').first().click();
    
    // Add optional message
    await page.fill('textarea[placeholder*="message"]', 'Approved for revision');
    await page.click('button:has-text("Approve")');
    
    // Release should move to in_review
    await expect(page.locator('text=Approved')).toBeVisible({ timeout: 10000 });
  });

  test('distribution partner denies revision request', async ({ page }) => {
    // Login as distribution partner
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.distributionPartner.email);
    await page.fill('#password', TEST_USERS.distributionPartner.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/distribution/dashboard');
    
    // Navigate to revisions - Using Link from dashboard
    await page.click('a[href="/distribution/revisions"]');
    await page.waitForURL('/distribution/revisions');
    
    // Deny a revision
    await page.locator('button[title="Deny"]').first().click();
    
    // Must provide reason
    await page.fill('textarea[placeholder*="why"]', 'Content does not meet quality standards');
    await page.click('button:has-text("Deny")');
    
    await expect(page.locator('text=Update request denied')).toBeVisible({ timeout: 10000 });
  });

  test('distribution partner pushes release back to draft', async ({ page }) => {
    // Login as distribution partner
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.distributionPartner.email);
    await page.fill('#password', TEST_USERS.distributionPartner.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/distribution/dashboard');
    
    // Navigate to revisions
    await page.click('a[href="/distribution/revisions"]');
    await page.waitForURL('/distribution/revisions');
    
    // Push to draft
    await page.locator('button[title="Push to Draft"]').first().click();
    
    // Must explain why
    await page.fill('textarea[placeholder*="needs to be fixed"]', 'Artwork quality is too low, please re-upload higher resolution');
    await page.click('button:has-text("Push to Draft")');
    
    await expect(page.locator('text=Pushed to draft')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('File Upload Tests', () => {
  test('artist uploads artwork', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.artist.email);
    await page.fill('#password', TEST_USERS.artist.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Navigate directly to releases page
    await page.goto('/artist/releases');
    await page.waitForURL('/artist/releases', { timeout: 10000 });
    
    await page.click('button:has-text("Create New Release")');
    
    // Upload artwork
    const artworkPath = 'tests/fixtures/test-artwork.jpg';
    await page.setInputFiles('input[type="file"][accept*="image"]', artworkPath);
    
    // Should see preview
    await expect(page.locator('img[alt*="artwork"]')).toBeVisible({ timeout: 10000 });
  });

  test('artist uploads audio file', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.artist.email);
    await page.fill('#password', TEST_USERS.artist.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Navigate directly to releases page
    await page.goto('/artist/releases');
    await page.waitForURL('/artist/releases', { timeout: 10000 });
    
    await page.click('button:has-text("Create New Release")');
    
    // Upload audio
    const audioPath = 'tests/fixtures/test-audio.mp3';
    await page.setInputFiles('input[type="file"][accept*="audio"]', audioPath);
    
    // Should see audio player or upload confirmation
    await expect(page.locator('text=Audio uploaded')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Content Library Tests', () => {
  test('admin can view and manage uploaded assets', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USERS.companyAdmin.email);
    await page.fill('#password', TEST_USERS.companyAdmin.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // Navigate to content library - Need to go directly since no nav link exists
    await page.goto('/admin/content-library');
    await page.waitForURL('/admin/content-library');
    
    // Should see assets listed
    await expect(page.locator('text=Total Assets')).toBeVisible();
    await expect(page.locator('text=Artwork Files')).toBeVisible();
    await expect(page.locator('text=Audio Files')).toBeVisible();
    
    // Test filtering
    await page.selectOption('select[value="all"]', 'artwork');
    await expect(page.locator('text=Artwork Only')).toBeVisible();
    
    // Test search
    await page.fill('input[placeholder*="Search"]', 'Test');
    // Results should filter
  });
});
