#!/bin/bash
# Quick script to check test progress

echo "🔍 Checking permission test progress..."
echo ""

# Count completed tests
PASSED=$(grep "✅ PASSED:" permission-test-final.log 2>/dev/null | wc -l | tr -d ' ')
FAILED=$(grep "❌ FAILED:" permission-test-final.log 2>/dev/null | wc -l | tr -d ' ')
SKIPPED=$(grep "⚠️  SKIPPED:" permission-test-final.log 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Current Results:"
echo "  ✅ Passed:  $PASSED"
echo "  ❌ Failed:  $FAILED"
echo "  ⚠️  Skipped: $SKIPPED"
echo "  📝 Total:   $((PASSED + FAILED + SKIPPED)) / 66"
echo ""

# Show last test
echo "🧪 Last test activity:"
tail -5 permission-test-final.log
echo ""

# Check if complete
if grep -q "Testing complete!" permission-test-final.log 2>/dev/null; then
    echo "✅ Tests are COMPLETE!"
    echo ""
    echo "View full report:"
    echo "  cat PERMISSION_TOGGLE_TEST_REPORT.md"
else
    echo "⏳ Tests are still running..."
    echo ""
    echo "To monitor in real-time:"
    echo "  tail -f permission-test-final.log"
fi
