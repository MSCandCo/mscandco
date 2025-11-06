#!/usr/bin/env python3
"""
Enhanced screenshot capture with proper waiting and error handling
"""

import os
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from datetime import datetime

BASE_URL = "http://localhost:3013"
OUTPUT_DIR = os.path.expanduser("~/Downloads/MSC-Platform-Screenshots-Fixed")

# Pages to capture with their wait strategies
PAGES = {
    "public": [
        {"path": "/", "name": "01-homepage", "wait_for": "h1"},
        {"path": "/about", "name": "02-about", "wait_for": "h1"},
        {"path": "/pricing", "name": "03-pricing", "wait_for": "h1"},
        {"path": "/support", "name": "04-support", "wait_for": "h1"},
        {"path": "/faq", "name": "05-faq", "wait_for": "h1"},
        {"path": "/find-my-song", "name": "06-find-my-song", "wait_for": "input"},
        {"path": "/login", "name": "07-login", "wait_for": "#email"},
        {"path": "/register", "name": "08-register", "wait_for": "#email"},
        {"path": "/developers", "name": "09-developers", "wait_for": "h1"},
        {"path": "/terms-of-use", "name": "10-terms", "wait_for": "h1"},
        {"path": "/privacy-policy", "name": "11-privacy", "wait_for": "h1"},
        {"path": "/cookie-policy", "name": "12-cookie", "wait_for": "h1"},
        {"path": "/dmca-policy", "name": "13-dmca", "wait_for": "h1"},
        {"path": "/refund-policy", "name": "14-refund", "wait_for": "h1"},
    ],
    "artist": [
        {"path": "/artist/dashboard", "name": "20-artist-dashboard", "wait_for": "text=Dashboard"},
        {"path": "/artist/releases", "name": "21-artist-releases", "wait_for": "text=Releases"},
        {"path": "/artist/analytics", "name": "22-artist-analytics", "wait_for": "text=Analytics"},
        {"path": "/artist/earnings", "name": "23-artist-earnings", "wait_for": "text=Earnings"},
        {"path": "/artist/profile", "name": "24-artist-profile", "wait_for": "text=Profile"},
        {"path": "/artist/billing", "name": "25-artist-billing", "wait_for": "text=Billing"},
        {"path": "/artist/settings", "name": "26-artist-settings", "wait_for": "text=Settings"},
        {"path": "/ai/chat", "name": "27-ai-chat", "wait_for": "textarea"},
    ],
    "labeladmin": [
        {"path": "/labeladmin/dashboard", "name": "30-labeladmin-dashboard", "wait_for": "text=Dashboard"},
        {"path": "/labeladmin/artists", "name": "31-labeladmin-artists", "wait_for": "text=Artists"},
        {"path": "/labeladmin/releases", "name": "32-labeladmin-releases", "wait_for": "text=Releases"},
        {"path": "/labeladmin/analytics", "name": "33-labeladmin-analytics", "wait_for": "text=Analytics"},
        {"path": "/labeladmin/earnings", "name": "34-labeladmin-earnings", "wait_for": "text=Earnings"},
        {"path": "/labeladmin/roster", "name": "35-labeladmin-roster", "wait_for": "text=Roster"},
        {"path": "/labeladmin/billing", "name": "36-labeladmin-billing", "wait_for": "text=Billing"},
        {"path": "/labeladmin/settings", "name": "37-labeladmin-settings", "wait_for": "text=Settings"},
    ],
    "superadmin": [
        {"path": "/superadmin/dashboard", "name": "40-superadmin-dashboard", "wait_for": "text=Dashboard"},
        {"path": "/superadmin/permissionsroles", "name": "41-superadmin-permissions", "wait_for": "text=Permissions"},
        {"path": "/superadmin/ghostlogin", "name": "42-superadmin-ghostlogin", "wait_for": "text=Ghost"},
    ],
    "admin": [
        {"path": "/admin/usermanagement", "name": "50-admin-usermanagement", "wait_for": "text=User"},
        {"path": "/admin/analyticsmanagement", "name": "51-admin-analyticsmanagement", "wait_for": "text=Analytics"},
        {"path": "/admin/earningsmanagement", "name": "52-admin-earningsmanagement", "wait_for": "text=Earnings"},
        {"path": "/admin/walletmanagement", "name": "53-admin-walletmanagement", "wait_for": "text=Wallet"},
        {"path": "/admin/platformanalytics", "name": "54-admin-platformanalytics", "wait_for": "text=Platform"},
        {"path": "/admin/moderation", "name": "55-admin-moderation", "wait_for": "text=Moderation"},
        {"path": "/admin/permissions", "name": "56-admin-permissions", "wait_for": "text=Permissions"},
        {"path": "/admin/masterroster", "name": "57-admin-masterroster", "wait_for": "text=Roster"},
        {"path": "/admin/requests", "name": "58-admin-requests", "wait_for": "text=Requests"},
        {"path": "/admin/assetlibrary", "name": "59-admin-assetlibrary", "wait_for": "text=Asset"},
        {"path": "/admin/systems", "name": "60-admin-systems", "wait_for": "text=Systems"},
        {"path": "/admin/systems/analytics", "name": "61-admin-systems-analytics", "wait_for": "text=Analytics"},
        {"path": "/admin/systems/security", "name": "62-admin-systems-security", "wait_for": "text=Security"},
        {"path": "/admin/systems/errors", "name": "63-admin-systems-errors", "wait_for": "text=Errors"},
        {"path": "/admin/systems/performance", "name": "64-admin-systems-performance", "wait_for": "text=Performance"},
        {"path": "/admin/systems/logs", "name": "65-admin-systems-logs", "wait_for": "text=Logs"},
        {"path": "/admin/systems/uptime", "name": "66-admin-systems-uptime", "wait_for": "text=Uptime"},
        {"path": "/admin/settings", "name": "67-admin-settings", "wait_for": "text=Settings"},
    ],
}

def login(page, email, password):
    """Login to the platform"""
    try:
        print(f"  Logging in as {email}...")
        page.goto(f"{BASE_URL}/login", wait_until="load", timeout=90000)

        # Wait extra time for page to fully load
        time.sleep(5)

        # Try to dismiss the cookie consent modal
        try:
            # Look for "Accept All" button specifically
            accept_button = page.locator('button:has-text("Accept All")')
            if accept_button.count() > 0:
                print("  (dismissing cookie consent)...", end=" ", flush=True)
                accept_button.click(timeout=3000)
                time.sleep(2)
        except:
            pass  # No cookie modal to dismiss

        # Wait for email field
        page.wait_for_selector("#email", timeout=30000, state="visible")
        page.fill("#email", email)
        time.sleep(1)

        page.fill("#password", password)
        time.sleep(1)

        # Click the submit button and wait for navigation
        print("(submitting form)...", end=" ", flush=True)

        # Wait for navigation to complete after clicking submit
        with page.expect_navigation(timeout=30000):
            page.click('button[type="submit"]')

        # Additional wait for page to fully load
        time.sleep(5)

        # Check if login was successful
        current_url = page.url
        print(f"(URL: {current_url})", end=" ", flush=True)
        if "/login" not in current_url:
            print(f"✓")
            return True
        else:
            print(f"✗")
            return False

    except Exception as e:
        print(f"  Login failed: {e}")
        return False

def capture_page(page, page_info, output_folder):
    """Capture a single page with proper waiting"""
    path = page_info["path"]
    name = page_info["name"]
    wait_for = page_info.get("wait_for", "body")
    url = BASE_URL + path
    filename = f"{output_folder}/{name}.png"

    try:
        print(f"  → {name}: {path}...", end=" ", flush=True)

        # Navigate and wait for networkidle
        page.goto(url, wait_until="networkidle", timeout=60000)

        # Wait for specific element
        try:
            page.wait_for_selector(wait_for, timeout=10000, state="visible")
        except:
            # If specific element not found, just wait a bit
            time.sleep(2)

        # Additional wait for any async content
        time.sleep(3)

        # Check for loading indicators and wait if present
        try:
            loading_selectors = [
                'text="Loading"',
                '[class*="loading"]',
                '[class*="spinner"]',
                'text="Pending"'
            ]
            for selector in loading_selectors:
                if page.locator(selector).count() > 0:
                    print("(waiting for loading to complete)...", end=" ", flush=True)
                    time.sleep(5)
                    break
        except:
            pass

        # Take screenshot
        page.screenshot(path=filename, full_page=True)
        print("✓")
        return True

    except PlaywrightTimeout:
        print(f"✗ (timeout)")
        return False
    except Exception as e:
        print(f"✗ ({str(e)[:50]})")
        return False

def main():
    """Main capture function"""
    # Create output directories
    for folder in ["01-Public", "02-Artist", "03-LabelAdmin", "04-SuperAdmin", "05-Admin"]:
        os.makedirs(f"{OUTPUT_DIR}/{folder}", exist_ok=True)

    results = {"success": 0, "failed": 0}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        page.set_default_timeout(60000)

        # Capture console messages for debugging
        page.on("console", lambda msg: print(f"  [CONSOLE {msg.type}]: {msg.text}"))

        print("=" * 70)
        print("MSC & CO PLATFORM SCREENSHOT CAPTURE (Enhanced)")
        print("=" * 70)

        # Capture public pages
        print("\n📸 CAPTURING PUBLIC PAGES...")
        for page_info in PAGES["public"]:
            if capture_page(page, page_info, f"{OUTPUT_DIR}/01-Public"):
                results["success"] += 1
            else:
                results["failed"] += 1

        # Login as Artist and capture artist pages
        print("\n🎨 CAPTURING ARTIST PAGES...")
        if login(page, "info@htay.co.uk", "TestPass123!"):
            for page_info in PAGES["artist"]:
                if capture_page(page, page_info, f"{OUTPUT_DIR}/02-Artist"):
                    results["success"] += 1
                else:
                    results["failed"] += 1

        # Logout and login as Label Admin
        print("\n🏢 CAPTURING LABEL ADMIN PAGES...")
        page.goto(f"{BASE_URL}/logout")
        time.sleep(3)
        if login(page, "labeladmin@mscandco.com", "TestPass123!"):
            for page_info in PAGES["labeladmin"]:
                if capture_page(page, page_info, f"{OUTPUT_DIR}/03-LabelAdmin"):
                    results["success"] += 1
                else:
                    results["failed"] += 1

        # Logout and login as SuperAdmin
        print("\n🔑 CAPTURING SUPERADMIN & ADMIN PAGES...")
        page.goto(f"{BASE_URL}/logout")
        time.sleep(3)
        if login(page, "superadmin@mscandco.com", "TestPass123!"):
            # Capture SuperAdmin pages
            for page_info in PAGES["superadmin"]:
                if capture_page(page, page_info, f"{OUTPUT_DIR}/04-SuperAdmin"):
                    results["success"] += 1
                else:
                    results["failed"] += 1

            # Capture Admin pages (SuperAdmin has access)
            for page_info in PAGES["admin"]:
                if capture_page(page, page_info, f"{OUTPUT_DIR}/05-Admin"):
                    results["success"] += 1
                else:
                    results["failed"] += 1

        browser.close()

    # Print summary
    print("\n" + "=" * 70)
    print("📊 CAPTURE SUMMARY")
    print("=" * 70)
    print(f"✓ Successful: {results['success']}")
    print(f"✗ Failed: {results['failed']}")
    print(f"\nScreenshots saved to: {OUTPUT_DIR}/")
    print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Capture interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
