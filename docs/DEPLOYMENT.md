# Deployment Guide — АЛЬКОР Marketplace

## Architecture Overview

| Component | Technology | Port |
|-----------|-----------|------|
| **API** | NestJS 11, TypeScript | 3000 |
| **Web** | Next.js 16 (App Router), React 19 | 3000 |
| **Database** | PostgreSQL 16 | 5432 |
| **Cache** | Redis 7 | 6379 |
| **Object Storage** | S3-compatible (MinIO / AWS S3 / Cloudflare R2) | — |
| **Email** | SMTP (any provider) | 587 |
| **Reverse Proxy** | Nginx | 80/443 |

> **Note:** OpenSearch is in the dev compose file but is **not used** by the application — search runs on PostgreSQL via Prisma. You do not need to provision OpenSearch for production.

---

## Deployment Options

### Option A: VPS / Bare-metal with Docker Compose (Recommended for start)

**Best for:** Full control, predictable costs, single-server or small-scale deployments.  
**Providers:** Hetzner, DigitalOcean, Vultr, Linode, OVH, or any VPS.

**Minimum specs:** 2 vCPU, 4 GB RAM, 40 GB SSD (~$10-20/mo on Hetzner/DO).

#### Steps

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Clone the repo
git clone https://github.com/your-org/alcor-marketplace.git
cd alcor-marketplace

# 4. Configure environment
cp api/.env.example api/.env
cp web/.env.example web/.env.local
# Edit both files with production values (see "Environment Variables" below)

# 5. Set up SSL certificates (Let's Encrypt via certbot)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com -d api.your-domain.com
# Copy certs
mkdir -p nginx/certs
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/certs/

# 6. Update nginx/nginx.conf with your actual domain names

# 7. Create a .env file for docker-compose.prod.yml variables
cat > .env << 'EOF'
POSTGRES_USER=marketplace_prod
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=mpdb
REDIS_PASSWORD=$(openssl rand -base64 32)
DATABASE_URL=postgresql://marketplace_prod:${POSTGRES_PASSWORD}@postgres:5432/mpdb
NEXT_PUBLIC_API_URL=https://api.your-domain.com
EOF

# 8. Build and start everything
docker compose -f docker-compose.prod.yml up -d --build

# 9. Run database migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# 10. (Optional) Seed initial data
docker compose -f docker-compose.prod.yml exec api npx prisma db seed

# 11. Set up certificate auto-renewal
echo "0 0 1 * * certbot renew --deploy-hook 'docker restart mp_nginx'" | sudo crontab -
```

---

### Option B: Cloud PaaS (Zero Docker management)

#### Railway.app

**Best for:** Fast deploys, managed PostgreSQL + Redis, auto-SSL.

1. Create a Railway project with two services:
   - **API service:** Root directory = `api/`, build command = `pnpm install && npx prisma generate && pnpm build`, start = `node dist/main.js`
   - **Web service:** Root directory = `web/`, build command = `pnpm install && pnpm build`, start = `node .next/standalone/server.js`
2. Add Railway PostgreSQL + Redis plugins
3. Set environment variables in the Railway dashboard (see table below)
4. Railway auto-assigns domains with SSL

#### Render.com

**Best for:** Free tier available, auto-deploy from Git.

1. Create two **Web Services**:
   - **API:** Root = `api/`, build = `pnpm install && npx prisma generate && pnpm build`, start = `npx prisma migrate deploy && node dist/main.js`
   - **Web:** Root = `web/`, build = `pnpm install && pnpm build`, start = `node .next/standalone/server.js`
2. Add managed PostgreSQL and Redis instances from Render dashboard
3. Set env vars, Render handles SSL + custom domains

#### Fly.io

**Best for:** Edge deployment, built-in Docker support.

```bash
# API
cd api
fly launch --name alcor-api
fly secrets set JWT_SECRET="..." DATABASE_URL="..." # etc.
fly deploy

# Web
cd web
fly launch --name alcor-web
fly secrets set NEXT_PUBLIC_API_URL="https://alcor-api.fly.dev"
fly deploy
```

---

### Option C: AWS / GCP / Azure (Enterprise-scale)

| AWS Service | Purpose |
|---|---|
| **ECS Fargate** or **EKS** | Container orchestration |
| **RDS PostgreSQL** | Managed database |
| **ElastiCache Redis** | Managed cache |
| **S3** | Object storage |
| **CloudFront** | CDN |
| **SES** | Email |
| **ALB** | Load balancer + SSL |
| **ACM** | Free SSL certificates |
| **Secrets Manager** | Secure env vars |

---

## Environment Variables Reference

### API (`api/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Default: `3000` |
| `FRONTEND_URL` | **Yes** | Full URL of the frontend (CORS origin) |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with `?sslmode=require` |
| `REDIS_URL` | **Yes** | Redis connection URL (`rediss://` for TLS) |
| `JWT_SECRET` | **Yes** | ≥32 chars, high-entropy (`openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | No | Default: `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Default: `7d` |
| `UPLOAD_GUEST_TOKEN_SECRET` | **Yes** | ≥32 chars, must differ from JWT_SECRET |
| `S3_ENDPOINT` | **Yes** | S3-compatible endpoint URL |
| `S3_REGION` | No | Default: `us-east-1` |
| `S3_BUCKET` | **Yes** | Bucket name |
| `S3_ACCESS_KEY_ID` | **Yes** | Not `minioadmin` |
| `S3_SECRET_ACCESS_KEY` | **Yes** | ≥24 chars |
| `S3_PUBLIC_URL` | **Yes** | Public URL for accessing uploaded files |
| `SMTP_HOST` | **Yes** | SMTP server hostname |
| `SMTP_PORT` | **Yes** | `587` (STARTTLS) or `465` (SSL) |
| `MAIL_FROM` | No | Default: `noreply@alcor.com` |

### Web (`web/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Full URL of the API (baked into JS at build time) |
| `TRANSLATION_EXTERNAL_ENABLED` | No | Default: `true` |
| `TRANSLATION_ALLOW_PII` | No | Default: `false` |

---

## Generate Secrets

```bash
# JWT Secret (48 bytes = 64 chars base64)
openssl rand -base64 48

# Upload Guest Token Secret
openssl rand -base64 48

# Database password
openssl rand -base64 32

# Redis password
openssl rand -base64 32
```

---

## Database Migrations in Production

```bash
# Apply all pending migrations (safe, non-destructive)
npx prisma migrate deploy

# NEVER run `prisma migrate dev` in production — it resets data!
```

---

## Health Checks

- **API:** `GET /` — returns 200 if the service is running
- **Web:** `GET /` — returns 200 (Next.js serves the landing page)

---

## Backup Strategy

```bash
# PostgreSQL backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup_20260218.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U $POSTGRES_USER $POSTGRES_DB
```

---

## SSL / HTTPS

- **VPS:** Use Let's Encrypt with certbot (free, auto-renewing)
- **PaaS:** SSL is automatic (Railway, Render, Fly.io, Vercel)
- **AWS:** Use ACM (free certificates) + ALB termination

---

## Monitoring Recommendations

| Tool | Purpose | Cost |
|---|---|---|
| **UptimeRobot** / **BetterStack** | Uptime monitoring + alerts | Free tier |
| **Sentry** | Error tracking (API + Web) | Free tier |
| **Grafana Cloud** | Metrics + dashboards | Free tier |
| **pganalyze** or **Supabase Studio** | PostgreSQL monitoring | Varies |

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: cd api && pnpm install --frozen-lockfile
      - run: cd api && npx prisma generate
      - run: cd api && pnpm build
      - run: cd api && pnpm test
      - run: cd web && pnpm install --frozen-lockfile
      - run: cd web && pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Choose ONE of these deploy steps:

      # Option A: SSH to VPS
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/alcor-marketplace
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
            docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

      # Option B: Railway
      # - uses: railwayapp/cli-action@v1
      #   with:
      #     token: ${{ secrets.RAILWAY_TOKEN }}
      #     command: up

      # Option C: Fly.io
      # - uses: superfly/flyctl-actions/setup-flyctl@master
      # - run: cd api && flyctl deploy --remote-only
      # - run: cd web && flyctl deploy --remote-only
```

---

## Quick Start Checklist

- [ ] Choose a deployment platform (VPS / PaaS / Cloud)
- [ ] Provision PostgreSQL 16 and Redis 7
- [ ] Provision S3-compatible storage (AWS S3, Cloudflare R2, or MinIO)
- [ ] Set up SMTP email (SendGrid, Mailgun, AWS SES, etc.)
- [ ] Generate all secrets (`openssl rand -base64 48`)
- [ ] Configure DNS: `your-domain.com` → web, `api.your-domain.com` → api
- [ ] Set all environment variables
- [ ] Build and deploy containers
- [ ] Run `npx prisma migrate deploy`
- [ ] Seed initial data (categories, marketplaces, plans)
- [ ] Set up SSL certificates
- [ ] Configure monitoring and alerts
- [ ] Set up automated backups
- [ ] Test all critical flows (register, login, create listing, upload images)
