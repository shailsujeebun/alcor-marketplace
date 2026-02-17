-- CreateTable
CREATE TABLE "brand_category" (
  "brandId" TEXT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "brand_category_pkey" PRIMARY KEY ("brandId", "category_id")
);

-- CreateIndex
CREATE INDEX "brand_category_category_id_idx" ON "brand_category"("category_id");

-- AddForeignKey
ALTER TABLE "brand_category"
  ADD CONSTRAINT "brand_category_brandId_fkey"
  FOREIGN KEY ("brandId") REFERENCES "Brand"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_category"
  ADD CONSTRAINT "brand_category_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "category"("category_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
