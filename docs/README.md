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
