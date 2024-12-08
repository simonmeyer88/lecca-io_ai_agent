/*
  Warnings:

  - You are about to alter the column `name` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- CreateEnum
CREATE TYPE "CompanyUserRole" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "FK_organizationId" TEXT,
ADD COLUMN     "rootProfileImageUrl" VARCHAR(255);

-- CreateTable
CREATE TABLE "CompanyUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "email" VARCHAR(255) NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100),
    "profileImageUrl" VARCHAR(255),
    "roles" "CompanyUserRole"[],
    "FK_userId" TEXT NOT NULL,
    "FK_companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLocation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" VARCHAR(100) NOT NULL,
    "coordinates" JSONB,
    "FK_companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLocationAddress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "street1" VARCHAR(100) NOT NULL,
    "street2" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "FK_location" TEXT NOT NULL,

    CONSTRAINT "CompanyLocationAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyUser_email_key" ON "CompanyUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyLocationAddress_FK_location_key" ON "CompanyLocationAddress"("FK_location");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_FK_organizationId_fkey" FOREIGN KEY ("FK_organizationId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_FK_userId_fkey" FOREIGN KEY ("FK_userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_FK_companyId_fkey" FOREIGN KEY ("FK_companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLocation" ADD CONSTRAINT "CompanyLocation_FK_companyId_fkey" FOREIGN KEY ("FK_companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLocationAddress" ADD CONSTRAINT "CompanyLocationAddress_FK_location_fkey" FOREIGN KEY ("FK_location") REFERENCES "CompanyLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
