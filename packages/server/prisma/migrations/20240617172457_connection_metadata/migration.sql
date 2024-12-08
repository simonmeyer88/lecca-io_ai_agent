/*
  Warnings:

  - You are about to drop the column `webhookIdentifier` on the `Connection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "webhookIdentifier",
ADD COLUMN     "metadata" JSONB;
