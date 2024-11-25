/*
  Warnings:

  - You are about to drop the column `description` on the `KnowledgeVectorRef` table. All the data in the column will be lost.
  - You are about to drop the column `rawKnowledgeTextId` on the `KnowledgeVectorRef` table. All the data in the column will be lost.
  - You are about to drop the column `taskMessageId` on the `KnowledgeVectorRef` table. All the data in the column will be lost.
  - You are about to drop the `RawKnowledgeText` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RawKnowledgeText" DROP CONSTRAINT "RawKnowledgeText_FK_knowledgeId_fkey";

-- AlterTable
ALTER TABLE "KnowledgeVectorRef" DROP COLUMN "description",
DROP COLUMN "rawKnowledgeTextId",
DROP COLUMN "taskMessageId";

-- DropTable
DROP TABLE "RawKnowledgeText";
