-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'FROM_MANUFACTURER');

-- AlterEnum
ALTER TYPE "ListingCondition" ADD VALUE 'DEMO';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "languages" TEXT,
ADD COLUMN     "photosCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingSource" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "workingHours" TEXT,
ADD COLUMN     "yearsOnMarket" INTEGER,
ADD COLUMN     "yearsOnPlatform" INTEGER;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "euroClass" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "hoursUnit" TEXT DEFAULT 'м/г',
ADD COLUMN     "hoursValue" INTEGER,
ADD COLUMN     "listingType" "ListingType";
