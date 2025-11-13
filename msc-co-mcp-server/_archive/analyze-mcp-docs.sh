#!/bin/bash
echo "=== Analyzing MCP Server Documentation ==="
echo ""
for file in *.md; do
  echo "=== $file ==="
  head -3 "$file" 2>/dev/null | grep -E "^#"
  echo ""
done
