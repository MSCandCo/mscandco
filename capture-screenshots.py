#!/usr/bin/env python3
"""
Screenshot capture script for MSC & Co platform
Systematically captures screenshots of all pages
"""

import os
import time
from playwright.sync_api import sync_playwright
from datetime import datetime

# Base URL - change if needed
BASE_URL = "http://localhost:3013"

# All pages to capture
PAGES = [
    # Public pages
    {"path": "/", "name": "01-homepage"},
    {"path": "/about", "name": "02-about"},
    {"path": "/pricing", "name": "03-pricing"},
    {"path": "/support", "name": "04-support"},
    {"path": "/faq", "name": "05-faq"},
    {"path": "/find-my-song", "name": "06-find-my-song"},
    {"path": "/developers", "name": "07-developers"},
    {"path": "/developers/keys", "name": "08-developers-keys"},

    # Auth pages
    {"path": "/login", "name": "10-login"},
    {"path": "/register", "name": "11-register"},
    {"path": "/reset-password", "name": "12-reset-password"},

    # Legal pages
    {"path": "/terms-of-use", "name": "20-terms-of-use"},
    {"path": "/privacy-policy", "name": "21-privacy-policy"},
    {"path": "/cookie-policy", "name": "22-cookie-policy"},
    {"path": "/dmca-policy", "name": "23-dmca-policy"},
    {"path": "/refund-policy", "name": "24-refund-policy"},
    {"path": "/license-terms", "name": "25-license-terms"},

    # Artist pages (requires auth)
    {"path": "/artist/dashboard", "name": "30-artist-dashboard", "auth": True},
    {"path": "/artist/releases", "name": "31-artist-releases", "auth": True},
    {"path": "/artist/analytics", "name": "32-artist-analytics", "auth": True},
    {"path": "/artist/earnings", "name": "33-artist-earnings", "auth": True},
    {"path": "/artist/messages", "name": "34-artist-messages", "auth": True},
    {"path": "/artist/profile", "name": "35-artist-profile", "auth": True},
    {"path": "/artist/billing", "name": "36-artist-billing", "auth": True},
    {"path": "/artist/settings", "name": "37-artist-settings", "auth": True},
    {"path": "/artist/roster", "name": "38-artist-roster", "auth": True},
    {"path": "/artist/affiliate", "name": "39-artist-affiliate", "auth": True},

    # Label Admin pages (requires auth)
    {"path": "/labeladmin/dashboard", "name": "40-labeladmin-dashboard", "auth": True},
    {"path": "/labeladmin/artists", "name": "41-labeladmin-artists", "auth": True},
    {"path": "/labeladmin/releases", "name": "42-labeladmin-releases", "auth": True},
    {"path": "/labeladmin/analytics", "name": "43-labeladmin-analytics", "auth": True},
    {"path": "/labeladmin/earnings", "name": "44-labeladmin-earnings", "auth": True},
    {"path": "/labeladmin/messages", "name": "45-labeladmin-messages", "auth": True},
    {"path": "/labeladmin/roster", "name": "46-labeladmin-roster", "auth": True},
    {"path": "/labeladmin/billing", "name": "47-labeladmin-billing", "auth": True},
    {"path": "/labeladmin/settings", "name": "48-labeladmin-settings", "auth": True},
    {"path": "/labeladmin/profile", "name": "49-labeladmin-profile", "auth": True},

    # Distribution pages (requires auth)
    {"path": "/distribution/dashboard", "name": "50-distribution-dashboard", "auth": True},
    {"path": "/distribution/hub", "name": "51-distribution-hub", "auth": True},
    {"path": "/distribution/catalog", "name": "52-distribution-catalog", "auth": True},
    {"path": "/distribution/platforms", "name": "53-distribution-platforms", "auth": True},
    {"path": "/distribution/revenue", "name": "54-distribution-revenue", "auth": True},
    {"path": "/distribution/analytics", "name": "55-distribution-analytics", "auth": True},

    # Admin pages (requires auth)
    {"path": "/admin/usermanagement", "name": "60-admin-usermanagement", "auth": True},
    {"path": "/admin/analyticsmanagement", "name": "61-admin-analyticsmanagement", "auth": True},
    {"path": "/admin/earningsmanagement", "name": "62-admin-earningsmanagement", "auth": True},
    {"path": "/admin/walletmanagement", "name": "63-admin-walletmanagement", "auth": True},
    {"path": "/admin/masterroster", "name": "64-admin-masterroster", "auth": True},
    {"path": "/admin/platformanalytics", "name": "65-admin-platformanalytics", "auth": True},
    {"path": "/admin/splitconfiguration", "name": "66-admin-splitconfiguration", "auth": True},
    {"path": "/admin/assetlibrary", "name": "67-admin-assetlibrary", "auth": True},
    {"path": "/admin/requests", "name": "68-admin-requests", "auth": True},
    {"path": "/admin/messages", "name": "69-admin-messages", "auth": True},
    {"path": "/admin/permissions", "name": "70-admin-permissions", "auth": True},
    {"path": "/admin/permission-performance", "name": "71-admin-permission-performance", "auth": True},
    {"path": "/admin/moderation", "name": "72-admin-moderation", "auth": True},
    {"path": "/admin/profile", "name": "73-admin-profile", "auth": True},
    {"path": "/admin/settings", "name": "74-admin-settings", "auth": True},

    # Admin System pages
    {"path": "/admin/systems", "name": "75-admin-systems", "auth": True},
    {"path": "/admin/systems/analytics", "name": "76-admin-systems-analytics", "auth": True},
    {"path": "/admin/systems/backups", "name": "77-admin-systems-backups", "auth": True},
    {"path": "/admin/systems/docs", "name": "78-admin-systems-docs", "auth": True},
    {"path": "/admin/systems/email", "name": "79-admin-systems-email", "auth": True},
    {"path": "/admin/systems/errors", "name": "80-admin-systems-errors", "auth": True},
    {"path": "/admin/systems/logs", "name": "81-admin-systems-logs", "auth": True},
    {"path": "/admin/systems/performance", "name": "82-admin-systems-performance", "auth": True},
    {"path": "/admin/systems/ratelimit", "name": "83-admin-systems-ratelimit", "auth": True},
    {"path": "/admin/systems/security", "name": "84-admin-systems-security", "auth": True},
    {"path": "/admin/systems/uptime", "name": "85-admin-systems-uptime", "auth": True},

    # SuperAdmin pages (requires auth)
    {"path": "/superadmin/dashboard", "name": "90-superadmin-dashboard", "auth": True},
    {"path": "/superadmin/permissionsroles", "name": "91-superadmin-permissionsroles", "auth": True},
    {"path": "/superadmin/ghostlogin", "name": "92-superadmin-ghostlogin", "auth": True},
    {"path": "/superadmin/messages", "name": "93-superadmin-messages", "auth": True},

    # Other pages
    {"path": "/ai", "name": "95-ai", "auth": True},
    {"path": "/ai/chat", "name": "96-ai-chat", "auth": True},
    {"path": "/dmca", "name": "97-dmca"},
    {"path": "/notifications", "name": "98-notifications", "auth": True},
]

def capture_screenshots(output_dir="screenshots", headless=False, timeout=30000, base_url=None):
    """Capture screenshots of all pages"""

    if base_url is None:
        base_url = BASE_URL

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Track results
    results = {
        "success": [],
        "failed": [],
        "skipped": []
    }

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()
        page.set_default_timeout(timeout)

        print(f"Starting screenshot capture at {timestamp}")
        print(f"Base URL: {base_url}")
        print(f"Total pages: {len(PAGES)}")
        print("-" * 60)

        # First, capture public pages
        print("\n📸 Capturing public pages...")
        for page_info in PAGES:
            if page_info.get("auth"):
                continue

            path = page_info["path"]
            name = page_info["name"]
            url = base_url + path
            filename = f"{output_dir}/{name}-{timestamp}.png"

            try:
                print(f"  → {name}: {path}...", end=" ")
                page.goto(url, wait_until="networkidle", timeout=timeout)
                time.sleep(2)  # Wait for any animations
                page.screenshot(path=filename, full_page=True)
                results["success"].append({"name": name, "path": path})
                print("✓")
            except Exception as e:
                print(f"✗ ({str(e)[:50]})")
                results["failed"].append({"name": name, "path": path, "error": str(e)})

        # For authenticated pages, we'll need login credentials
        print("\n🔐 Authenticated pages require login.")
        print("   Please provide credentials to capture authenticated pages.")
        print("   Or run this script after manually logging in.")

        for page_info in PAGES:
            if not page_info.get("auth"):
                continue
            results["skipped"].append({"name": page_info["name"], "path": page_info["path"]})

        browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("📊 CAPTURE SUMMARY")
    print("=" * 60)
    print(f"✓ Successful: {len(results['success'])}")
    print(f"✗ Failed: {len(results['failed'])}")
    print(f"⊝ Skipped (auth required): {len(results['skipped'])}")
    print(f"\nScreenshots saved to: {output_dir}/")

    if results['failed']:
        print("\n❌ Failed captures:")
        for item in results['failed']:
            print(f"  - {item['name']}: {item['error'][:100]}")

    return results

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Capture screenshots of MSC & Co platform')
    parser.add_argument('--output', '-o', default='screenshots', help='Output directory')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    parser.add_argument('--base-url', default='http://localhost:3013', help='Base URL')
    parser.add_argument('--timeout', type=int, default=30000, help='Page load timeout in ms')

    args = parser.parse_args()

    try:
        capture_screenshots(
            output_dir=args.output,
            headless=args.headless,
            timeout=args.timeout,
            base_url=args.base_url
        )
    except KeyboardInterrupt:
        print("\n\n⚠️  Capture interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
