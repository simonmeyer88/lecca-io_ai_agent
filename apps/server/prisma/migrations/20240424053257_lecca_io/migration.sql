/*
  Warnings:

  - You are about to drop the column `FK_activeCompanyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyInvitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyLocationAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyPreferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyUserPreferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkspaceUserRole" AS ENUM ('ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "WorkspaceUserPreferencesTheme" AS ENUM ('DARK', 'LIGHT');

-- CreateEnum
CREATE TYPE "WorkspaceUserPreferencesLocale" AS ENUM ('en', 'es');

-- DropForeignKey
ALTER TABLE "CompanyInvitation" DROP CONSTRAINT "CompanyInvitation_FK_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyLocation" DROP CONSTRAINT "CompanyLocation_FK_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyLocationAddress" DROP CONSTRAINT "CompanyLocationAddress_FK_location_fkey";

-- DropForeignKey
ALTER TABLE "CompanyPreferences" DROP CONSTRAINT "CompanyPreferences_FK_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyUser" DROP CONSTRAINT "CompanyUser_FK_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyUser" DROP CONSTRAINT "CompanyUser_FK_userId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyUserPreferences" DROP CONSTRAINT "CompanyUserPreferences_FK_companyUserId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_FK_activeCompanyId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "FK_activeCompanyId",
ADD COLUMN     "FK_activeWorkspaceId" TEXT;

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "CompanyInvitation";

-- DropTable
DROP TABLE "CompanyLocation";

-- DropTable
DROP TABLE "CompanyLocationAddress";

-- DropTable
DROP TABLE "CompanyPreferences";

-- DropTable
DROP TABLE "CompanyUser";

-- DropTable
DROP TABLE "CompanyUserPreferences";

-- DropEnum
DROP TYPE "CompanyUserPreferencesLocale";

-- DropEnum
DROP TYPE "CompanyUserPreferencesTheme";

-- DropEnum
DROP TYPE "CompanyUserRole";

-- CreateTable
CREATE TABLE "WorkspaceUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "profileImageUrl" VARCHAR(255),
    "roles" "WorkspaceUserRole"[] DEFAULT ARRAY[]::"WorkspaceUserRole"[],
    "FK_userId" TEXT NOT NULL,
    "FK_workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUserPreferences" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "theme" "WorkspaceUserPreferencesTheme" NOT NULL DEFAULT 'LIGHT',
    "locale" "WorkspaceUserPreferencesLocale" NOT NULL DEFAULT 'en',
    "FK_workspaceUserId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceUserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspacePreferences" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspacePreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceLocation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "coordinates" JSONB,
    "FK_workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceLocationAddress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "street1" VARCHAR(100) NOT NULL,
    "street2" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "FK_location" TEXT NOT NULL,

    CONSTRAINT "WorkspaceLocationAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceInvitation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "roles" "WorkspaceUserRole"[] DEFAULT ARRAY[]::"WorkspaceUserRole"[],
    "FK_workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUserPreferences_FK_workspaceUserId_key" ON "WorkspaceUserPreferences"("FK_workspaceUserId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspacePreferences_FK_workspaceId_key" ON "WorkspacePreferences"("FK_workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceLocationAddress_FK_location_key" ON "WorkspaceLocationAddress"("FK_location");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_FK_activeWorkspaceId_fkey" FOREIGN KEY ("FK_activeWorkspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_FK_userId_fkey" FOREIGN KEY ("FK_userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUserPreferences" ADD CONSTRAINT "WorkspaceUserPreferences_FK_workspaceUserId_fkey" FOREIGN KEY ("FK_workspaceUserId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspacePreferences" ADD CONSTRAINT "WorkspacePreferences_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceLocation" ADD CONSTRAINT "WorkspaceLocation_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceLocationAddress" ADD CONSTRAINT "WorkspaceLocationAddress_FK_location_fkey" FOREIGN KEY ("FK_location") REFERENCES "WorkspaceLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvitation" ADD CONSTRAINT "WorkspaceInvitation_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
