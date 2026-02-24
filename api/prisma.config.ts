import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx ts-node prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://mp:mp@127.0.0.1:5440/mpdb?schema=public",
  },

});
