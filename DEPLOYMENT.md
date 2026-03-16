# Deployment Guide

## Stack Overview

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma |
| File storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| Auth | Custom JWT |
| Hosting | Vercel (production) / Docker (self-hosted) |

---

## 1. Environment Variables

Copy `.env.example` → `.env.local` for local development. **Never commit real secrets.**

For production, set these in your Vercel project dashboard (**Settings → Environment Variables**):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32-char random string — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NEXT_PUBLIC_API_URL` | Set to `/api` |
| `NEXT_PUBLIC_FRONTEND_URL` | Your production URL, e.g. `https://yourapp.vercel.app` |
| `MAIL_HOST` | SMTP server host |
| `MAIL_PORT` | SMTP port (587 for TLS) |
| `MAIL_USER` | SMTP username |
| `MAIL_PASSWORD` | SMTP password |
| `MAIL_FROM` | Sender address |
| `ADMIN_EMAIL` | Admin inbox for contact form |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## 2. Vercel Deployment (Recommended)

### Option A — Automatic (Git integration)
1. Push the repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Set all environment variables listed above
4. Vercel will auto-deploy on every push to `main`

> The `vercel.json` already configures the build command to run `prisma generate` before `next build`.

### Option B — GitHub Actions (automated via CI/CD)
1. Link the repo to Vercel once via the dashboard or CLI: `npx vercel link`
2. Get your IDs from `.vercel/project.json` (do **not** commit this file)
3. Add these **GitHub repository secrets** (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` — Vercel account token ([vercel.com/account/tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID` — from `.vercel/project.json`
   - `VERCEL_PROJECT_ID` — from `.vercel/project.json`

The `.github/workflows/deploy.yml` will then automatically deploy on every push to `main`.

---

## 3. Docker (Self-Hosted)

### Prerequisites
- Docker & Docker Compose installed
- A PostgreSQL database (or use the bundled `postgres` service)

### Quick Start

```bash
# 1. Clone and enter directory
git clone <repo-url>
cd next_canadaimigration

# 2. Copy and fill in env values in docker-compose.yml
#    Edit the `environment:` block under the `app` service

# 3. Build and start
docker compose up --build -d

# 4. Run database migrations (first time only)
docker compose exec app npx prisma migrate deploy

# 5. App is available at http://localhost:3000
```

### Useful Docker Commands

```bash
# View logs
docker compose logs -f app

# Stop everything
docker compose down

# Stop and remove volumes (wipes the database)
docker compose down -v

# Rebuild after code changes
docker compose up --build -d
```

---

## 4. CI Pipeline (GitHub Actions)

The `.github/workflows/ci.yml` runs automatically on every push to `main`/`develop` and on all pull requests:

1. ✅ Install dependencies (`npm ci`)
2. ✅ Generate Prisma client
3. ✅ Lint (`npm run lint`)
4. ✅ Type-check (`npx tsc --noEmit`)
5. ✅ Build (`npm run build`)

No secrets are required for CI — dummy env values are used so the build succeeds without a live database.

---

## 5. Database Migrations

Migrations are **not** run automatically on deploy.

- **Development**: `npm run prisma:migrate` (creates migration files)
- **Production / Docker**: `npx prisma migrate deploy` (applies existing migrations, safe for CI/CD)

Run migrations against production **before** deploying code that requires schema changes.
