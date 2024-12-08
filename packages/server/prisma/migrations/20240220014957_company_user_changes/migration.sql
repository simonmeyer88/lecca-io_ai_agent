/*
  Warnings:

  - You are about to drop the column `email` on the `CompanyUser` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `CompanyUser` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `CompanyUser` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `CompanyUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CompanyUser_email_key";

-- AlterTable
ALTER TABLE "CompanyUser" DROP COLUMN "email",
DROP COLUMN "emailVerifiedAt",
DROP COLUMN "name",
DROP COLUMN "password";
