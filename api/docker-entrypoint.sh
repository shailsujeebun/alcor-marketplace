#!/bin/sh
set -e

echo "=== Running Prisma migrations ==="
npx prisma migrate deploy

# Seed if SEED_ON_DEPLOY is set and database is empty
if [ "$SEED_ON_DEPLOY" = "true" ]; then
  echo "=== Checking if database needs seeding ==="
  # Check if any users exist (simple check)
  USER_COUNT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    async function check() {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });
      const count = await prisma.user.count();
      console.log(count);
      await prisma.\$disconnect();
      await pool.end();
    }
    check().catch(() => { console.log('0'); process.exit(0); });
  " 2>/dev/null || echo "0")

  if [ "$USER_COUNT" = "0" ]; then
    echo "=== Database is empty, seeding demo data ==="
    node dist-seed/prisma/seed-all.js
    echo "=== Seeding complete ==="
  else
    echo "=== Database already has data ($USER_COUNT users), skipping seed ==="
  fi
fi

echo "=== Starting API server ==="
exec node dist/main.js
