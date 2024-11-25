/*
  Warnings:

  - You are about to drop the column `appsIds` on the `Workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "appsIds",
ADD COLUMN     "appIds" TEXT[];
