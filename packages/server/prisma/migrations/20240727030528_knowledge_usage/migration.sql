-- CreateTable
CREATE TABLE "KnowledgeUsage" (
    "id" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "FK_knowledgeId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeUsage_FK_knowledgeId_key" ON "KnowledgeUsage"("FK_knowledgeId");

-- AddForeignKey
ALTER TABLE "KnowledgeUsage" ADD CONSTRAINT "KnowledgeUsage_FK_knowledgeId_fkey" FOREIGN KEY ("FK_knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
