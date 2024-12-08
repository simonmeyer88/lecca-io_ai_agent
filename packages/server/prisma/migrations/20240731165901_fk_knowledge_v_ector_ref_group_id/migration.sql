/*
  Warnings:

  - You are about to drop the column `knowledgeVectorRefGroupId` on the `KnowledgeVectorRef` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "KnowledgeVectorRef" DROP CONSTRAINT "KnowledgeVectorRef_knowledgeVectorRefGroupId_fkey";

-- AlterTable
ALTER TABLE "KnowledgeVectorRef" DROP COLUMN "knowledgeVectorRefGroupId",
ADD COLUMN     "FK_knowledgeVectorRefGroupId" TEXT;

-- AddForeignKey
ALTER TABLE "KnowledgeVectorRef" ADD CONSTRAINT "KnowledgeVectorRef_FK_knowledgeVectorRefGroupId_fkey" FOREIGN KEY ("FK_knowledgeVectorRefGroupId") REFERENCES "KnowledgeVectorRefGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
