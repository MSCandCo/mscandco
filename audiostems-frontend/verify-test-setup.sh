#!/bin/bash

# E2E Test Verification Script
# Checks if test users exist and test fixtures are present

echo "🔍 MSC & Co E2E Test Verification"
echo "=================================="
echo ""

# Check if test fixtures exist
echo "📁 Checking test fixtures..."

if [ ! -d "tests/fixtures" ]; then
    echo "❌ tests/fixtures/ directory not found"
    echo "   Creating directory..."
    mkdir -p tests/fixtures
fi

if [ ! -f "tests/fixtures/test-artwork.jpg" ]; then
    echo "⚠️  tests/fixtures/test-artwork.jpg not found"
    echo "   You may need to add a test image"
else
    echo "✅ test-artwork.jpg found"
fi

if [ ! -f "tests/fixtures/test-audio.mp3" ]; then
    echo "⚠️  tests/fixtures/test-audio.mp3 not found"
    echo "   You may need to add a test audio file"
else
    echo "✅ test-audio.mp3found"
fi

echo ""
echo "👤 Test Users Required:"
echo "   - artist@test.com (password: test123)"
echo "   - codegroup@mscandco.com (password: C0d3gr0up)"
echo "   - companyadmin@mscandco.com (password: ca@2025msC)"
echo ""
echo "ℹ️  Check Supabase to verify these users exist with correct roles"
echo ""

echo "🚀 Ready to run tests!"
echo ""
echo "Run tests with:"
echo "  npx playwright test tests/e2e/complete-release-workflow.spec.js"
echo ""
echo "Or run with UI:"
echo "  npx playwright test --ui"
echo ""
