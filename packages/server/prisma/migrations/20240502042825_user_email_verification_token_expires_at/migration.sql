/*
  Warnings:

  - You are about to drop the column `emailVerificationTokenExpires` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationTokenExpires",
ADD COLUMN     "emailVerificationTokenExpiresAt" TIMESTAMP(3);
