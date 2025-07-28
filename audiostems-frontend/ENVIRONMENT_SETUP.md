# Environment Setup - MSC & Co Platform

## Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Auth0 account (for authentication)

## 1. Clone the Repository
```bash
git clone <repo-url>
cd audiostems-frontend
```

## 2. Set Environment Variables
Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://your-auth0-domain/api/v2/
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Configure Auth0
- Create a new Application (Single Page App) in Auth0 dashboard
- Set Allowed Callback URLs: `http://localhost:3000`, `http://localhost:3000/dashboard`
- Set Allowed Logout URLs: `http://localhost:3000`, `http://localhost:3000/login`
- Set Allowed Web Origins: `http://localhost:3000`
- Create test users and set user metadata for `role` and `brand`

## 4. Start Docker Services
```bash
docker-compose up -d
```
- This will start Strapi, Postgres, Redis, and Nginx

## 5. Start the Frontend
```bash
npm install
npm run dev
```
- App will be available at [http://localhost:3000](http://localhost:3000) (or next available port)

## 6. Test Authentication
- Visit `/login` and sign in with Auth0
- Test dashboard, admin, and artist flows

---

**Project is ready for local development and further enhancements by Claude Code.** 