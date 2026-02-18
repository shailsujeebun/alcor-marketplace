# АЛЬКОР — B2B Equipment Marketplace

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)

A full-stack B2B equipment marketplace platform supporting multiple industry verticals — Agriculture, Commercial Vehicles, Industrial Machinery, and Cars. Built with NestJS 11 + Next.js 16 (App Router) + PostgreSQL + Redis.

---

## Features

| Area | Details |
|------|---------|
| **Multi-Marketplace** | 4 industry verticals with independent category trees and dynamic form templates |
| **Authentication** | Email/password + OAuth, JWT (access + refresh tokens), email verification, password reset, role-based access (User → Pro Seller → Manager → Admin) |
| **Listing Management** | Multi-step creation wizard, dynamic form fields per category, media uploads via S3/MinIO, structured facts (price, year, mileage, condition) |
| **Company Directory** | Company profiles with verification, reviews, filtering by brand/activity/location, official dealer badges |
| **Search & Filtering** | Full-text search with PostgreSQL, saved search alerts |
| **Messaging** | Buyer ↔ Seller conversations per listing |
| **Admin Panel** | User/listing moderation, category & form template CRUD, support ticket handling, marketplace management |
| **Support System** | Ticketing with priority levels and assignment |
| **Dealer Leads** | Lead capture and CRM-style assignment pipeline |
| **Subscriptions** | SaaS plans & billing management |
| **i18n** | Ukrainian (default) + English, dictionary-based translation with hardcoded-text regression guard |
| **Security** | Helmet, rate limiting (Throttler), input validation (class-validator), bcrypt password hashing, production secret validation |

---

## Tech Stack

### Backend
- **NestJS 11** — modular REST API with guards, pipes, interceptors
- **PostgreSQL 16** — relational database with 40 models
- **Prisma 7** — type-safe ORM with migrations
- **Redis** — caching layer (ioredis)
- **S3 / MinIO** — file storage with presigned URLs
- **JWT** — access + refresh token authentication
- **Passport** — authentication strategies
- **Nodemailer** — transactional email

### Frontend
- **Next.js 16** — App Router with SSR/SSG
- **React 19** — latest React features
- **Tailwind CSS v4** — utility-first styling
- **TanStack React Query v5** — data fetching & caching
- **Zustand** — lightweight state management
- **Radix UI** — accessible component primitives
- **AOS** — scroll animations

### Infrastructure
- **Docker Compose** — local dev environment (PostgreSQL, Redis, MinIO, Mailpit)
- **Multi-stage Dockerfiles** — optimized production builds
- **Nginx** — reverse proxy with SSL, gzip, rate limiting

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (SSL)                        │
│                   Reverse Proxy                         │
├─────────────┬───────────────────────────┬───────────────┤
│             │                           │               │
│     ┌───────▼────────┐         ┌────────▼──────────┐    │
│     │   Next.js 16   │         │    NestJS 11      │    │
│     │   (Frontend)   │         │    (REST API)     │    │
│     │   Port 3001    │         │    Port 3000      │    │
│     └────────────────┘         └──────┬──────┬─────┘    │
│                                       │      │          │
│                              ┌────────▼┐  ┌──▼────┐     │
│                              │PostgreSQL│  │ Redis │     │
│                              │   :5432  │  │ :6379 │     │
│                              └─────────┘  └───────┘     │
│                                   │                     │
│                              ┌────▼────┐                │
│                              │  MinIO  │                │
│                              │ (S3)    │                │
│                              └─────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

**40 Prisma models** across these domains:

| Domain | Models |
|--------|--------|
| **Auth & Users** | User, OAuthAccount, Session, PasswordResetToken, EmailVerificationCode |
| **Companies** | Company, CompanyUser, CompanyPhone, CompanyMedia, CompanyActivityType, CompanyBrand, CompanyReview |
| **Listings** | Listing, ListingAttribute, ListingFact, ListingMedia, SellerContact, ListingSeller, ListingWizardState |
| **Marketplace** | Marketplace, Category, BrandCategory, Brand, ActivityType |
| **Templating** | FormTemplate, FormField, FieldOption |
| **Engagement** | Favorite, ViewHistory, SavedSearch, Notification |
| **Messaging** | Conversation, Message |
| **Support** | SupportTicket, TicketMessage |
| **Commerce** | DealerLead, Plan, Subscription |
| **Reference** | Country, City |

---

## API Modules

| Module | Purpose |
|--------|---------|
| `auth` | JWT authentication, OAuth, email verification, password reset |
| `users` | User CRUD & profile management |
| `companies` | Company directory, verification, reviews |
| `listings` | Listing CRUD, search, filtering, wizard state |
| `categories` | Hierarchical category tree management |
| `marketplaces` | Marketplace vertical configuration |
| `brands` | Brand management |
| `favorites` | User favorites |
| `saved-searches` | Saved search alerts |
| `messages` | Buyer ↔ Seller conversations |
| `notifications` | In-app notification system |
| `dealer-leads` | Lead capture & assignment |
| `subscriptions` / `plans` | SaaS plan management |
| `support` | Support ticket system |
| `upload` | S3-compatible file uploads with presigned URLs |
| `mail` | Transactional email service |
| `admin` | Admin panel APIs (moderation, templates, tickets) |
| `search` | Full-text search |

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with marketplace verticals |
| `/listings` | Listing search & browse with filters |
| `/ad-placement` | Multi-step listing creation wizard |
| `/companies` | Company directory |
| `/categories` | Category browser |
| `/pricing` | Subscription plans |
| `/cabinet/*` | User dashboard (favorites, listings, messages, notifications, settings, support) |
| `/admin/*` | Admin panel (users, listings, categories, templates, moderation, tickets) |
| `/(auth)/*` | Login, register, forgot/reset password, email verification |
| `/dealer-registration` | Dealer onboarding flow |

---

## Project Structure

```
marketplace-clone/
├── api/                          # NestJS backend
│   ├── prisma/                   # Schema, migrations, seed scripts
│   │   ├── schema.prisma         # 40 models
│   │   ├── migrations/           # 10 migrations
│   │   ├── seed-all.ts           # Deterministic seeding
│   │   └── seed-verify.ts        # Seed integrity verification
│   └── src/
│       ├── auth/                 # JWT + OAuth authentication
│       ├── listings/             # Core listing logic
│       ├── companies/            # Company directory
│       ├── admin/                # Admin panel APIs
│       ├── messages/             # Messaging system
│       ├── support/              # Support tickets
│       └── ... (20+ modules)
├── web/                          # Next.js frontend
│   └── src/
│       ├── app/                  # App Router pages
│       ├── components/           # Reusable UI components
│       ├── i18n/                 # UK/EN translations
│       ├── lib/                  # API client, utilities
│       ├── stores/               # Zustand stores
│       └── types/                # TypeScript types
├── docker-compose.yml            # Dev environment
├── docker-compose.prod.yml       # Production deployment
├── nginx/                        # Reverse proxy config
└── docs/                         # Project documentation
```

---

## Quick Start

### Prerequisites
- Node.js 22+, pnpm, Docker

### Development

```bash
# Start infrastructure (PostgreSQL, Redis, MinIO, Mailpit)
docker compose up -d

# Backend
cd api
pnpm install
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm start:dev

# Frontend (in another terminal)
cd web
pnpm install
pnpm dev
```

Backend: `http://localhost:3000` · Frontend: `http://localhost:3001`

### Seed Demo Data

```bash
cd api
pnpm run seed:all      # Seeds all tables with demo data
pnpm run seed:verify   # Verifies seed integrity
```

---

## License

Proprietary
