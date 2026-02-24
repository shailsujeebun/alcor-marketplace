CREATE TABLE IF NOT EXISTS "form_block" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "fields" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "form_block_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "form_block_name_key" UNIQUE ("name")
);
