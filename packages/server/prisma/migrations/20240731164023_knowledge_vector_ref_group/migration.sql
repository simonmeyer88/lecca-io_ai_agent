-- AlterTable
ALTER TABLE "KnowledgeVectorRef" ADD COLUMN     "knowledgeVectorRefGroupId" TEXT;

-- CreateTable
CREATE TABLE "KnowledgeVectorRefGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeVectorRefGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KnowledgeVectorRef" ADD CONSTRAINT "KnowledgeVectorRef_knowledgeVectorRefGroupId_fkey" FOREIGN KEY ("knowledgeVectorRefGroupId") REFERENCES "KnowledgeVectorRefGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
