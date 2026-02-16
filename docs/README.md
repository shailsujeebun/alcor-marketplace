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
- Removed deprecated translation API route:
  - Deleted `web/src/app/api/translate/route.ts`.
- Migrated shared UI to key-based translations:
  - Top bar, navbar, mobile menu, footer.
  - Admin sidebar labels.
  - Cabinet sidebar labels.
  - Listing wizard step labels and tip text.
- Validation status:
  - `web`: lint/build passing after refactor.
