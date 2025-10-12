# Archived Files

This folder contains **obsolete and legacy code** that is no longer used in the active project.

## ⚠️ Important

**DO NOT USE FILES FROM THIS FOLDER**

These files are kept for historical reference only. The active project is located in:
```
/Users/htay/Documents/MSC & Co/mscandco-frontend/
```

## 📦 Contents

### **Obsolete Services**
- `mscandco-backend/` - Old Strapi CMS backend (replaced by Next.js API routes)
- `audio-processing/` - Legacy audio processing service
- `audiowaveform-server/` - Legacy waveform server
- `auditus-ai/` - Legacy AI service

### **Obsolete Infrastructure**
- `infrastructure/` - Old AWS Terraform configs (now using Vercel + Supabase)
- `infra/` - Legacy infrastructure files
- `nginx/` - Old Nginx configs (Vercel handles this)
- `monitoring/` - Old monitoring setup

### **Obsolete Configuration**
- `config/` - Old Strapi configuration
- `src/` - Old Strapi API files
- `database/` - Old migration files
- `pages/` - Old page files (root level)
- `public/` - Old public assets (root level)
- `scripts/` - Old scripts (root level)
- `types/` - Old TypeScript types (root level)

### **Docker Files**
- `docker-compose.*.yml` - Old Docker compose files
- `Dockerfile*` - Old Docker configurations
- `deploy.sh` - Old deployment script

### **Miscellaneous**
- `package.json` - Old root-level package file
- `jsconfig.json` - Old config
- `favicon.png` - Old favicon
- `MSC-Co-Platform-v3.0-Manual-Upload.zip` - Old platform archive

## 🎯 Current Architecture

The project now uses:
- **Frontend + Backend**: Single Next.js app
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **No Docker**: Serverless deployment

## 📅 Archived

October 12, 2025

---

**For current project documentation, see:** `/Users/htay/Documents/MSC & Co/README.md`

