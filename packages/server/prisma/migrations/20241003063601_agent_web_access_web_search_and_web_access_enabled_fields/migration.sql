/*
  Warnings:

  - You are about to drop the column `canScrapeWebsites` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `canSearchWeb` on the `Agent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "canScrapeWebsites",
DROP COLUMN "canSearchWeb";

-- AlterTable
ALTER TABLE "AgentWebAccess" ADD COLUMN     "webSearchEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "websiteAccessEnabled" BOOLEAN NOT NULL DEFAULT true;
