/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `CompanyLocation` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `CompanyLocationAddress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompanyLocationAddress" DROP CONSTRAINT "CompanyLocationAddress_FK_location_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "CompanyLocation" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "CompanyLocationAddress" DROP COLUMN "deletedAt";

-- AddForeignKey
ALTER TABLE "CompanyLocationAddress" ADD CONSTRAINT "CompanyLocationAddress_FK_location_fkey" FOREIGN KEY ("FK_location") REFERENCES "CompanyLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
