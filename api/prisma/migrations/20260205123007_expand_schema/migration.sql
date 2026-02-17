-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('NEW', 'USED');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'NEGOTIABLE', 'ON_REQUEST');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('LOGO', 'COVER', 'GALLERY');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "countryId" TEXT,
ADD COLUMN     "isManufacturer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOfficialDealer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listingsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "utcOffsetMin" INTEGER;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "condition" "ListingCondition",
ADD COLUMN     "countryId" TEXT,
ADD COLUMN     "isVideo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceAmount" DOUBLE PRECISION,
ADD COLUMN     "priceCurrency" VARCHAR(3),
ADD COLUMN     "priceType" "PriceType",
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "year" INTEGER;

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "iso2" VARCHAR(2) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPhone" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "label" TEXT,
    "phoneE164" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompanyPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMedia" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyActivityType" (
    "companyId" TEXT NOT NULL,
    "activityTypeId" TEXT NOT NULL,

    CONSTRAINT "CompanyActivityType_pkey" PRIMARY KEY ("companyId","activityTypeId")
);

-- CreateTable
CREATE TABLE "CompanyBrand" (
    "companyId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "CompanyBrand_pkey" PRIMARY KEY ("companyId","brandId")
);

-- CreateTable
CREATE TABLE "CompanyReview" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingMedia" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListingMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAttribute" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ListingAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso2_key" ON "Country"("iso2");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "City"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityType_code_key" ON "ActivityType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "CompanyPhone_companyId_idx" ON "CompanyPhone"("companyId");

-- CreateIndex
CREATE INDEX "CompanyMedia_companyId_idx" ON "CompanyMedia"("companyId");

-- CreateIndex
CREATE INDEX "CompanyReview_companyId_idx" ON "CompanyReview"("companyId");

-- CreateIndex
CREATE INDEX "ListingMedia_listingId_idx" ON "ListingMedia"("listingId");

-- CreateIndex
CREATE INDEX "ListingAttribute_listingId_idx" ON "ListingAttribute"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingAttribute_listingId_key_key" ON "ListingAttribute"("listingId", "key");

-- CreateIndex
CREATE INDEX "Company_countryId_idx" ON "Company"("countryId");

-- CreateIndex
CREATE INDEX "Company_cityId_idx" ON "Company"("cityId");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_brandId_idx" ON "Listing"("brandId");

-- CreateIndex
CREATE INDEX "Listing_countryId_idx" ON "Listing"("countryId");

-- CreateIndex
CREATE INDEX "Listing_cityId_idx" ON "Listing"("cityId");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPhone" ADD CONSTRAINT "CompanyPhone_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMedia" ADD CONSTRAINT "CompanyMedia_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyActivityType" ADD CONSTRAINT "CompanyActivityType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyActivityType" ADD CONSTRAINT "CompanyActivityType_activityTypeId_fkey" FOREIGN KEY ("activityTypeId") REFERENCES "ActivityType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBrand" ADD CONSTRAINT "CompanyBrand_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBrand" ADD CONSTRAINT "CompanyBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyReview" ADD CONSTRAINT "CompanyReview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMedia" ADD CONSTRAINT "ListingMedia_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAttribute" ADD CONSTRAINT "ListingAttribute_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
