# Technical Stack - MSC & Co Platform

## Frontend
- **Framework:** Next.js 15.3.5
- **Language:** JavaScript (ES2022+), React 18+
- **Styling:** Tailwind CSS, Flowbite
- **UI Components:** Flowbite React, Lucide Icons
- **State/Data:** SWR, Axios
- **Authentication:** @auth0/auth0-react

## Backend
- **CMS/API:** Strapi (Node.js, REST API)
- **Database:** PostgreSQL
- **Cache:** Redis
- **File Storage:** Local (Docker volume), Nginx static

## Infrastructure
- **Containerization:** Docker, Docker Compose
- **Reverse Proxy:** Nginx
- **Environment Management:** .env.local, Docker Compose env

## Authentication
- **Provider:** Auth0 (Universal Login, user/role/brand metadata)
- **SDK:** @auth0/auth0-react

## Other Major Dependencies
- **Charting:** chart.js, react-chartjs-2
- **Form Validation:** Formik, Yup
- **Date/Time:** moment.js
- **PDF/Excel Export:** jsPDF, xlsx (if used)

---

**All authentication is now handled by Auth0. No NextAuth or Strapi auth remains.** 