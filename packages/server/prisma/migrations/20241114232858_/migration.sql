/*
  Warnings:

  - You are about to drop the column `metadata` on the `Credit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Credit" DROP COLUMN "metadata",
ADD COLUMN     "details" JSONB;
