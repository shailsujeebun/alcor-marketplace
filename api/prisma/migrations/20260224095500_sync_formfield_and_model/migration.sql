-- Align DB schema with current Prisma models used by seed/runtime
ALTER TABLE "form_block" ALTER COLUMN "updated_at" DROP DEFAULT;

ALTER TABLE "form_field"
  ADD COLUMN IF NOT EXISTS "config" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "required_if" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "section" TEXT;

CREATE TABLE IF NOT EXISTS "model" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "brand_id" TEXT,
  "category_id" BIGINT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "model_brand_id_idx" ON "model"("brand_id");
CREATE INDEX IF NOT EXISTS "model_category_id_idx" ON "model"("category_id");
CREATE UNIQUE INDEX IF NOT EXISTS "model_name_brand_id_category_id_key" ON "model"("name", "brand_id", "category_id");

DO $$ BEGIN
  ALTER TABLE "model"
    ADD CONSTRAINT "model_brand_id_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "Brand"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "model"
    ADD CONSTRAINT "model_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "category"("category_id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
