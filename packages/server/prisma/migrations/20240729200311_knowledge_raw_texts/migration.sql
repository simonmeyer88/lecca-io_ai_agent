-- AlterTable
ALTER TABLE "KnowledgeVectorRef" ADD COLUMN     "rawKnowledgeTextId" TEXT;

-- CreateTable
CREATE TABLE "RawKnowledgeText" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" VARCHAR(10000) NOT NULL,
    "FK_knowledgeId" TEXT NOT NULL,

    CONSTRAINT "RawKnowledgeText_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RawKnowledgeText" ADD CONSTRAINT "RawKnowledgeText_FK_knowledgeId_fkey" FOREIGN KEY ("FK_knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
