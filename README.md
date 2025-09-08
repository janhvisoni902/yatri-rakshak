## YatriRakshak

Smart tourism safety and identity platform built with Next.js 15, TypeScript, Tailwind CSS 4, NextAuth, and MongoDB. It provides role-based dashboards for tourists, police, authorities, and the public; KYC onboarding; and digital ID management.

### Features
- **Authentication**: Credentials login with NextAuth (JWT session strategy)
- **Role-based access**: Middleware-gated dashboards for `tourist`, `police`, `tourism_dept`, `higher_authority`, `admin`, `public`, `local_citizen`
- **KYC & Digital ID**: API routes for KYC submission and digital ID create/update
- **Dashboards**: Dedicated pages for each role under `app/dashboard/*`
- **MongoDB**: Mongoose models for users, tourists, incidents, digital IDs, and geofences
- **UI/UX**: Tailwind CSS 4 + Radix UI + Lucide icons

### Tech Stack
- Next.js 15 (App Router) + React 19
- TypeScript
- NextAuth (credentials provider)
- MongoDB + Mongoose
- Tailwind CSS 4, Radix UI

---

## Quick Start

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm (or pnpm/yarn/bun)
- MongoDB Atlas connection string

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env.local` at the project root:
```bash
MONGODB_URI="your-mongodb-connection-uri"
NEXTAUTH_SECRET="development-secret-change-me"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

Notes:
- `MONGODB_URI` is required by `lib/mongodb.ts` and the app will throw if missing.
- Use a strong `NEXTAUTH_SECRET` in production.

### 3. Run the development server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Project Structure

```text
app/
  api/
    auth/...[nextauth]        NextAuth routes
    digital-id/{create,update} Digital ID APIs
    kyc/submit                 KYC submission API
    seed-users                 Utility to seed demo users
  auth/{signin,signup,error}  Auth pages
  dashboard/{page,police,tourist,authority,public}
  digital-id/                 Digital ID page
  kyc/                        KYC page
components/                   UI components and blocks
lib/                          auth and db helpers
models/                       Mongoose models
types/                        Shared TypeScript types
middleware.ts                 Role-based access control
scripts/seed-users.js         Seed script
```

---

## Environment Variables

Required in development and production:
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: NextAuth secret (use a secure random value in prod)
- `NEXTAUTH_URL`: Base URL of the app (e.g., `http://localhost:3000` in dev)
- `NODE_ENV`: `development` | `production`

See `DEPLOYMENT_SETUP.md` for production values and guidance.

---

## Available Scripts

Defined in `package.json`:

```bash
npm run dev     # Start dev server (Next.js with Turbopack)
npm run build   # Build for production (Turbopack)
npm run start   # Start production server
```

---

## Seeding Demo Users

There is an API route and a Node script to seed users.

- API: `GET /api/seed-users` (use cautiously; disable in production)
- Script: `node scripts/seed-users.js` (requires `.env.local` with `MONGODB_URI`)

Example run:
```bash
node scripts/seed-users.js
```

---

## Role-based Routing

Access control is enforced in `middleware.ts` using NextAuth JWT tokens.

- `/dashboard/police` → role `police` only
- `/dashboard/tourist` → role `tourist` only
- `/dashboard/authority` → roles `higher_authority`, `admin`, `tourism_dept`
- `/dashboard/public` → roles `public`, `local_citizen`
- `/kyc` → any authenticated user
- `/admin/*` → role `admin` only

If unauthorized, users are redirected to `/dashboard` or the sign-in page.

---

## API Endpoints (High-level)

- `POST /api/auth/[...nextauth]` – NextAuth routes (credentials)
- `POST /api/kyc/submit` – submit KYC data
- `POST /api/digital-id/create` – create new digital tourist ID
- `POST /api/digital-id/update` – update digital tourist ID
- `GET /api/seed-users` – seed demo users

Models live under `models/` and DB connection is managed by `lib/mongodb.ts`.

---

## Deployment

Follow the production guide in `DEPLOYMENT_SETUP.md`:
- Configure MongoDB Atlas (cluster, user, network access)
- Add environment variables in Vercel (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NODE_ENV`)
- Build and deploy with `npm run build` → `npm run start` (or Vercel)

---

## Troubleshooting

- Auth redirects to sign-in: verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set
- DB connection errors: check `MONGODB_URI` and network allowlist
- 403/redirect on dashboards: confirm the logged-in user’s `role` matches the route
- Type issues: ensure Node 18+ and dependencies are installed

---

## Contributing

1. Create a feature branch
2. Make changes with clear, readable code and types
3. Open a PR with a concise description

---

## License

Proprietary – internal use for SIH 2025 unless otherwise specified.
