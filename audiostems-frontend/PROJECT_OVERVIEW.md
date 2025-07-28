# MSC & Co Music Distribution Platform - Project Overview

## Business Requirements & Goals
- Provide a multi-brand, multi-role music distribution and publishing platform for YHWH MSC and Audio MSC.
- Support artists, distribution partners, company admins, and super admins with tailored dashboards and workflows.
- Enable secure, modern authentication and role-based access control.
- Deliver a scalable, maintainable, and user-friendly experience for music professionals.

## High-Level Architecture
- **Frontend:** Next.js (React), Tailwind CSS, Flowbite, Auth0 for authentication
- **Backend:** Strapi CMS (for content management and API), PostgreSQL, Redis, Nginx (reverse proxy)
- **Containerization:** Docker Compose for local development and deployment
- **Authentication:** Auth0 (all user management, login, logout, roles, and brands)
- **APIs:** RESTful endpoints for all content types (songs, projects, artists, stems, etc.)

## Brands
- **YHWH MSC:** Gospel/Christian music brand
- **Audio MSC:** General music and licensing brand

## User Roles
- **Super Admin:** Full platform control, user/role management, analytics
- **Company Admin:** Brand-level management, content oversight
- **Artist:** Upload/manage music, view analytics, earnings, and projects
- **Distribution Partner Admin:** Manage partner content, analytics, and projects
- **Distributor:** Manage distribution, content, and reporting

## Main Features
- **Authentication:** Auth0 Universal Login, role/brand metadata, secure session management
- **Dashboard:** Role-based dashboards for all user types
- **Content Management:** Songs, stems, projects, lyrics, playlists, and more
- **Analytics:** Real-time and historical analytics for artists, admins, and partners
- **Export:** PDF/Excel/CSV export of reports and analytics
- **Collaboration:** Project management, team workflows, and communication
- **Earnings:** Artist earnings dashboard, payment history, and analytics
- **Admin Tools:** User management, content moderation, platform analytics
- **Responsive UI:** Modern, mobile-friendly design

## Authentication & User Flows
- **Auth0** is the only authentication provider (no Strapi/NextAuth)
- All user roles and brands are managed via Auth0 user metadata
- Login/logout handled via Auth0 React SDK
- User profile and role/brand displayed in dashboard and header

## Overall Structure
- `/pages` - Next.js pages (dashboard, login, admin, artist, distribution, etc.)
- `/components` - UI components, auth buttons, profile, navigation, etc.
- `/lib` - Auth0 config, utility functions
- `/docker` - Docker Compose, Nginx, Postgres, Redis setup
- `/public` - Static assets
- `/styles` - Tailwind and global CSS

---

**This project is now fully Auth0-based, with all legacy authentication code removed. Ready for Claude Code takeover.** 