#!/bin/bash
# Monitor progress of permission tests after cache fix

echo "🔍 Checking cache fix test progress..."
echo ""

LOG_FILE="permission-test-after-cache-fix.log"

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Log file not found: $LOG_FILE"
  exit 1
fi

# Count results
PASSED=$(grep "✅ PASSED:" "$LOG_FILE" 2>/dev/null | wc -l | tr -d ' ')
FAILED=$(grep "❌ FAILED:" "$LOG_FILE" 2>/dev/null | wc -l | tr -d ' ')
SKIPPED=$(grep "⚠️  SKIPPED:" "$LOG_FILE" 2>/dev/null | wc -l | tr -d ' ')
TOTAL=$((PASSED + FAILED + SKIPPED))

echo "📊 Current Results (After Cache Fix):"
echo "  ✅ Passed:  $PASSED"
echo "  ❌ Failed:  $FAILED"
echo "  ⚠️  Skipped: $SKIPPED"
echo "  📝 Total:   $TOTAL / 66"

# Calculate improvement if both logs exist
OLD_LOG="permission-test-final.log"
if [ -f "$OLD_LOG" ]; then
  OLD_PASSED=$(grep "✅ PASSED:" "$OLD_LOG" 2>/dev/null | wc -l | tr -d ' ')
  OLD_FAILED=$(grep "❌ FAILED:" "$OLD_LOG" 2>/dev/null | wc -l | tr -d ' ')

  IMPROVEMENT=$((PASSED - OLD_PASSED))
  FIXED_FAILURES=$((OLD_FAILED - FAILED))

  echo ""
  echo "📈 Improvement:"
  echo "  New Passes: +$IMPROVEMENT"
  echo "  Fixed Failures: $FIXED_FAILURES"
fi

echo ""
echo "🧪 Last test activity:"
tail -10 "$LOG_FILE"
echo ""

# Check if complete
if grep -q "Testing complete!" "$LOG_FILE" 2>/dev/null; then
    echo "✅ Tests are COMPLETE!"
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo "🎉 ALL TESTS PASSED! Cache fix was successful!"
    else
        echo "⚠️  Some tests still failing. Review log for details."
    fi

    echo ""
    echo "View full report:"
    echo "  cat PERMISSION_TOGGLE_TEST_REPORT.md"
else
    echo "⏳ Tests are still running..."
    echo ""
    echo "To monitor in real-time:"
    echo "  tail -f $LOG_FILE"
fi
