-- AlterTable
ALTER TABLE "category" ADD COLUMN     "has_engine" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "form_field" ADD COLUMN     "config" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "required_if" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "form_template" ADD COLUMN     "block_ids" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand_id" TEXT,
    "category_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_block" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "fields" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "model_brand_id_idx" ON "model"("brand_id");

-- CreateIndex
CREATE INDEX "model_category_id_idx" ON "model"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "model_name_brand_id_category_id_key" ON "model"("name", "brand_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_block_name_key" ON "form_block"("name");
