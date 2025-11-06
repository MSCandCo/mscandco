#!/usr/bin/env python3
"""
Capture remaining screenshots (Label Admin, SuperAdmin, Admin)
"""

import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3013"
OUTPUT_DIR = os.path.expanduser("~/Downloads/MSC-Platform-Screenshots-Fixed")

# Pages to capture
PAGES = {
    "labeladmin": {
        "email": "labeladmin@mscandco.com",
        "password": "TestPass123!",
        "pages": [
            {"path": "/labeladmin/dashboard", "name": "30-labeladmin-dashboard", "wait_for": "text=Dashboard"},
            {"path": "/labeladmin/artists", "name": "31-labeladmin-artists", "wait_for": "text=Artists"},
            {"path": "/labeladmin/releases", "name": "32-labeladmin-releases", "wait_for": "text=Releases"},
            {"path": "/labeladmin/analytics", "name": "33-labeladmin-analytics", "wait_for": "text=Analytics"},
            {"path": "/labeladmin/earnings", "name": "34-labeladmin-earnings", "wait_for": "text=Earnings"},
            {"path": "/labeladmin/roster", "name": "35-labeladmin-roster", "wait_for": "text=Roster"},
            {"path": "/labeladmin/billing", "name": "36-labeladmin-billing", "wait_for": "text=Billing"},
            {"path": "/labeladmin/settings", "name": "37-labeladmin-settings", "wait_for": "text=Settings"},
        ],
        "folder": "03-LabelAdmin"
    },
    "superadmin": {
        "email": "superadmin@mscandco.com",
        "password": "TestPass123!",
        "pages": [
            {"path": "/superadmin/dashboard", "name": "40-superadmin-dashboard", "wait_for": "text=Dashboard"},
            {"path": "/superadmin/permissionsroles", "name": "41-superadmin-permissions", "wait_for": "text=Permissions"},
            {"path": "/superadmin/ghostlogin", "name": "42-superadmin-ghostlogin", "wait_for": "text=Ghost"},
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
        "folder": "04-SuperAdmin"  # SuperAdmin also includes Admin pages
    },
}

def login_and_capture(p, user_type, user_data):
    """Login and capture all pages for a user type"""
    print(f"\n{'='*70}")
    print(f"CAPTURING {user_type.upper()} PAGES")
    print(f"{'='*70}")

    results = {"success": 0, "failed": 0}

    # Launch new browser for this user
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()
    page.set_default_timeout(60000)

    try:
        # Navigate to login page
        print(f"  Logging in as {user_data['email']}...")
        page.goto(f"{BASE_URL}/login", wait_until="load", timeout=90000)
        time.sleep(5)

        # Dismiss cookie consent if present
        try:
            accept_button = page.locator('button:has-text("Accept All")')
            if accept_button.count() > 0:
                accept_button.click(timeout=3000)
                time.sleep(2)
        except:
            pass

        # Fill login form
        page.wait_for_selector("#email", timeout=30000, state="visible")
        page.fill("#email", user_data['email'])
        time.sleep(1)
        page.fill("#password", user_data['password'])
        time.sleep(1)

        # Submit and wait for navigation
        with page.expect_navigation(timeout=30000):
            page.click('button[type="submit"]')

        time.sleep(5)

        # Check if logged in
        if "/login" in page.url:
            print(f"  ✗ Login failed")
            browser.close()
            return results

        print(f"  ✓ Logged in successfully")

        # Determine output folder
        if user_type == "superadmin":
            # SuperAdmin screenshots go to both SuperAdmin and Admin folders
            output_folders = ["04-SuperAdmin", "05-Admin"]
        else:
            output_folders = [user_data['folder']]

        # Capture each page
        for page_info in user_data['pages']:
            path = page_info["path"]
            name = page_info["name"]
            wait_for = page_info.get("wait_for", "body")
            url = BASE_URL + path

            # Determine which folder to save to based on page path
            if path.startswith("/admin/"):
                save_folder = "05-Admin"
            else:
                save_folder = output_folders[0]

            filename = f"{OUTPUT_DIR}/{save_folder}/{name}.png"

            try:
                print(f"  → {name}: {path}...", end=" ", flush=True)

                page.goto(url, wait_until="networkidle", timeout=60000)

                try:
                    page.wait_for_selector(wait_for, timeout=10000, state="visible")
                except:
                    time.sleep(2)

                time.sleep(3)

                # Check for loading indicators
                loading_selectors = ['text="Loading"', '[class*="loading"]', '[class*="spinner"]', 'text="Pending"']
                for selector in loading_selectors:
                    if page.locator(selector).count() > 0:
                        time.sleep(5)
                        break

                page.screenshot(path=filename, full_page=True)
                results["success"] += 1
                print("✓")

            except Exception as e:
                print(f"✗ ({str(e)[:50]})")
                results["failed"] += 1

    except Exception as e:
        print(f"  Error: {e}")
    finally:
        browser.close()

    return results

def main():
    """Main capture function"""
    print("="*70)
    print("MSC & CO PLATFORM - REMAINING SCREENSHOTS")
    print("="*70)

    total_results = {"success": 0, "failed": 0}

    with sync_playwright() as p:
        for user_type, user_data in PAGES.items():
            results = login_and_capture(p, user_type, user_data)
            total_results["success"] += results["success"]
            total_results["failed"] += results["failed"]

    # Print summary
    print("\n" + "="*70)
    print("📊 CAPTURE SUMMARY")
    print("="*70)
    print(f"✓ Successful: {total_results['success']}")
    print(f"✗ Failed: {total_results['failed']}")
    print(f"\nScreenshots saved to: {OUTPUT_DIR}/")
    print("="*70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Capture interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
