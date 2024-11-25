/*
  Warnings:

  - You are about to drop the column `credits` on the `WorkspaceUsage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "defaultCreatedWorkspace" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkspaceUsage" DROP COLUMN "credits",
ADD COLUMN     "allottedCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "purchasedCredits" INTEGER NOT NULL DEFAULT 0;
