/*
  Warnings:

  - You are about to drop the column `iconUrl` on the `Agent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "iconUrl",
ADD COLUMN     "profileImageUrl" VARCHAR(255);
