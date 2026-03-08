# Phase 5 — Final Configuration, Runtime Improvements & Post-Merge Cleanup

> Unified Next.js project (`frontend/`) — complete reference for production readiness.

---

## 1. What Was Done in Phase 5

### Files Created / Modified

| File | Action | Description |
|------|--------|-------------|
| `app/api/clients/auth/verify-email/route.ts` | ✅ Created | `GET ?token=` — verifies a client's email address |
| `app/api/clients/auth/forgot-password/route.ts` | ✅ Created | `POST { email }` — sends password-reset email to client |
| `app/api/clients/auth/reset-password/route.ts` | ✅ Created | `POST { token, newPassword }` — resets client password |
| `middleware.ts` | ✅ Updated | Whitelisted the 3 new client auth public routes |
| `.env.production` | ✅ Fixed | Changed `NEXT_PUBLIC_API_URL` from full URL to `/api` |
| `.env.example` | ✅ Created | Template with all required env vars documented |
| `next.config.mjs` | ✅ Already OK | `serverExternalPackages`, Cloudinary `remotePatterns` |
| `package.json` | ✅ Already OK | `prisma:generate`, `prisma:migrate` scripts present |

### Why `NEXT_PUBLIC_API_URL` must be `/api`
The unified frontend serves its own API routes at `/api/*`. Using a full domain (e.g. `https://canada-imigration.onrender.com`) would:
- Break client-side axios calls (`axiosInstance` prefixes the base URL before the path)
- Require CORS configuration even for same-origin calls
- Fail in any environment where the domain changes

Use `/api` (relative) in **all** environments. Only `NEXT_PUBLIC_FRONTEND_URL` needs the full domain (for email links).

---

## 2. Complete API Surface

### Client Auth Routes (public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/clients` | Register new client |
| POST | `/api/clients/login` | Client login → JWT |
| GET | `/api/clients/auth/verify-email?token=` | Verify client email |
| POST | `/api/clients/auth/forgot-password` | Send reset email |
| POST | `/api/clients/auth/reset-password` | Reset password with token |

### Client Protected Routes (require client JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/clients/profile` | Get own profile |
| PUT | `/api/clients/profile` | Update own profile |
| GET | `/api/forms` | Get own form list |
| GET | `/api/forms/[clientId]` | Get forms by clientId |

### Admin Auth Routes (public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Admin login → JWT |
| POST | `/api/auth/register` | Register new admin |
| POST | `/api/auth/forgot-password` | Send admin reset email |
| POST | `/api/auth/reset-password` | Reset admin password |
| GET | `/api/auth/verify-email/[token]` | Verify admin email |
| GET | `/api/auth/profile` | Get own admin profile (protected) |
| PUT | `/api/auth/change-password` | Change admin password (protected) |

### Admin Management Routes (require admin JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/clients` | List all clients (paginated) |
| GET | `/api/clients/pending` | List pending clients |
| GET | `/api/clients/recent` | List recently validated clients |
| POST | `/api/clients/validate` | Approve / reject a form |
| GET/PUT/DELETE | `/api/clients/[id]` | Single client CRUD |
| GET | `/api/clients/[id]/forms/[type]` | Get form data by type |
| GET/POST | `/api/blogs` | List blogs / create blog |
| GET/PUT/DELETE | `/api/blogs/[id]` | Single blog |
| GET | `/api/partners` | List partner submissions |
| GET | `/api/partners/[id]` | Single partner submission |

### Public Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/blogs` | Public blog list |

---

## 3. Environment Variables Checklist

### Development (`.env.local`)
- [ ] `NEXT_PUBLIC_API_URL=/api`
- [ ] `NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001`
- [ ] `DATABASE_URL=postgresql://...` pointing to local PostgreSQL
- [ ] `JWT_SECRET=` at least 32 random characters
- [ ] `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD` — Mailtrap or real SMTP
- [ ] `MAIL_FROM=` sender display name + email
- [ ] `ADMIN_EMAIL=` recipient for contact form
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Production (Render dashboard)
- [ ] `NEXT_PUBLIC_API_URL=/api` ← **must be `/api`, not the full domain**
- [ ] `NEXT_PUBLIC_FRONTEND_URL=https://canada-imigration.onrender.com`
- [ ] `DATABASE_URL=` production PostgreSQL connection string
- [ ] `JWT_SECRET=` strong random secret (never reuse dev value)
- [ ] `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD` — production SMTP
- [ ] `MAIL_FROM=` sender address approved by your SMTP provider
- [ ] `ADMIN_EMAIL=` real recipient address
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## 4. Startup Checklist (local dev)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (if first run or after lockfile change)
npm install

# 3. Generate Prisma client (required after schema changes)
npm run prisma:generate

# 4. Run database migrations
npm run prisma:migrate

# 5. Start the dev server on port 3001
npm run dev
```

The app will be available at `http://localhost:3001`.
Admin panel: `http://localhost:3001/admin/login`

---

## 5. Database Checklist

- [ ] PostgreSQL is running and accessible via `DATABASE_URL`
- [ ] Migration history is clean: `npx prisma migrate status`
- [ ] At least one admin account exists (use `create-hamza-regular-admin.js` script in `backend/` for reference, or register via `/api/auth/register`)
- [ ] Admin must verify their email before logging in (`isEmailVerified = true` in DB)
- [ ] For local dev without email: manually set `isEmailVerified = true` in DB with Prisma Studio:
  ```bash
  npx prisma studio
  ```

---

## 6. Auth Flow Checklist

### Client Auth Flow
1. **Register** → POST `/api/clients` → email verification sent
2. **Verify email** → click link → GET `/api/clients/auth/verify-email?token=`
3. **Login** → POST `/api/clients/login` → JWT in `auth-storage` localStorage
4. **Forgot password** → POST `/api/clients/auth/forgot-password`
5. **Reset password** → POST `/api/clients/auth/reset-password`

### Admin Auth Flow
1. **Register** → POST `/api/auth/register` → email verification sent
2. **Verify email** → click link → GET `/api/auth/verify-email/[token]`
3. **Login** → POST `/api/auth/login` → JWT in `admin-auth-storage` localStorage + `admin_token` cookie
4. **Middleware** reads `admin_token` cookie on page requests → redirects to `/admin/login` if missing/expired
5. **Logout** → clears localStorage + deletes `admin_token` cookie

### JWT Storage Keys
| User Type | localStorage Key | Cookie |
|-----------|-----------------|--------|
| Client | `auth-storage` (`state.token`) | none |
| Admin | `admin-auth-storage` (`state.token`) + `admin_token` | `admin_token` (read by middleware) |

---

## 7. Upload / Email Checklist

### Cloudinary Upload
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are set
- [ ] `next.config.mjs` has `res.cloudinary.com` in `images.remotePatterns`
- [ ] `serverExternalPackages` includes `@prisma/client`, `bcrypt`, `nodemailer`

### Nodemailer / Email
- [ ] SMTP credentials are correct and the server is reachable
- [ ] `MAIL_FROM` matches an address allowed by your SMTP provider
- [ ] `NEXT_PUBLIC_FRONTEND_URL` is correct so verification/reset links work
- [ ] Email sends are non-blocking (`.catch(console.error)` pattern used)

---

## 8. Production Readiness Notes

### Prisma in Next.js — Key Considerations
- Prisma Client is instantiated as a **singleton** (`lib/prisma.ts`) using the global `globalThis` trick.
  This prevents connection pool exhaustion when Next.js hot-reloads in development.
- In **production** (`NODE_ENV=production`), `PrismaClient` is a fresh instance per cold start.
  Serverless/Edge functions should NOT use Prisma — use the Node.js runtime only (handled by `serverExternalPackages`).
- Always run `prisma generate` after any schema change before deploying.
- Never use Prisma in Edge Middleware (the middleware here only calls `jose` — ✅ safe).

### JWT Security
- The `JWT_SECRET` fallback (`'canada-immigration-secret-key-change-in-production'`) in `lib/server-auth.ts` is **only acceptable in dev**.
  Production deployments MUST override it via environment variable.
- JWTs expire in 7 days. There is no refresh token mechanism — users must re-login after expiry.
- The `type` claim (`'admin'` | `'client'`) is validated in every protected route handler. Admin routes check for `type === 'admin'`.

### Known Limitations
- No rate limiting on auth endpoints (consider adding `next-rate-limit` or Cloudflare in production)
- No CSRF protection on mutations (mitigated by `SameSite=Lax` cookie and Authorization header pattern)
- Email verification tokens never get garbage-collected if left unused — consider a cron to clean expired tokens

---

## 9. Archive Plan — `backend/` and `admin/`

The following projects are no longer needed after the merge into `frontend/`:

### `backend/` (NestJS)
- Replaced by Next.js API routes in `frontend/app/api/`
- **Safe to archive**: zip and move to `archive/backend-nestjs/`
- Do NOT delete until production deployment is confirmed working
- Keep `backend/prisma/schema.prisma` for reference (merged into `frontend/prisma/schema.prisma`)

### `admin/` (Standalone Next.js admin panel)
- Replaced by `/admin/*` pages in the unified `frontend/` project
- **Safe to archive**: zip and move to `archive/admin-standalone/`
- Do NOT delete until admin panel in `frontend/` is confirmed working end-to-end

### Suggested Archive Command (PowerShell)
```powershell
# Run from the project root
Compress-Archive -Path backend -DestinationPath archive/backend-nestjs.zip
Compress-Archive -Path admin -DestinationPath archive/admin-standalone.zip
```

### Files to Keep (never archive)
- `frontend/` — the unified production app
- `docker-compose.yml` — if you use Docker for local DB
- `render.yaml` — Render deployment config (update service to point to `frontend/`)
- `README.md` — update to reflect the new single-app structure

---

## 10. Pre-Acceptance Checklist

Run through this before approving the merge / first production deploy:

### Functional Tests
- [ ] Client can register → receives verification email
- [ ] Client can verify email → redirected to login
- [ ] Client can log in → dashboard loads with correct status fields
- [ ] Client can use forgot password → receives email → resets password → can log in again
- [ ] Admin can log in with username + password
- [ ] Admin dashboard loads client list, stats, pending clients tab
- [ ] Admin can approve/reject equivalence, residence, partner forms
- [ ] Admin can create, edit, delete blog posts
- [ ] File upload (form submission) works and stores URL in Cloudinary
- [ ] Contact form submission stores message and sends email to `ADMIN_EMAIL`

### Technical Checks
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Prisma schema and migrations are in sync (`npx prisma migrate status`)
- [ ] All env vars are set in the deployment environment
- [ ] `JWT_SECRET` is a strong random value (not the dev default)
- [ ] Cloudinary images load in production (check `remotePatterns` in `next.config.mjs`)
