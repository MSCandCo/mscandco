#!/bin/bash

echo "🎵 AudioStems Development Status"
echo "================================"

# Check if services are running
echo ""
echo "📊 Service Status:"

# Check Backend (Strapi)
if curl -s http://localhost:1337/admin > /dev/null 2>&1; then
    echo "✅ Backend (Strapi): http://localhost:1337/admin"
else
    echo "❌ Backend (Strapi): Not running"
fi

# Check Frontend (Next.js)
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend (Next.js): http://localhost:3000"
else
    echo "❌ Frontend (Next.js): Not running"
fi

# Check AI Service
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ AI Service: http://localhost:8000"
else
    echo "🔄 AI Service: Not running (optional)"
fi

# Check Audio Processing
if curl -s http://localhost:8001 > /dev/null 2>&1; then
    echo "✅ Audio Processing: http://localhost:8001"
else
    echo "🔄 Audio Processing: Not running (optional)"
fi

echo ""
echo "🔧 Quick Commands:"
echo "  npm run dev          # Start both services"
echo "  npm run dev:backend  # Start backend only"
echo "  npm run dev:frontend # Start frontend only"
echo "  npm run clean        # Clean all node_modules"
echo "  npm run setup        # Install all dependencies"

echo ""
echo "📁 Project Structure:"
echo "  audiostems-backend/  - Strapi CMS"
echo "  audiostems-frontend/ - Next.js App"
echo "  audio-processing/    - Audio Service"
echo "  auditus-ai/         - AI Service"
echo "  infrastructure/     - AWS Terraform"

echo ""
echo "🌐 AWS Infrastructure:"
echo "  Database: Aurora PostgreSQL (deployed)"
echo "  Monitoring: CloudWatch (active)"
echo "  CDN: CloudFront (configured)" 