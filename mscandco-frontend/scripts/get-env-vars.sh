#!/bin/bash
# Script to help identify required environment variables from Vercel

echo "🔍 Fetching environment variables from Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

echo "📋 Environment variables in Production:"
vercel env ls --environment=production 2>&1 | grep -v "Retrieving\|Environment Variables" || echo "No variables found or error occurred"

echo ""
echo "📋 Environment variables in Preview:"
vercel env ls --environment=preview 2>&1 | grep -v "Retrieving\|Environment Variables" || echo "No variables found or error occurred"

echo ""
echo "📋 Environment variables in Development:"
vercel env ls --environment=development 2>&1 | grep -v "Retrieving\|Environment Variables" || echo "No variables found or error occurred"

echo ""
echo "💡 If no variables are shown, they may be set in the Vercel Dashboard:"
echo "   https://vercel.com/mscandco/mscandco-frontend/settings/environment-variables"
echo ""
echo "📝 To manually add them to .env.local, use the format:"
echo "   VARIABLE_NAME=value"

