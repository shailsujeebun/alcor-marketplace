# Marketplace Clone (АЛЬКОР)

A B2B equipment marketplace platform with a NestJS backend API and Next.js frontend. This project features a multi-marketplace system supporting Agriculture, Commercial Vehicles, Industrial Machinery, and Cars.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Docker & Docker Compose

### Installation

1. **Start infrastructure services**
   ```bash
   docker compose up -d
   ```

2. **Setup backend**
   ```bash
   cd api
   pnpm install
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   pnpm start:dev
   ```

3. **Setup frontend**
   ```bash
   cd web
   pnpm install
   pnpm dev
   ```

The backend runs on `http://localhost:3000` and the frontend on `http://localhost:3001`.

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive project documentation including tech stack, architecture, API endpoints, and development patterns
- **[AD.MD](./AD.MD)** - Ad placement & listing wizard documentation
- **[ADMIN.MD](./ADMIN.MD)** - Admin features documentation (marketplaces, categories, form templates)
- **[security-hardening.md](./security-hardening.md)** - Prioritized security hardening backlog with owners, acceptance criteria, and verification tests
- **[security-signoff-evidence.md](./security-signoff-evidence.md)** - Production security sign-off evidence matrix and verification runbook
- **[DB_ER_DIAGRAM.MD](./DB_ER_DIAGRAM.MD)** - Database entity relationship diagram
- **[plan.md](./plan.md)** - Marketplace ad-posting system implementation plan
- **[task.md](./task.md)** - Development task checklist

## 🛠️ Tech Stack

### Backend
- NestJS 11
- PostgreSQL 16 with Prisma 7 ORM
- Redis (caching)
- OpenSearch (search)
- MinIO (file storage)
- JWT authentication

### Frontend
- Next.js 16 (App Router)
- Tailwind CSS v4
- TanStack React Query v5
- Zustand (auth state)
- AOS animations

## 📁 Project Structure

```
marketplace-clone/
├── api/          # NestJS backend
├── web/          # Next.js frontend
└── docker-compose.yml
```

## 🔑 Key Features

- Multi-marketplace system (Agriculture, Commercial, Industrial, Cars)
- Dynamic form templates per category
- Guest ad placement with draft persistence
- Multi-step listing wizard
- Admin panel for marketplace/category/template management
- Company profiles with reviews
- Messaging system
- Support tickets
- Subscription plans

## 📝 License

This project is proprietary software.

## 👥 Contact

For more information, please refer to the detailed documentation files listed above.

## Updates (2026-02-16)

- Admin templates were expanded into full lifecycle management:
  - New admin template list page at `/admin/templates`.
  - Backend endpoints for listing, deleting, and toggling template status.
  - Versioned template creation per category with automatic active-template switching.
- Form Builder (`/admin/templates/builder`) now supports loading by query params (`templateId`, `categoryId`) and has separate actions for "Save Changes" and "Save as New Version".
- Listing wizard improvements shipped:
  - Fixed client directive issue in description step.
  - Added parent/subcategory cascading selection and better dynamic-form loading states.
  - Extended wizard form state with listing core fields (brand, condition, year, price, listing type, euro class, hours, external URL).
  - Wrapped wizard usage of `useSearchParams` with `Suspense` for Next.js 16 compatibility.
- Project-wide language toggle was added:
  - Global `EN/UA` switch button in the app shell.
  - `/api/translate` endpoint for batch translation requests.
  - Full-page runtime translation for text nodes and common UI attributes.
- Lint cleanup was applied and web lint/build are passing after rule and code adjustments.

### Translation Architecture Refactor (2026-02-16, `feature-translation`)

- Replaced runtime DOM auto-translation with dictionary-based i18n (`web/src/i18n/*` + `t(key)` helper).
- Translation toggle now only switches `locale` (`uk`/`en`) in memory:
  - No language persistence.
  - No automatic translation on initial load.
  - No MutationObserver/text-node rewriting.
- Kept `/api/translate` as a compatibility fallback for still-hardcoded pages:
  - Translation requests run only after the user clicks `EN`.
  - Provider runs controlled one/two-pass translation per route (no observer loop).
  - Default load remains fast in `uk`.
- Migrated shared UI to key-based translations:
  - Top bar, navbar, mobile menu, footer.
  - Admin sidebar labels.
  - Cabinet sidebar labels.
  - Listing wizard step labels and tip text.
- Validation status:
  - `web`: lint/build passing after refactor.

### Additional Hardening (2026-02-16)

- Auth i18n migration:
  - Migrated auth UI to key-based translations (`auth.tabs.*`, `auth.login.*`, `auth.register.*`, `auth.forgot.*`, `auth.reset.*`, `auth.verify.*`).
  - Added matching keys in both `web/src/i18n/messages/en.ts` and `web/src/i18n/messages/uk.ts`.
- Translation API hardening (`web/src/app/api/translate/route.ts`):
  - Added request validation and payload limits.
  - Added per-client rate limiting.
  - Added timeout handling for upstream translation calls.
  - Added cache TTL and simple LRU-style eviction.
  - Added in-flight request de-duplication for repeated texts.
  - Added privacy controls:
    - `TRANSLATION_EXTERNAL_ENABLED` to fully disable external translation by environment.
    - `TRANSLATION_ALLOW_PII` (default `false`) to block translation of likely sensitive text (email/phone/URL patterns).
  - Added policy document: `docs/translation-privacy-policy.md`.
- i18n guard:
  - Added `web/scripts/check-hardcoded-i18n.mjs`.
  - Added `npm run i18n:guard` in `web/package.json`.
  - Guard currently enforces no hardcoded Cyrillic text in `web/src/components/auth`.
- Seed system overhaul:
  - Added deterministic full-schema seeding entrypoint: `api/prisma/seed-all.ts`.
  - Modularized seed logic under `api/prisma/seed-all/` (`cleanup`, `core`, `companies-listings`, `engagement`).
  - Added post-seed verification script: `api/prisma/seed-verify.ts`.
  - Added API scripts: `seed:all`, `seed:verify`; default Prisma seed now points to `seed-all.ts`.
- CI quality gates:
  - Added GitHub Actions workflow: `.github/workflows/ci.yml`.
  - Web gates: `i18n:guard`, `lint`, `build`.
  - API gates: `build`, `test`, `test:e2e`.
  - Security test suite gate: `test:security` (auth abuse, listing authZ, upload abuse/rate-limit checks).
  - Seed smoke job: `prisma migrate deploy`, `seed:all`, `seed:verify`.
  - Security gates:
    - `api-security-audit` (`pnpm audit --prod --audit-level high`).
    - `secret-scan` (Gitleaks with `.gitleaksignore` baseline).
    - `sast-scan` (Semgrep `p/security-audit`, `ERROR` severity, optional baseline ref/commit).
