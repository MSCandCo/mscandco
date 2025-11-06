#!/usr/bin/env python3
"""
Capture final missing screenshots
"""

import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3013"
OUTPUT_DIR = os.path.expanduser("~/Downloads/MSC-Platform-Screenshots-Fixed")

# Missing pages
MISSING_PAGES = [
    {
        "email": "labeladmin@mscandco.com",
        "password": "TestPass123!",
        "pages": [
            {"path": "/labeladmin/dashboard", "name": "30-labeladmin-dashboard", "folder": "03-LabelAdmin"},
            {"path": "/labeladmin/artists", "name": "31-labeladmin-artists", "folder": "03-LabelAdmin"},
            {"path": "/labeladmin/releases", "name": "32-labeladmin-releases", "folder": "03-LabelAdmin"},
            {"path": "/labeladmin/analytics", "name": "33-labeladmin-analytics", "folder": "03-LabelAdmin"},
            {"path": "/labeladmin/earnings", "name": "34-labeladmin-earnings", "folder": "03-LabelAdmin"},
            {"path": "/labeladmin/roster", "name": "35-labeladmin-roster", "folder": "03-LabelAdmin"},
            {"path": "/labeladmin/billing", "name": "36-labeladmin-billing", "folder": "03-LabelAdmin"},
            {"path": "/labeladmin/settings", "name": "37-labeladmin-settings", "folder": "03-LabelAdmin"},
        ]
    },
    {
        "email": "superadmin@mscandco.com",
        "password": "TestPass123!",
        "pages": [
            {"path": "/superadmin/dashboard", "name": "40-superadmin-dashboard", "folder": "04-SuperAdmin"},
            {"path": "/superadmin/permissionsroles", "name": "41-superadmin-permissions", "folder": "04-SuperAdmin"},
            {"path": "/superadmin/ghostlogin", "name": "42-superadmin-ghostlogin", "folder": "04-SuperAdmin"},
            {"path": "/admin/usermanagement", "name": "50-admin-usermanagement", "folder": "05-Admin"},
            {"path": "/admin/analyticsmanagement", "name": "51-admin-analyticsmanagement", "folder": "05-Admin"},
            {"path": "/admin/earningsmanagement", "name": "52-admin-earningsmanagement", "folder": "05-Admin"},
        ]
    }
]

def main():
    print("="*70)
    print("CAPTURING FINAL MISSING SCREENSHOTS")
    print("="*70)

    results = {"success": 0, "failed": 0}

    with sync_playwright() as p:
        for user_group in MISSING_PAGES:
            email = user_group["email"]
            password = user_group["password"]
            pages = user_group["pages"]

            print(f"\n🔐 Logging in as {email}...")

            # Launch fresh browser
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(viewport={'width': 1920, 'height': 1080})
            page = context.new_page()
            page.set_default_timeout(90000)  # Increased timeout

            try:
                # Login
                page.goto(f"{BASE_URL}/login", wait_until="domcontentloaded", timeout=120000)
                time.sleep(7)  # Longer wait

                # Dismiss cookie modal
                try:
                    if page.locator('button:has-text("Accept All")').count() > 0:
                        page.click('button:has-text("Accept All")', timeout=3000)
                        time.sleep(2)
                except:
                    pass

                # Fill and submit
                page.fill("#email", email)
                time.sleep(1)
                page.fill("#password", password)
                time.sleep(1)

                # Click and wait for navigation
                page.click('button[type="submit"]', timeout=30000)
                time.sleep(10)  # Longer wait for navigation

                if "/login" in page.url:
                    print(f"  ✗ Login failed for {email}")
                    browser.close()
                    continue

                print(f"  ✓ Logged in successfully")

                # Capture pages
                for page_info in pages:
                    path = page_info["path"]
                    name = page_info["name"]
                    folder = page_info["folder"]
                    url = BASE_URL + path
                    filename = f"{OUTPUT_DIR}/{folder}/{name}.png"

                    try:
                        print(f"  → {name}...", end=" ", flush=True)
                        page.goto(url, wait_until="domcontentloaded", timeout=90000)
                        time.sleep(5)  # Longer wait for content
                        page.screenshot(path=filename, full_page=True)
                        results["success"] += 1
                        print("✓")
                    except Exception as e:
                        print(f"✗ ({str(e)[:30]})")
                        results["failed"] += 1

            except Exception as e:
                print(f"  Error: {e}")
            finally:
                browser.close()
                time.sleep(2)

    print("\n" + "="*70)
    print("📊 FINAL SUMMARY")
    print("="*70)
    print(f"✓ Successful: {results['success']}")
    print(f"✗ Failed: {results['failed']}")
    print("="*70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")
