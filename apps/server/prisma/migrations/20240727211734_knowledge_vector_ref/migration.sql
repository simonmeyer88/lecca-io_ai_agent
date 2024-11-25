-- CreateTable
CREATE TABLE "KnowledgeVectorRef" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskMessageId" TEXT,
    "FK_knowledgeId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeVectorRef_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KnowledgeVectorRef" ADD CONSTRAINT "KnowledgeVectorRef_FK_knowledgeId_fkey" FOREIGN KEY ("FK_knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
