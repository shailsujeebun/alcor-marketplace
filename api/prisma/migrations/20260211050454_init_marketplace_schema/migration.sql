/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Listing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListingAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListingMedia` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `listingId` on the `Conversation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `listingId` on the `Favorite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `listingId` on the `ViewHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MediaKind" ADD VALUE 'PHOTO';
ALTER TYPE "MediaKind" ADD VALUE 'VIDEO';
ALTER TYPE "MediaKind" ADD VALUE 'PDF';

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_ownerUserId_fkey";

-- DropForeignKey
ALTER TABLE "ListingAttribute" DROP CONSTRAINT "ListingAttribute_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingMedia" DROP CONSTRAINT "ListingMedia_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ViewHistory" DROP CONSTRAINT "ViewHistory_listingId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "listingId",
ADD COLUMN     "listingId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "listingId",
ADD COLUMN     "listingId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "ViewHistory" DROP COLUMN "listingId",
ADD COLUMN     "listingId" BIGINT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Listing";

-- DropTable
DROP TABLE "ListingAttribute";

-- DropTable
DROP TABLE "ListingMedia";

-- CreateTable
CREATE TABLE "marketplace" (
    "marketplace_id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_pkey" PRIMARY KEY ("marketplace_id")
);

-- CreateTable
CREATE TABLE "category" (
    "category_id" BIGSERIAL NOT NULL,
    "marketplace_id" BIGINT NOT NULL,
    "parent_id" BIGINT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER,

    CONSTRAINT "category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "form_template" (
    "template_id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_template_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "form_field" (
    "field_id" BIGSERIAL NOT NULL,
    "template_id" BIGINT NOT NULL,
    "field_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "help_text" TEXT,
    "validations" JSONB NOT NULL DEFAULT '{}',
    "visibility_if" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "form_field_pkey" PRIMARY KEY ("field_id")
);

-- CreateTable
CREATE TABLE "field_option" (
    "option_id" BIGSERIAL NOT NULL,
    "field_id" BIGINT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER,

    CONSTRAINT "field_option_pkey" PRIMARY KEY ("option_id")
);

-- CreateTable
CREATE TABLE "listing" (
    "listing_id" BIGSERIAL NOT NULL,
    "marketplace_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "companyId" TEXT,
    "ownerUserId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "description_lang" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "countryId" TEXT,
    "cityId" TEXT,
    "brandId" TEXT,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "listing_attribute" (
    "listing_id" BIGINT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "listing_attribute_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "listing_fact" (
    "listing_id" BIGINT NOT NULL,
    "price_amount" DECIMAL(14,2),
    "price_currency" TEXT,
    "vat_type" TEXT,
    "year" INTEGER,
    "mileage_km" INTEGER,
    "condition" TEXT,
    "country" TEXT,
    "city" TEXT,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),

    CONSTRAINT "listing_fact_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "listing_media" (
    "media_id" BIGSERIAL NOT NULL,
    "listing_id" BIGINT NOT NULL,
    "type" "MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER,
    "meta" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "listing_media_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "seller_contact" (
    "seller_contact_id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_country" CHAR(2) NOT NULL,
    "phone_number" TEXT NOT NULL,
    "partner_code" TEXT,
    "privacy_consent" BOOLEAN NOT NULL,
    "terms_consent" BOOLEAN NOT NULL,
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_contact_pkey" PRIMARY KEY ("seller_contact_id")
);

-- CreateTable
CREATE TABLE "listing_seller" (
    "listing_id" BIGINT NOT NULL,
    "seller_contact_id" BIGINT NOT NULL,

    CONSTRAINT "listing_seller_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "listing_wizard_state" (
    "listing_id" BIGINT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "completed_steps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_wizard_state_pkey" PRIMARY KEY ("listing_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_key_key" ON "marketplace"("key");

-- CreateIndex
CREATE UNIQUE INDEX "category_marketplace_id_slug_key" ON "category"("marketplace_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "form_template_category_id_version_key" ON "form_template"("category_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "form_field_template_id_field_key_key" ON "form_field"("template_id", "field_key");

-- CreateIndex
CREATE UNIQUE INDEX "field_option_field_id_value_key" ON "field_option"("field_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "listing_media_listing_id_url_key" ON "listing_media"("listing_id", "url");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_listingId_buyerId_sellerId_key" ON "Conversation"("listingId", "buyerId", "sellerId");

-- CreateIndex
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "ViewHistory_listingId_idx" ON "ViewHistory"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewHistory_userId_listingId_key" ON "ViewHistory"("userId", "listingId");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_marketplace_id_fkey" FOREIGN KEY ("marketplace_id") REFERENCES "marketplace"("marketplace_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "form_template"("template_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_option" ADD CONSTRAINT "field_option_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "form_field"("field_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_marketplace_id_fkey" FOREIGN KEY ("marketplace_id") REFERENCES "marketplace"("marketplace_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_attribute" ADD CONSTRAINT "listing_attribute_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_fact" ADD CONSTRAINT "listing_fact_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_seller" ADD CONSTRAINT "listing_seller_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_seller" ADD CONSTRAINT "listing_seller_seller_contact_id_fkey" FOREIGN KEY ("seller_contact_id") REFERENCES "seller_contact"("seller_contact_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_wizard_state" ADD CONSTRAINT "listing_wizard_state_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewHistory" ADD CONSTRAINT "ViewHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;
