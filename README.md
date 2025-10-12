# MSC & Co - Multi-Brand Music Distribution Platform

A comprehensive music distribution and publishing platform supporting multiple brands under the MSC & Co umbrella.

## 🚀 Project Architecture

### **Single Next.js Application**
- **Location:** `mscandco-frontend/`
- **Tech Stack:** Next.js 15.5.2 (Pages Router), React 18, Tailwind CSS
- **Port:** 3013 (local development)
- **Production:** https://mscandco.vercel.app
- **Staging:** https://staging.mscandco.com

### **Backend (Serverless)**
- **API Routes:** Next.js API routes in `pages/api/`
- **Database:** Supabase PostgreSQL (cloud-hosted)
- **Authentication:** Supabase Auth (JWT-based)
- **Storage:** Supabase Storage
- **No separate backend server** - fully serverless architecture

### **Deployment**
- **Platform:** Vercel (automatic deployment on git push)
- **Branch:** `mscandco`
- **Auto-deploy:** Push to main → Vercel automatically deploys

## 🎯 Key Features

### **Advanced RBAC System**
- **133 permissions** across platform features
- **12 roles:** Super Admin, Company Admin, Label Admin, Distribution Partner, Artist + 7 custom roles
- **Permission-based navigation** (not role-based)
- **Database-driven** permissions system (V2)
- **Wildcard support** for super admin (*:*:*)
- **Real-time role badges** with dynamic updates

### **Admin Features**
- ✅ Ghost Login - User impersonation for support
- ✅ Asset Library - Media file management
- ✅ Wallet Management - Transaction tracking
- ✅ Split Configuration - Revenue split management
- ✅ Earnings Management - Wallet transactions
- ✅ Distribution Hub - Release distribution
- ✅ Revenue Reporting - Financial analytics
- ✅ Master Roster - All platform contributors
- ✅ Request Management - Profile change approvals
- ✅ User Management - User & role administration
- ✅ Permission Management - RBAC configuration

### **Security**
- **3-Layer Security:**
  1. Page-level protection (usePermissions hook)
  2. API-level protection (requirePermission middleware)
  3. Database-level protection (Supabase RLS policies)
- **No middleware** (Next.js 15 compatibility)
- **JWT-based authentication**
- **Audit logging** for permission changes

## 🏃 Quick Start

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Supabase account

### **Development Setup**

```bash
# Navigate to project
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3013
```

## 📊 Database Schema

### **Core Tables**
- `user_profiles` - User profiles linked to Supabase Auth
- `permissions` - 133 granular permissions
- `roles` - 12 system and custom roles
- `role_permissions` - Join table for role-permission mapping
- `profile_change_requests` - Approval workflow for profile updates
- `admin_notifications` - Real-time admin notifications
- `permission_audit_log` - Audit trail for permission changes
- `wallet_transactions` - Financial transaction tracking
- `earnings_log` - Revenue and earnings records
- `media_files` - Asset library files

### **Permission Format**
```
resource:action:scope

Examples:
- *:*:* (super admin wildcard)
- users:read:all (read all users)
- releases:create:own (create own releases)
- analytics:read:all (read all analytics)
```

## 🧪 Test Accounts

| Email | Role | Password |
|-------|------|----------|
| superadmin@mscandco.com | Super Admin | (set via Supabase) |
| companyadmin@mscandco.com | Company Admin | (set via Supabase) |
| labeladmin@mscandco.com | Label Admin | (set via Supabase) |
| artist@mscandco.com | Artist | (set via Supabase) |
| requests@mscandco.com | Marketing Admin | (set via Supabase) |
| analytics@mscandco.com | Financial Admin | (set via Supabase) |

## 📁 Project Structure

```
/Users/htay/Documents/MSC & Co/
├── mscandco-frontend/          # Main Next.js application
│   ├── pages/                  # Next.js pages
│   │   ├── api/               # API routes (serverless backend)
│   │   ├── superadmin/        # Super admin pages
│   │   ├── admin/             # Admin pages
│   │   ├── artist/            # Artist portal pages
│   │   └── distribution/      # Distribution pages
│   ├── components/            # React components
│   │   ├── layouts/          # Layout components
│   │   ├── ui/               # UI components
│   │   └── shared/           # Shared components
│   ├── lib/                   # Utilities & configurations
│   │   ├── permissions.js    # Permission utilities
│   │   ├── usePermissions.js # Permission hooks
│   │   └── supabase.js       # Supabase client
│   ├── hooks/                 # Custom React hooks
│   ├── database/              # SQL migrations & schema
│   └── public/                # Static assets
├── docs/                      # Documentation (may be outdated)
├── _archived/                 # Legacy/obsolete code (for reference)
└── README.md                  # This file
```

## 🚀 Deployment

### **Production Deployment**
```bash
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"
git add -A
git commit -m "Your commit message"
git push origin mscandco

# Vercel automatically deploys
```

### **Environment Variables**
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- (See `.env.example` for full list)

## 🔧 Recent Updates

### **Last 24 Hours:**
- ✅ V2 Permission System - Database-driven RBAC
- ✅ Ghost Login feature for user impersonation
- ✅ Asset Library for media management
- ✅ Wallet Management & Split Configuration
- ✅ Earnings Management system
- ✅ Distribution Hub & Revenue Reporting
- ✅ Master Roster page
- ✅ Permission-based navigation
- ✅ Real-time role badge updates
- ✅ Profile change request workflow

### **Architecture Changes:**
- ❌ Removed Strapi backend (moved to `_archived/`)
- ❌ Removed AWS infrastructure (moved to `_archived/`)
- ✅ Migrated to Supabase + Vercel
- ✅ Serverless Next.js API routes
- ✅ Removed middleware (Next.js 15 compatibility)

## 📞 Support

For development issues or questions:
- **Frontend:** Browser developer tools
- **Database:** Supabase dashboard
- **Logs:** Vercel deployment logs

## 📝 Notes

- **Path contains spaces** - Always use quotes in bash commands:
  ```bash
  cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"
  ```
- **Archived folders** - Old code in `_archived/` for reference only
- **No separate backend** - Everything runs in Next.js
- **Supabase handles** - Database, Auth, Storage, RLS policies

## 📄 License

This project is proprietary software owned by MSC & Co.

---

**Active Project:** `mscandco-frontend/`  
**Production:** https://mscandco.vercel.app  
**Last Updated:** October 12, 2025
